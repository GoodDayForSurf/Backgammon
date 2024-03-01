<script setup>
import { reactive, ref, watch, watchEffect } from 'vue';

const props = defineProps({
  state: {
    type: String,
    required: true
  },
});

const diceSymbols = ['\u2680','\u2681','\u2685','\u2683','\u2684','\u2685'];

const value1 = ref('?');
const value2 = ref('?');

const animate = ref(false);

const emit = defineEmits(['ready', 'rolling'])

const generate = (count) => {
  const d1 = Math.floor(Math.random() * 6 + 1) ;
  let d2 = Math.floor(Math.random() * 6 + 1);

  value1.value = diceSymbols[d1-1];
  value2.value = diceSymbols[d2-1];

  console.log('---------->', d1, d2);
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
  emit('rolling', [value1.value, value2.value]);
  generate(6);
}

defineExpose({
  roll
})

</script>

<template>
  <div class="dices" :class="{animate: animate}">
    <div>{{value1}}</div><div>{{value2}}</div>
  </div>

</template>

<style scoped lang="scss">
:root {

}

.dices {
  display: flex;
  flex-flow: column;
  line-height: 50px;
  font-size: 60px;
  margin: 20px;
}

.animate {
  div {
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
