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

const selectedChipId = ref(null);

let highlightedHolders = ref([]);
const dicesRef = ref(null);
const game = reactive({
  chips,
  step: 'waiting-roll',
  currentPlayer: Math.random() > 0.5 ? 'black' : 'white',
});

const whiteChipsOut = computed(() => game.chips.filter(ch => ch.color == 'white' && ch.position > 24).length);
const blackChipsOut = computed(() => game.chips.filter(ch => ch.color == 'black' && ch.position > 24).length);;

function isWhiteTurn() { return game.currentPlayer === 'white' }

function getChipById(chipId) { return chips.find(c => c.id === chipId)}
function getSelectedChip() { return getChipById(selectedChipId.value)}

function getEnabledDices() {
  return game.diceValues?.filter(d => !d.disabled) || [];
}

function getChipHolder(color, position) {
  if (position && color === 'black') {
    position = position < 13 ? position + 12 : position - 12;
  }

  return position ? holders[position - 1] : null;
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
  selectedChipId.value = chip.id;
  highlightedHolders.value = getAllowedHolders(chip).map((h) => h.nmb);
  console.log('-----holders----->', highlightedHolders);
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

  const offsetProp = ((chip.color === 'white' && chip.position < 13) || (chip.color === 'black' && chip.position > 12) ? 'top': 'bottom')

  chip.offsetStyle = {
    ['margin-' + offsetProp] : `calc(0.35 * ${toHolder.chips.length - 1}  * var(--chip-size))`,
    'z-index': toHolder.chips.indexOf(chip),
  }

  chip.prevPosition && rules.movingDone(game, chip);
}

function getAllowedHolders(chip) {
 const variants = rules.getNextPositionVariants(game, chip);
  console.log('-----variants----->', variants);
 return variants.map(position => getChipHolder(chip.color, position)).filter(holder => {
   return rules.isHolderAllowed(holder, chip);
 })
}

const onHolderClick = (holderNmb) => {
  if(!selectedChipId.value || !highlightedHolders.value.includes(holderNmb)) { return }

  const position = isWhiteTurn()
      ? holderNmb
      : holderNmb > 12
          ? holderNmb - 12 : holderNmb + 12;

  const selectedChip = getSelectedChip();

  moveChip(selectedChip, position);
  updateDicesAfterChipMove(selectedChip);
  switchToNextTurn();
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
  console.log('---updateDicesAfterChipMove-game.diceValues------>', diff, game.diceValues);
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
  // game.diceValues = [];
}

function clearSelection() {
  selectedChipId.value = null;
  highlightedHolders.value = [];
}

function onDiceRolled(values) {
  game.diceValues = rules.getDiceValues(values).map(d => ({value: d, disabled: false}));
  console.log('-----onDiceRolled----->', values, game.diceValues);
  game.step = 'moving';
}

function onDicesClick() {
  if( game.step === 'waiting-roll') {
    game.step = 'moving';
    dicesRef.value.roll();
  }
}

function showSkip() {
  console.log('-----showSkip----->', getChipById(selectedChipId.value))
  return game.step === 'moving'
      && game.diceValues?.length > 0
      && selectedChipId.value
      && getAllowedHolders(getChipById(selectedChipId.value)).length === 0
      && !rules.isChipOutable(game, getChipById(selectedChipId.value));
}

function onSkipClick() {
  switchPlayer();
}

function showOutBtn() {
  const selectedChip = getChipById(selectedChipId.value);

  return selectedChip && rules.isChipOutable(game, selectedChip);
}

function onOutClick() {
  const selectedChip = getSelectedChip();
  const variants = rules.getNextPositionVariants(game, selectedChip, false).filter(v => v > 24).sort();
  console.log('-----onOutClick()----->', variants);
  moveChip(selectedChip, variants[0]);
  updateDicesAfterChipMove(selectedChip);
  switchToNextTurn();
}
</script>

<template>
  <div class="board">
    <dices ref="dicesRef"
           :style="{position: 'absolute', [isWhiteTurn() ? 'right' : 'left']: '0'}"
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

    <div class="board-inner">
      <div v-for="(_, i) in 12"
           class="chip-holder"
           :class="{highlighted: highlightedHolders.includes(12 - i)}"
           :style="{left: `calc(${i}  * 100vh / 12)`}"
           @click="() => onHolderClick(12 - i)"
      />
      <div style="position: relative; top: 100vh; transform: rotate(180deg);">
        <div v-for="(_, i) in 12"
             class="chip-holder"
             :class="{highlighted: highlightedHolders.includes(24 - i)}"
             @click="() => onHolderClick(24 - i)"
             :style="{left: `calc(${i}  * 100vh / 12)`}"/>
      </div>
      <template v-for="(chip, i) in chips">
        <chipComponent v-if="chip.position < 25"
            :color="chip.color"
              :class="{'selected': selectedChipId === chip.id}"
              :position="chip.position"
              :style="chip.offsetStyle"
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

</style>
