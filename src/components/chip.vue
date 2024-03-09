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

    background: transparent no-repeat center;
    background-image: url("../../public/star.svg");
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

.chip {
  cursor: pointer;
}



</style>
