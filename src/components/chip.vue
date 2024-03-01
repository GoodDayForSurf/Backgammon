<script setup>
import { reactive, ref, watch, watchEffect } from 'vue';

const props = defineProps({
  color: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
});

const positionStyle = reactive({
  top: 'unset',
  bottom: 'unset',
  left: 'unset',
  right: 'unset',
});

watchEffect(
    () => recalcPosition(props.position)
)

function recalcPosition(index) {
  let side = ['top', 'bottom'];
  console.log('----CHIP-position----->', index);

  if (props.color === 'black') {
    index = index < 13 ? index + 12 : index - 12;
    // side = ['bottom', 'top'];
  }
  console.log('----CHIP-position mapped----->', index);

  ['top', 'bottom', 'left', 'right'].forEach(prop => positionStyle[prop] = 'unset');

  if(index <= 12) {
    positionStyle[side[0]] = `0`;
    positionStyle.right = `calc(${index - 1} * var(--chip-size))`
  } else {
    positionStyle[side[1]] = `0`;
    positionStyle.left = `calc(${index - 13} * var(--chip-size))`
  }
}
</script>

<template>
  <div class="chip"
       :class="{[props.color]: true}"
       :style="positionStyle"

  ></div>
</template>

<style scoped lang="scss">
:root {

}

.chip {
  cursor: pointer;
}



</style>
