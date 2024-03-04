
const longs = {
    getChipHolder(game, color, position) {
        if (position && color === 'black') {
            position = position < 13 ? position + 12 : position - 12;
        }

        return position ? game.holders[position - 1] : null;
    },

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
        const dValues = game.diceValues || [];
        const [d1, d2] = dValues.map(d => d.disabled? 0 : d.value);
        let variants = [];

        if (dValues.length === 2 ) {
            variants = [...new Set([d1, d2, d1 + d2])];
        } else {
            variants = dValues.filter(d => !d.disabled).map((d, i) => d.value * (i + 1))
        }

        return variants.filter(d => !!d)
            .map(v => v*1 + chip.position*1).filter(v => !removeOut || v < 24);
    },

    isHolderAllowed(holder, chip) {
        return (holder.chips.length === 0 || holder.chips.at(-1)?.color === chip.color)
    },

    getAllowedHolders(game, chip) {
        const variants = longs.getNextPositionVariants(game, chip);
        const variantsHolders = variants.map(position => longs.getChipHolder(game, chip.color, position));

        if(!game.diceValues) {
            return [];
        }

        if(game.diceValues.length === 2) {
            return variantsHolders.filter(h => longs.isHolderAllowed(h, chip));
        } else {
            let hasDeny = false;

            return variantsHolders.sort().filter(h => {
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
    },

    isSkipAllowed(game) {
        const currentColorTopChips = game.holders
            .filter(h => {
                const topChip = h.chips.at(-1);

                if(topChip?.color === game.currentPlayer) {
                    return topChip.position === 1
                        ? !game.headIsUsed
                        : true
                }

                return false;
            })
            .map(h => h.chips.at(-1));

        return game.step === 'moving'
            && game.diceValues?.length > 0
            && !currentColorTopChips.find(
                (chip) => (longs.getAllowedHolders(game, chip).length > 0 || longs.isChipOutable(game, chip))
            )
    }
}

export {
    longs
}
