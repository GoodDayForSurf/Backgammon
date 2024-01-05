<script setup>
const props = defineProps({
  id: {
    type: Number,
    required: true
  },
  disabled: {
    type: Boolean,
    required: false,
    value: false,
  },
  card: {
    required: false,
  },
  showCard: {
    type: Boolean,
    required: false,
    value: false
  },
  isOwner: {
    type: Boolean,
    required: false,
  },
  score: {
    type: Number,
    required: true,
  },
  place: {
    type: Number,
    required: true,
  },
  selected: {
    type: Boolean,
    required: false,
  },
})

const emit = defineEmits(['activate'])

function onClick() {
  emit('activate', props.id)
}
</script>

<template>
  <div class="container">
    <div class="player-btn center"
         :class="{
      ['color-' + props.id]: true,
    disabled: props.disabled,
    owner: props.isOwner,
    selected: props.selected
  }"
         @click="onClick">
      <div class="avatar">{{props.id}}</div>
    </div>
    <div v-show="showCard && !disabled" class="card-id">?</div>
    <div class="score">{{score}}</div>
    <div :class="['place']">{{place}}</div>
  </div>
</template>

<style scoped lang="scss">
.container {
  position: relative;

  .score {
    position: absolute;
    bottom: -5px;
    right: -18px;
    font-weight: bold;
  }

  .place {
    position: absolute;
    bottom: 2px;
    left: 2px;
    font-size: small;
    font-weight: bold;
    color: darkred;
    border-radius: 50%;
    background-color: wheat;
    height: 14px;
    width: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-id {
    position: absolute;
    top: -5px;
    right: -10px;
  }
}

.player-btn {
  width: var(--player-button-size);
  height: var(--player-button-size);
  cursor: pointer;

  border-radius: 20%;
  border: none;
  font-size: 24px;

  &.owner {
    pointer-events: none;
    box-shadow: 0 0 10px 3px fuchsia;

    sup {
      display: none;
    }
  }

  &.selected {
    box-shadow: 0 0 10px 3px greenyellow;
  }

  &.disabled {
    opacity: 0.5;
  }

  sup {
    font-size: 16px;
    margin-left: 4px;
    color: rgb(128, 128, 128);
  }
}
</style>
