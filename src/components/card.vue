<script setup>
defineProps({
  msg: {
    type: Number,
    required: true
  },
  owner: {
    type: Number,
    required: false
  },
  players: {
    required: false
  },
  isSelected: {
    type: Boolean,
    required: false,
    value: false
  },
  isTarget: {
    type: Boolean,
    required: false,
    value: false
  }
})
</script>

<template>
  <div class="card" :class="{selected: isSelected, target: isTarget}">
    <div class="number">{{msg}}</div>
    <div v-if="players?.size" class="players">{{[...players].join(' ')}}</div>
    <div v-if="owner" class="owner">{{owner}}</div>
  </div>
</template>

<style scoped lang="scss">
:root {
  --player-button-size: 50px;
}

.card {
  cursor: pointer;
  position: relative;
  width: calc(var(--player-button-size) + var(--player-button-size) / 1.5);
  height: var(--player-button-size);
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;

  background-color: blueviolet;
  color: whitesmoke;
  border-radius: 10px;
  border-width: 0;
  font-size: 24px;

  &.selected {
    box-shadow: 0 0 10px 3px greenyellow
  }

  &.target {
    background-color: coral;
  }

  .number {
    margin-bottom: 5px;
  }

  .players {
    position: absolute;
    bottom: 0;
    left: 0;
    padding-left: 10px;
    font-size: 14px;
  }

  .owner {
    position: absolute;
    top: 0;
    right: 10px;
    color: #f8f8f8;
    font-size: 14px;
  }
}
</style>
