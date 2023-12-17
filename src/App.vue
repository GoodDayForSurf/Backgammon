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
  'set-selected-card-owners': 'Specify owners of cards with votes',
  'score-counted': 'Round!'
};
let targetCardOwner = ref(null);
const activePlayer = ref(null);
const cardsSelection = reactive(new Map());
const playersChoices = reactive(new Map());
const selectedCard = ref(null);
const selectedPlayers = reactive(new Set());
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

function onCardClick(cardNmb) {
  if (state.step === 'setting-players-choice') {
    selectedCard.value = cardNmb;
    if(needConfirm.value && selectedCard.value === cardNmb) {
      needConfirm.value = false;
      selectedPlayers.clear();
      selectedCard.value = null;

      if(isAllPlayersVoted()) {
        state.step = 'ready-show-target-card';
      }
    } else if(selectedPlayers.size) {
      selectedCard.value = cardNmb;
      setCardVotes(cardNmb)
      needConfirm.value = true;
      return;
    }

    /*cardsSelection.forEach((card) => card?.delete(activePlayer.value));
    cardsSelection[nmb] = cardsSelection[nmb] || new Set();
    cardsSelection[nmb].add(activePlayer.value);

    playersChoices.set(activePlayer.value, nmb);

    cancelActive();

    if (playersChoices.size === state.playersAmount - 1) {
      state.step = 'ready-show-target-card';
    }*/
  } else if (state.step === 'ready-show-target-card') {
    if(needConfirm.value && selectedCard.value === cardNmb) {
      needConfirm.value = false;
      cardsOwners.value.set(cardNmb, targetCardOwner.value);

      selectedCard.value = null;

      if( cardsSelection.get(cardNmb)?.size === state.playersAmount - 1) {
         countScore();
         return;
      } else {
        state.step = 'set-selected-card-owners';
      }

    } else {
      selectedCard.value = cardNmb;
      needConfirm.value = true;
    }
  } else if (state.step === 'set-selected-card-owners' && cardsSelection.get(cardNmb)?.size) {
    console.log('---------set-selected-card-owners->')
    selectedCard.value = cardNmb;
  }
}

function isAllPlayersVoted(){
  return [...cardsSelection.values()].map((players) => [...players]).flat().length === state.playersAmount - 1;
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

function setCardVotes(cardNmb) {
  const playersSet = selectedPlayers;
  cardsSelection.forEach((card) => playersSet.forEach((playerId) => card?.delete(playerId)));
  cardsSelection.set(cardNmb, new Set([...playersSet]));
}

function onPLayerBtnClick(playerId) {


  if(state.step == 'set-target-card-owner') {
    setTargetCardOwner(playerId);
  } else if(playerId === targetCardOwner.value) {
    return;
  } else if(state.step === 'setting-players-choice') {
    needConfirm.value = false;

    if(selectedPlayers.has(playerId)) {
      selectedPlayers.delete(playerId);
    } else {
      selectedPlayers.add(playerId);
    }

    if(selectedCard.value) {
      setCardVotes(selectedCard.value);
    }

  } else if (state.step == 'set-selected-card-owners'){
    const cardOwnersMap = cardsOwners.value;

    const wrongCard = [...cardOwnersMap.entries()].find(([_, vote]) => vote === playerId);

    cardOwnersMap.delete(wrongCard);
    cardOwnersMap.set(selectedCard.value, playerId);

    selectedCard.value = null;

    if ([...cardOwnersMap.values()].flat().length === state.playersAmount - 1) {
      countScore();
    }
  }
}

function countScore() {
  const targetCardNumber = Object.keys(state.score).find((playerId) => cardsOwners.value.get(+playerId) === targetCardOwner.value);
  const targetSelections = cardsSelection.get(targetCardNumber);

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

  cardsSelection.forEach(([selections, cardNumber]) => {
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
  cardsSelection.clear();
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
      <button v-for="i in 5"
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
                       :selected="activePlayer === i || selectedPlayers.has(i) || (state.step === 'set-selected-card-owners' && activePlayer === i)"

                       @click="onPLayerBtnClick(i)"
        /> <!--  @activate="state.step === 'setting-players-choice' && targetCardOwner !== i ? onPlayerActive(i) : null" -->
      </div>

      <div class="center-panel">
        <div v-if="state.step === 'score-counted'"
             class="control"
             @click="startRound()"
             style="cursor: pointer"
        >&#10226;</div>
      </div>

      <div class="cards-container" :class="{disabled: state.step === 'set-target-card-owner'}">
        <div style="display: flex;justify-content: center;">Cards</div>
        <card v-for="i in state.playersAmount" :key="i"
              @click="onCardClick(i)"
              :players="cardsSelection.get(i)"
              :owner="cardsOwners.get(i)"
              :is-target="cardsOwners.get(i) === targetCardOwner"
              :is-selected="selectedCard === i"
              :msg="i" />
      </div>
    </div>
  </div>
</template>
<style src="./App.scss" lang="scss"></style>
