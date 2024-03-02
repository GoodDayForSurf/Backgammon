<script setup>
import { reactive, ref } from 'vue';
import { longs } from './rules-long.js'
import chip from './components/chip.vue'
import dices from '@/components/dices.vue';


const rules = longs;
const holders = reactive(Array.from({ length: 24 }, el => ({chips: []})));
const chips = ['black', 'white'].flatMap(
    (color) => Array.from({ length: 15 }).map(
        (_, i) => (reactive({color, id: color + '_' + i}))
    ));

const selectedChipId = ref(null);
const dicesRef = ref(null);
const diceState = ref('wait');
const game = reactive({
  step: 'start',
  currentPlayer: Math.random() > 0.5 ? 'black' : 'white',
});

function isWhiteTurn() { return game.currentPlayer === 'white' }

chips.forEach(chip => moveChip(chip,1));

function getChipHolder(chip) {
  let position = chip.position;

  if (position && chip.color === 'black') {
    position = position < 13 ? position + 12 : position - 12;
  }

  return position ? holders[position - 1] : null;
}

function moveChip(chip, position) {
  const fromHolder = getChipHolder(chip);

  fromHolder?.chips.pop();
  chip.prevPosition = chip.position;
  chip.position = position;

  const toHolder = getChipHolder(chip);

  toHolder.chips.push(chip);

  const offsetProp = ((chip.color === 'white' && chip.position < 13) || (chip.color === 'black' && chip.position > 12) ? 'top': 'bottom')

  chip.offsetStyle = {
    ['margin-' + offsetProp] : `calc(0.4 * ${toHolder.chips.length - 1}  * var(--chip-size))`,
    'z-index': toHolder.chips.indexOf(chip),
  }

  rules.moveingDone(game, chip);
}

const onChipClick = (chip) => {
  if(getChipHolder(chip).chips.at(-1).id !== chip.id) {
    return;
  }

  if(chip.color !== game.currentPlayer || game.step !== 'moving') {
    return;
  }

  if(rules.isChipSelectable(game, chip)) {
    selectedChipId.value = chip.id;
  }
}

const onHolderClick = (holderNmb) => {
  if(!selectedChipId.value) { return }

  const position = isWhiteTurn()
      ? holderNmb
      : holderNmb > 12
          ? holderNmb - 12 : holderNmb + 12;

  moveChip(chips.find(({id}) => id === selectedChipId.value), position);
}

function onDiceRolled(values) {
  game.diceValues = values;
  game.step = 'moving';
}
</script>

<template>
  <div class="board">
    <dices :style="{position: 'absolute', [isWhiteTurn() ? 'right' : 'left']: '20px'}"
           ref="dicesRef" @click="() => dicesRef.roll()"
           @ready="onDiceRolled"
           :state="diceState"/>

    <div class="board-inner">
      <div v-for="(_, i) in 12"
           class="chip-holder"
           :style="{left: `calc(${i}  * 100vh / 12)`}"
           @click="() => onHolderClick(12 - i)"
      />
      <div style="position: relative; top: 100vh; transform: rotate(180deg);">
        <div v-for="(_, i) in 12"
             class="chip-holder"
             @click="() => onHolderClick(24 - i)"
             :style="{left: `calc(${i}  * 100vh / 12)`}"/>
      </div>
      <template v-for="(chip, i) in chips">
        <chip :color="chip.color"
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
