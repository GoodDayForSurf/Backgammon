
const longs = {
    isChipSelectable(game, chip) {
        if(chip.position === 1 && !game.headIsUsed) {
            return true;
        }

        return false;
    },

    moveingDone(game, chip) {
        if(chip.prevPosition === 1) {
            game.headIsUsed = true;
        }
    }
}

export {
    longs
}
