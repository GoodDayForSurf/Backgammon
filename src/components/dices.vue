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
  [value2.value, value1.value] = [
    Math.floor(Math.random() * 6 + 1),
    Math.floor(Math.random() * 6 + 1)
  ].sort();

  if (count === 0) {
    animate.value = false;
    emit('ready', [value1.value, value2.value]);
    state.value = 'show';
  } else {
    setTimeout(() => generate(--count), Math.random() * 100 + 100);
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
      <img :src="'roll-dice.svg'">
    </div>
    <template v-if="gameState === 'moving'">
      <div v-if="state === 'rolling'" class="dices" :class="{animate: animate}">
        <img v-for="value in [value1, value2]" :src="`dice-${value}.svg`">
      </div>

      <div v-if="state === 'show'" class="dices">
        <img v-for="dice in values"
             :src="`dice-${dice.value}.svg`"
             :class="{disabled: dice.disabled}">
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

  img {
    max-height: 48px;

    &.disabled {
      opacity: 0.25;
    }
  }
}

.animate {
  & > * {
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
