
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

    getNextPositionVariants(game, chip) {
        console.log('-----game.diceValues----->', game);
        const dValues = game.diceValues;
        const [d1, d2] = dValues.map(d => d.disabled? 0 : d.value);

        return (
            (dValues.length === 2 )
            ? [...new Set([d1, d2, d1 + d2])]
            : dValues.filter(d => !d.disabled).map((d, i) => d.value * (i + 1))
        ).filter(d => !!d).map(v => v + chip.position)
    },

    isHolderAllowed(holder, chip) {
        return (holder.chips.length === 0 || holder.chips.at(-1)?.color === chip.color)
    }
}

export {
    longs
}
