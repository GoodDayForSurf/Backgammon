<script setup>
import { computed, reactive, ref } from 'vue';
import PlayerButton from './components/player-button.vue'
import Card from './components/card.vue'

const state = reactive({
  playersAmount: 0,
  step: 'set-players-amount',
  score: {},
})

const hints = {
  'set-players-amount': 'Number of players?',
  'set-target-card-owner': 'Who is active player?',
  'setting-players-choice': 'Specify players votes',
  'player-is-choosing-card': 'Select card',
  'ready-show-target-card': 'Specify target card',
  'set-selected-card-owners': 'Specify owners for selected cards',
  'score-counted': 'Game round!'
};
let targetCardOwner = ref(null);
const activePlayer = ref(null);
const cardsSelection = reactive([]);
const playersChoices = reactive(new Map());
const selectedCard = ref(null);
const cardsOwners = ref(new Map());
let needConfirm = ref(false);

const isNewGame = computed(() => !Object.values(state.score).find((score) => score !== 0))

const lastState = localStorage.getItem('dixit-game-state');

if(lastState) {
  restoreState(JSON.parse(lastState));
  startRound();
}

function setPlayersAmount(amount) {
  state.playersAmount = amount;
  state.step = 'set-target-card-owner';
  state.score = {};
  new Array(amount).fill(0).forEach((val, i) => state.score[i+1]=0)
}

function onPlayerActive(playerId) {
  if (['setting-players-choice', 'ready-show-target-card'].includes(state.step)) {
    activePlayer.value = playerId
  } else if (activePlayer.value === playerId && state.step === 'player-is-choosing-card') {
    cancelActive();
    return;
  }

  state.step = 'player-is-choosing-card';
}

function onCardClick(nmb) {
  if (state.step === 'player-is-choosing-card') {
    cardsSelection.forEach((card) => card?.delete(activePlayer.value));
    cardsSelection[nmb] = cardsSelection[nmb] || new Set();
    cardsSelection[nmb].add(activePlayer.value);

    playersChoices.set(activePlayer.value, nmb);

    cancelActive();

    if (playersChoices.size === state.playersAmount - 1) {
      state.step = 'ready-show-target-card';
    }
  } else if (state.step === 'ready-show-target-card') {
    if(needConfirm.value && selectedCard.value === nmb) {
      needConfirm.value = false;
      cardsOwners.value.set(nmb, targetCardOwner.value);

      selectedCard.value = null;

      if( cardsSelection[nmb]?.size === state.playersAmount - 1) {
         countScore();
         return;
      } else {
        state.step = 'set-selected-card-owners';
      }

    } else {
      selectedCard.value = nmb;
      needConfirm.value = true;
    }
  } else if (state.step === 'set-selected-card-owners' && cardsSelection[nmb]?.size) {
    selectedCard.value = nmb;
  }
}

function setTargetCardOwner(playerId) {
  if (!targetCardOwner.value) {
    targetCardOwner.value = playerId;
    needConfirm.value = true;
  } else {
    if(needConfirm.value && targetCardOwner.value === playerId) {
      needConfirm.value = false;
      state.step ='setting-players-choice';
    } else {
      targetCardOwner.value = playerId;
    }
  }
}

function setCardOwner(playerId) {
  const cardsOwnersMap = cardsOwners.value;
  activePlayer.value = playerId;

  if (needConfirm.value && cardsOwnersMap.get(selectedCard.value) === playerId) {
    needConfirm.value = false;
    selectedCard.value = null;
    activePlayer.value = null;

    if (!cardsSelection.find((card, i)=> {
      return card && !cardsOwners.value.get(i)
    })) {
      countScore();
    }
  } else {
    cardsOwnersMap.set(selectedCard.value, playerId);
    needConfirm.value = true;
  }
}

function countScore() {
  const targetCardNumber = Object.keys(state.score).find((playerId) => cardsOwners.value.get(+playerId) === targetCardOwner.value);
  const targetSelections = cardsSelection[targetCardNumber];

  if(!targetSelections || targetSelections.size === 0 || targetSelections.size === state.playersAmount - 1) {
    Object.keys(state.score).forEach((key) => {
      const playerId = +key;
      if (playerId !== targetCardOwner.value) {
        state.score[playerId] += 2
      }
    });
  } else if(targetSelections?.size) {
    state.score[targetCardOwner.value] += 3;
    [...targetSelections].forEach((playerId) => state.score[playerId] += 3)
  }

  cardsSelection.forEach((selections, cardNumber) => {
    if(cardNumber === +targetCardNumber) {
      return;
    }

    const cardOwnerId = cardsOwners.value.get(cardNumber);
    state.score[cardOwnerId] +=selections?.size || 0;
  });

  state.step = 'score-counted';
  save();
}

function startRound() {
  targetCardOwner.value = null;
  activePlayer.value = null;
  cardsSelection.length = 0;
  playersChoices.clear();
  selectedCard.value = null;
  cardsOwners.value.clear();
  state.step = 'set-target-card-owner';
}

function cancelActive() {
  state.step = 'setting-players-choice';
  activePlayer.value = 0;
}

function isPlayerPointOwnCard(playerId) {
  return [...cardsOwners.value.values()].find((value) => playerId === value)
}

function save() {
  localStorage.setItem('dixit-game-state', JSON.stringify(state))
}

function restoreState(lastState) {
  state.playersAmount = lastState.playersAmount;
  state.score = lastState.score;
}

function startNewGame(e) {
  let text = "Reset score and start new Game?";
  if (confirm(text) == true) {
    localStorage.removeItem('dixit-game-state')
    location.reload();
  }
}
</script>

<template>
  <div class="board">
    <div class="header">
      <div v-if="!isNewGame && state.step === 'set-target-card-owner'"
           class="new-game-btn"
           @click="startNewGame"
      >New Game</div>
    </div>
    <div class="hint">{{hints[state.step]}}
      <div v-if="needConfirm" class="confirm-marker">Confirm?</div>
    </div>
    <div v-if="state.step === 'set-players-amount'"
         class="select-amount-panel"
    >
      <button v-for="i in 4"
              :key="i"
              @click="setPlayersAmount(i + 2)"
              style="cursor: pointer"
      >{{i + 2}}</button>
    </div>

    <div v-if="state.step !== 'set-players-amount'"
         id="score-board"
    >
      <div class="players-container">
        <div>Players</div>
        <player-button v-for="i in state.playersAmount"
                       :key="i"
                       :id="i"
                       :isOwner="i === targetCardOwner"
                       :show-card="i !== targetCardOwner && (
                           (state.step === 'set-selected-card-owners' &&
                            !isPlayerPointOwnCard(i)
                           ) ||
                           (['player-is-choosing-card', 'setting-players-choice'].includes(state.step) &&
                            !playersChoices.get(i)
                           )
                           )  "
                       :card="cardsOwners.get(i)"
                       :disabled="i !== activePlayer && activePlayer > 0"
                       :score="state.score[i]"
                       :selected="activePlayer === i || (state.step === 'set-selected-card-owners' && activePlayer === i)"
                       @activate="state.step === 'setting-players-choice' && targetCardOwner !== i ? onPlayerActive(i) : null"
                       @click="{
                         'set-target-card-owner': () => setTargetCardOwner(i),
                         'set-selected-card-owners': () => selectedCard && setCardOwner(i)
                       }[state.step]"
        />
      </div>

      <div class="center-panel">
        <div v-if="state.step === 'score-counted'"
             class="control"
             @click="startRound()"
             style="cursor: pointer"
        >&#10226;</div>
      </div>

      <div class="cards-container">
        <div style="display: flex;justify-content: center;">Cards</div>
        <card v-for="i in state.playersAmount" :key="i"
              @click="onCardClick(i)"
              :players="cardsSelection[i]"
              :owner="cardsOwners.get(i)"
              :is-target="cardsOwners.get(i) === targetCardOwner"
              :is-selected="selectedCard === i"
              :msg="i" />
      </div>
    </div>
  </div>
</template>
<style src="./App.scss" lang="scss"></style>
