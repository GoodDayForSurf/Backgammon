<script setup>
const props = defineProps({
  id: {
    type: Number,
    required: true
  },
  disabled: {
    type: Boolean,
    required: true,
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
  }
})

const emit = defineEmits(['activate'])

function onClick() {
  if( props.disabled ) {
    return
  }

  emit('activate', props.id)
}
</script>

<template>
  <div class="container">
    <div class="player-btn center"
         :class="{
    disabled: props.disabled,
    owner: props.isOwner
  }"
         @click="onClick">
      <div class="avatar">{{props.id}}</div>
    </div>
    <div v-show="showCard" class="card-id">?</div>
    <div class="score">{{score}}</div> <!-- v-if="props.score > 0" -->
  </div>
</template>

<style scoped lang="scss">
:root {
  --player-button-size: 50px;
}

.container {
  position: relative;

  .score {
    position: absolute;
    bottom: -5px;
    right: -10px;
    font-weight: bold;
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

  background-color: aquamarine;
  border-radius: 20%;
  border: none;
  font-size: 24px;

  &.owner {
    background-color: darkcyan;
    color: #f8f8f8;

    sup {
      display: none;
    }
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
