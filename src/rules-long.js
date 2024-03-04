
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
        const dValues = game.diceValues;
        const [d1, d2] = dValues.map(d => d.disabled? 0 : d.value);
        let variants = [];

        if (dValues.length === 2 ) {
            variants = [...new Set([d1, d2, d1 + d2])];
        } else {
            variants = dValues.filter(d => !d.disabled).map((d, i) => d.value * (i + 1))
        }
        console.log('-----game.diceValues---variants-->',chip.position, variants.filter(d => !!d).map(v => v*1 + chip.position*1).filter(v => !removeOut || v < 24));
        return variants.filter(d => !!d)
            .map(v => v*1 + chip.position*1).filter(v => !removeOut || v < 24);
    },

    isHolderAllowed(holder, chip) {
        return (holder.chips.length === 0 || holder.chips.at(-1)?.color === chip.color)
    },

    getAllowedHolders(game, chip, variantsHolders) {
        if(game.diceValues.length === 2) {
            return variantsHolders.filter(h => longs.isHolderAllowed(h, chip));
        } else {
            let hasDeny = false;

            return variantsHolders.sort().filter(h => {
                console.log('-----H----->', [variantsHolders, h.nmb, h.chips.length], longs.isHolderAllowed(h, chip))
                hasDeny = hasDeny || !longs.isHolderAllowed(h, chip);
                return !hasDeny;
            });
        }
    },

    isAllChipsInHome(game, color) {
        return !game.chips.find(
            c=> c.color === color && c.position < 19)
    },

    isChipOutable(game, chip) {
        return longs.isAllChipsInHome(game, chip.color) && longs.getNextPositionVariants(game, chip, false).find(v => v > 24)
    }
}

export {
    longs
}
