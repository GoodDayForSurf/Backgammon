<script setup>
import { computed, reactive, ref } from 'vue';
import { longs } from './rules-long.js'
import chipComponent  from '@/components/chip.vue'
import dices from '@/components/dices.vue';

const rules = longs;
const holders = reactive(Array.from({ length: 24 }, (_,i) => ({chips: [], nmb: i + 1})));
const chips = ['black', 'white'].flatMap(
    (color) => Array.from({ length: 15 }).map(
        (_, i) => (reactive({
          color,
          id: color + '_' + i,
        }))
    ));

chips.forEach(chip => moveChip(chip,1));

let highlightedHolders = ref([]);
const dicesRef = ref(null);
const clickSoundRef = ref(null);
const dicesSoundRef = ref(null);
const soundRef = ref(null);
const game = reactive({
  chips,
  holders,
  selectedChip: null,
  step: 'waiting-roll',
  currentPlayer: Math.random() > 0.5 ? 'black' : 'white',
});

const whiteChipsOut = computed(() => game.chips.filter(ch => ch.color == 'white' && ch.position > 24).length);
const blackChipsOut = computed(() => game.chips.filter(ch => ch.color == 'black' && ch.position > 24).length);;

function isWhiteTurn() { return game.currentPlayer === 'white' }

function getChipHolder(color, position) {
  if (position && color === 'black') {
    position = position < 13 ? position + 12 : position - 12;
  }

  return position ? holders[position - 1] : null;
}

function getChipMarker(chip) {
  const holder = getChipHolder(chip.color, chip.position);
  const length = holder.chips.length;

  return holder.chips.at(-1) === chip && length > 1 ? `${length}` : '';
}

const onChipClick = (chip) => {
  if(getChipHolder(chip.color, chip.position).chips.at(-1).id !== chip.id) {
    return;
  }

  if(chip.color !== game.currentPlayer || game.step !== 'moving') {
    return;
  }

  if(rules.isChipSelectable(game, chip)) {
    selectChip(chip);
  }
}

function selectChip(chip) {
  game.selectedChip = chip;
  highlightedHolders.value = rules.getAllowedHolders(game, chip).map((h) => h.nmb);
}

const onHolderClick = (holderNmb) => {
  if(!game.selectedChip || !highlightedHolders.value.includes(holderNmb)) { return }

  clickSoundRef.value.play();

  const position = isWhiteTurn()
      ? holderNmb
      : holderNmb > 12
          ? holderNmb - 12 : holderNmb + 12;

  const selectedChip = game.selectedChip;

  moveChip(selectedChip, position);
  updateDicesAfterChipMove(selectedChip);
  switchToNextTurn();
}

function moveChip(chip, position) {
  const fromHolder = getChipHolder(chip.color, chip.position);

  fromHolder?.chips.pop();
  chip.prevPosition = chip.position;
  chip.position = position;

  if( position > 24) {
    return;
  }

  const toHolder = getChipHolder(chip.color, chip.position);

  toHolder.chips.push(chip);

  chip.offsetStyle = {'z-index': toHolder.chips.indexOf(chip)}

  chip.prevPosition && rules.movingDone(game, chip);
}

function updateDicesAfterChipMove(chip) {
  const diff = chip.position - chip.prevPosition;
  const [d1, d2] = game.diceValues.map(d => d.value);

  if (game.diceValues.length === 2) {
    if (diff === d1 + d2) {
      game.diceValues.forEach(d => d.disabled = true);
    } else {
      game.diceValues[(diff === d1) ? 0 : 1].disabled = true;
    }
  } else {
    const dCount = game.diceValues.map((_, i) => i + 1).find( (i) => diff === d1 * i);
    game.diceValues.filter(d => !d.disabled).forEach((d, i) => {
      if (i < dCount) {
        d.disabled = true
      }
    });
  }
}

function switchToNextTurn() {
  clearSelection();

  if (game.diceValues.find(d => !d.disabled)) {

  } else {
    switchPlayer();
  }
}

function switchPlayer() {
  clearSelection();
  game.currentPlayer = game.currentPlayer === 'black' ? 'white' : 'black';
  game.headIsUsed = false;
  game.step = 'waiting-roll';
}

function clearSelection() {
  game.selectedChip = null;
  highlightedHolders.value = [];
}

function onDiceRolled(values) {
  game.diceValues = rules.getDiceValues(values).map(d => ({value: d, disabled: false}));
  game.step = 'moving';
}

function onDicesClick() {
  if( game.step === 'waiting-roll') {
    game.step = 'moving';
    dicesSoundRef.value.play();
    game.diceValues = [];
    dicesRef.value.roll();
  }
}

function showSkip() {
  return rules.isSkipAllowed(game);
}

function onSkipClick() {
  switchPlayer();
}

function showOutBtn() {
  const selectedChip = game.selectedChip;

  return selectedChip && rules.isChipOutable(game, selectedChip);
}

function onOutClick() {
  const variants = rules.getNextPositionVariants(game, game.selectedChip, false).filter(v => v > 24).sort();

  moveChip(game.selectedChip, variants[0]);
  updateDicesAfterChipMove(selectedChip);
  checkWin();
  switchToNextTurn();
}

function checkWin() {
  const isAllChipsDone = !game.chips.find((chip) => chip.position > 1 && game.currentPlayer === chip.color)
  if(isAllChipsDone) {
    soundRef.value.play();
    document.querySelector(`.win-container .${game.currentPlayer}`)?.classList.add('animate')
  }
}
</script>

<template>
  <audio ref="clickSoundRef" src="wood-block.mp3"></audio>
  <audio ref="dicesSoundRef" src="dices.mp3" volume="0.3"></audio>
  <audio ref="soundRef" src="win.mp3"></audio>
  <div class="board">
    <dices ref="dicesRef"
           :style="{
                position: 'absolute',
                [isWhiteTurn() ? 'right' : 'left']: '0',
                transform: [isWhiteTurn() ? 'none' : 'rotate(180deg)']
            }"
           @click="() => onDicesClick()"
           @ready="onDiceRolled"
           :values="game.diceValues"
           :gameState="game.step"/>

    <div v-if="showSkip()"
         class="skip-btn"
         :style="{
                    position: 'absolute',
                    [isWhiteTurn() ? 'right' : 'left']: '25%',
                    transform: 'rotate(' + (isWhiteTurn() ? '0' : '180') + 'deg)'
                  }"
         @click="onSkipClick"
    >SKIP</div>

    <div v-if="showOutBtn()"
         class="out-btn"
         :style="{
                    position: 'absolute',
                    [isWhiteTurn() ? 'right' : 'left']: '25%',
                    transform: 'rotate(' + (isWhiteTurn() ? '0' : '180') + 'deg)'
                  }"
         @click="onOutClick"
    ><img :src="'arrow-right-circle.svg'"></div>
    <div class="win-container">
      <div class="black"></div>
      <div class="white"></div>
    </div>
    <div class="board-inner">
      <div v-for="(_, i) in 12"
           class="chip-holder"
           :class="{highlighted: highlightedHolders.includes(12 - i)}"
           :style="{left: `calc(${i}  * var(--chip-size))`}"
           @click="() => onHolderClick(12 - i)"
      />
      <div style="position: relative; top: 100vh; transform: rotate(180deg);">
        <div v-for="(_, i) in 12"
             class="chip-holder"
             :class="{highlighted: highlightedHolders.includes(24 - i)}"
             @click="() => onHolderClick(24 - i)"
             :style="{left: `calc(${i}  * var(--chip-size))`}"/>
      </div>
      <template v-for="(chip, i) in chips">
        <chipComponent v-if="chip.position < 25"
            :color="chip.color"
              :class="{'selected': game.selectedChip?.id === chip.id}"
              :position="chip.position"
              :style="chip.offsetStyle"
              :marker="getChipMarker(chip)"
              @click="() => onChipClick(chip)"
        />
        </template>
    </div>
      <div class="board-middle"></div>
    <div v-if="blackChipsOut" class="chip chip-out">{{blackChipsOut}}</div>
    <div v-if="whiteChipsOut" class="chip white chip-out">{{whiteChipsOut}}</div>

  </div>
</template>
<style src="./App.scss" lang="scss">
</style>
<style lang="scss">

.selected {
  filter: drop-shadow(0 0 7px #3def22);
  box-shadow: 0 0 20px #5ac34a;
}

.win-container {
  content:  '★';
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20vh;
  width: var(--board-width);
  max-width: var(--board-width);
  z-index: 1;

  .white,
  .black {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    background: url("public/star.svg") no-repeat center;
    background-size: contain;
    height: 20vh;

    &.animate {
      animation: rotate 3s linear 1;
    }
  }

  .white {
    filter: invert(0.9);
  }

}
</style>
