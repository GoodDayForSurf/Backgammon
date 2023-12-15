const state = {
    playersAmount: 0
}

const WAIT_PLAYER_CHOICE = 1;

const $ = (selector) => document.querySelector(selector);

function setPlayersAmount(e) {
    state.playersAmount = +e.target.textContent;
    showScoreBoard();
}

function playerButtonClick(e) {
    state.step = WAIT_PLAYER_CHOICE;
    const playerNumber = +e.target.textContent;

}

function showScoreBoard() {
    $('.select-amount-panel').style.display = 'none';
    $('#score-board').style.display = 'inherit';
    addPlayersButtons();
    addCardsTiles();
}

function addPlayersButtons() {
    const html = (new Array(state.playersAmount).fill(1))
        .map((_, i) => {
            return `<button class="player-btn">${i + 1}</button>`
        }).join('\n');

    $('.players-container').innerHTML = html;
}

function addCardsTiles() {
    const html = (new Array(state.playersAmount).fill(1))
        .map((_, i) => {
            return `<button class="card">${i + 1}</button>`
        }).join('\n');

    $('.cards-container').innerHTML = html;
}
