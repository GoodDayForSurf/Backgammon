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
  marker: {
    type: String,
    required: false,
    default: ''
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
  const isWhite = props.color === 'white';

  ['top', 'bottom', 'left', 'right'].forEach(prop => positionStyle[prop] = 'unset');

  if(index < 0) {
    positionStyle[ isWhite ? 'bottom' : 'top'] = `0`;
    positionStyle[ isWhite ? 'right' : 'left'] = `calc(${isWhite ? -1 : -1} * var(--chip-size))`;
    return;
  }

  if (!isWhite) {
    index = index < 13 ? index + 12 : index - 12;
  }

  if(index <= 12) {
    positionStyle.top = `0`;
    positionStyle.right = `calc(${index - 1} * var(--chip-size))`
  } else {
    positionStyle.bottom = `0`;
    positionStyle.left = `calc(${index - 13} * var(--chip-size))`
  }
}
</script>

<template>
  <div class="chip"
       :class="{[props.color]: true}"
       :style="positionStyle"

  >{{props.marker}}</div>
</template>

<style scoped lang="scss">
:root {

}

.chip {
  cursor: pointer;
}



</style>
