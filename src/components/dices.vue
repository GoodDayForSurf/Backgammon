<script setup>
import { ref } from 'vue';

const props = defineProps({
  allowDouble: true,
  values: {
    type: Array,
    default: [1, 1]
  },
  gameState: {
    type: String,
    required: true,
    default: 'waiting-roll'
  },
});

let [value1, value2] = [ref(1), ref(1)];
const state = ref('');
const animate = ref(false);

const emit = defineEmits(['ready', 'rolling'])

const generate = (count) => {
  [value2.value, value1.value] = [6,6
    /*Math.floor(Math.random() * 6 + 1),
    Math.floor(Math.random() * 6 + 1)*/
  ].sort();

  if (count === 0) {
    animate.value = false;
    emit('ready', [value1.value, value2.value]);
    state.value = 'show';
  } else {
    setTimeout(() => generate(--count), Math.random() * 100 + 50);
  }
}

const roll = () => {
  animate.value = true;
  state.value = 'rolling';
  emit('rolling');
  generate(6);
}

defineExpose({
  roll
})

</script>

<template>
  <div class="dice-container">
    <div class="dices" v-if="gameState === 'waiting-roll'">
      <div class="dice-img roll-dice"></div>
    </div>
    <template v-if="gameState === 'moving'">
      <div v-if="state === 'rolling'" class="dices" :class="{animate: animate}">
        <div v-for="value in [value1, value2]"
             :class="{'dice-img': true, ['dice-' + value]: true}"></div>
      </div>

      <div v-if="state === 'show'" class="dices">
        <div v-for="dice in values"
             class="dice-img"
             :class="{disabled: dice.disabled, ['dice-'+dice.value]: true}"></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
:root {

}
.dice-container {
  min-width: var(--size);
  max-width: var(--size);
  overflow: hidden;
}

.dices {
  cursor: pointer;
  display: flex;
  gap: 14px;
  padding: 14px 0;
  flex-flow: column;
  align-items: center;

  .dice-img {
    width: 48px;
    height: 48px;
    background-size: contain;

    &.disabled {
      opacity: 0.25;
    }
  }

  .roll-dice {
    width: 50px;
    height: 50px;
    background: no-repeat url("../../public/roll-dice.svg");
    background-size: contain;
  }
}

.animate {
  & > * {
    animation: rotate 0.7s linear infinite;
  }
}

.dice- {
  &1 {
    background: no-repeat url("../../public/dice-1.svg");
  }
  &2 {
    background: no-repeat url("../../public/dice-2.svg");
  }
  &3 {
    background: no-repeat url("../../public/dice-3.svg");
  }
  &4 {
    background: no-repeat url("../../public/dice-4.svg");
  }
  &5 {
    background: no-repeat url("../../public/dice-5.svg");
  }
  &6 {
    background: no-repeat url("../../public/dice-6.svg");
  }
}


</style>
