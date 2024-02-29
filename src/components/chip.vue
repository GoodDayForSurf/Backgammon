<script setup>
import { ref } from 'vue';

const props = defineProps({
  color: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: false
  },
});

const positionStyle = {
  top: 'unset',
  bottom: 'unset',
  left: 'unset',
  right: 'unset',
};

let index = props.position;
let side = ['top', 'bottom'];

if (props.color === 'black') {
  index = props.position < 13 ? props.position + 12 : props.position - 12;
  // side = ['bottom', 'top'];
}

if(index <= 12) {
  positionStyle[side[0]] = `0`;
  positionStyle.right = `calc(${index - 1} * var(--chip-size))`
} else {
  positionStyle[side[1]] = `0`;
  positionStyle.left = `calc(${index - 13} * var(--chip-size))`
}
const selected = ref(false);

const onclick = () => {
  selected.value = !selected.value
}
</script>

<template>
  <div class="chip"
       @click="onclick()"
       :class="{[props.color]: true, selected: selected}"
       :style="positionStyle"

  ></div>
</template>

<style scoped lang="scss">
:root {

}

.chip {
  cursor: pointer;
}

.selected {
  filter: drop-shadow(2px 4px 7px green);
}

</style>
