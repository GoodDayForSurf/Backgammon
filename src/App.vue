<script setup>
import { reactive, ref } from 'vue';
import { longs } from './rules-long.js'
import chipComponent  from '@/components/chip.vue'
import dices from '@/components/dices.vue';

const rules = longs;
const holders = reactive(Array.from({ length: 24 }, (_,i) => ({chips: [], nmb: i + 1})));
const chips = ['black', 'white'].flatMap(
    (color) => Array.from({ length: 15 }).map(
        (_, i) => (reactive({color, id: color + '_' + i}))
    ));

chips.forEach(chip => moveChip(chip,1));

const selectedChipId = ref(null);
let highlightedHolders = ref([]);
const dicesRef = ref(null);
const diceState = ref('wait');
const game = reactive({
  step: 'waiting-roll',
  currentPlayer: Math.random() > 0.5 ? 'black' : 'white',
});

function isWhiteTurn() { return game.currentPlayer === 'white' }

function getChipHolder(color, position) {
  if (position && color === 'black') {
    position = position < 13 ? position + 12 : position - 12;
  }

  return position ? holders[position - 1] : null;
}

function moveChip(chip, position) {
  const fromHolder = getChipHolder(chip.color, chip.position);

  fromHolder?.chips.pop();
  chip.prevPosition = chip.position;
  chip.position = position;

  const toHolder = getChipHolder(chip.color, chip.position);

  toHolder.chips.push(chip);

  const offsetProp = ((chip.color === 'white' && chip.position < 13) || (chip.color === 'black' && chip.position > 12) ? 'top': 'bottom')

  chip.offsetStyle = {
    ['margin-' + offsetProp] : `calc(0.35 * ${toHolder.chips.length - 1}  * var(--chip-size))`,
    'z-index': toHolder.chips.indexOf(chip),
  }

  chip.prevPosition && rules.movingDone(game, chip);
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

function getAllowedHolders(chip) {
 const variants = rules.getNextPositionVariants(game, chip);
  console.log('-----variants----->', variants);
 return variants.map(position => getChipHolder(chip.color, position)).filter(holder => {
   return rules.isHolderAllowed(holder, chip);
 })
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

const onHolderClick = (holderNmb) => {
  if(!selectedChipId.value) { return }

  const position = isWhiteTurn()
      ? holderNmb
      : holderNmb > 12
          ? holderNmb - 12 : holderNmb + 12;

  const selectedChip = chips.find(({id}) => id === selectedChipId.value);

  moveChip(selectedChip, position);
  updateDicesAfterChipMove(selectedChip);
  switchToNextTurn();
}

function switchToNextTurn() {
  clearSelection();

  if (game.diceValues.find(d => !d.disabled)) {

  } else {
    switchPlayer();
  }
}

function switchPlayer() {
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
</script>

<template>
  <div class="board">
    <dices :style="{position: 'absolute', [isWhiteTurn() ? 'right' : 'left']: '0'}"
           ref="dicesRef"
           @click="() => onDicesClick()"
           @ready="onDiceRolled"
           :values="game.diceValues"
           :gameState="game.step"/>

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
        <chipComponent :color="chip.color"
              :class="{'selected': selectedChipId === chip.id}"
              :position="chip.position"
              :style="chip.offsetStyle"
              @click="() => onChipClick(chip)"
        />
        </template>
    </div>
      <div class="board-middle"></div>
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
