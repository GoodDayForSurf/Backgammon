
const longs = {
    isChipSelectable(game, chip) {
        if(chip.position === 1 && game.headIsUsed) {
            return false;
        }

        return true;
    },

    getDiceValues([d1, d2]) {
        return (d1 === d2) ? [d1, d2].concat([d1, d2]) : [d1, d2];
    },

    movingDone(game, chip) {
        if(chip.prevPosition === 1) {
            game.headIsUsed = true;
        }
    },

    getNextPositionVariants(game, chip, removeOut = true) {
        console.log('-----game.diceValues----->', game);
        const dValues = game.diceValues;
        const [d1, d2] = dValues.map(d => d.disabled? 0 : d.value);

        return (
            (dValues.length === 2 )
            ? [...new Set([d1, d2, d1 + d2])]
            : dValues.filter(d => !d.disabled).map((d, i) => d.value * (i + 1))
        ).filter(d => !!d)
            .map(v => v + chip.position).filter(v => !removeOut || v < 24);
    },

    isHolderAllowed(holder, chip) {
        return (holder.chips.length === 0 || holder.chips.at(-1)?.color === chip.color)
    },

    isAllChipsInHome(game, color) {
        return !game.chips.find(
            c=> c.color === color && c.position < 19)
    },

    isChipOutable(game, chip) {
        return /*longs.isAllChipsInHome(game, chip.color) &&*/ longs.getNextPositionVariants(game, chip, false).find(v => v > 24)
    }
}

export {
    longs
}
