<script setup>
import { reactive, ref, watch, watchEffect } from 'vue';

const props = defineProps({
  state: {
    type: String,
    required: true,
    default: 'wait'
  },
});

const value1 = ref('5');
const value2 = ref('1');
const state = ref(props.state);

const animate = ref(false);

const emit = defineEmits(['ready', 'rolling'])


const generate = (count) => {
  value1.value = Math.floor(Math.random() * 6 + 1) ;
  value2.value = Math.floor(Math.random() * 6 + 1);


  // return [value1.value, value2.value];
  if (count === 0) {
    animate.value = false;
    emit('ready', [value1.value, value2.value]);
  } else {
    setTimeout(() => generate(--count), Math.random() * 100 + 100);
  }
}

const roll = () => {
  animate.value = true;
  state.value = 'show';
  emit('rolling');
  generate(6);
}

defineExpose({
  roll
})

</script>

<template>
  <div class="dice-container">
    <div v-if="state !== 'wait'" class="dices" :class="{animate: animate}">
      <img :src="`dice-${value1}.svg`">
      <img :src="`dice-${value2}.svg`">
    </div>

    <div v-if="state === 'wait'" class="dices">
      <img :src="'roll-dice.svg'">
    </div>
  </div>


</template>

<style scoped lang="scss">
:root {

}
.dice-container {
  margin: 20px;
  min-width: calc( 32px);
}

.dices {
  cursor: pointer;
  display: flex;
  flex-flow: column;

  img {
    margin: 5px 0;
    max-height: 32px;
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
