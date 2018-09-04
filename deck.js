/*************************************************************************\
* This describes a standard deck of playing cards                         *
>*************************************************************************<
* Usages: var d1 = TYPES.deck();                                          *
\*************************************************************************/
if (typeof TYPES === 'undefined') { TYPES = {}; }
TYPES.deck = function() {
    /*****************\
    *   HIDDEN VARS   *
    \*****************/
    var pile;      //This will hold all the cards currently in the deck.

    /**********************\
    *   HIDDEN FUNCTIONS   *
    \**********************/
    var createDeck = function() {
        var g, s;
        retval = [];
        for (s = 1; s <= 4; s++) {
            for (g = 1; g <= 13; g++) {
                retval.push(TYPES.card({'grade': g, 'suit': s}));
            }
        }
        return retval;
    };
    var randomBetween = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    //Get a random number of cards that's roughly 1/2 the deck.
    var getADepth = function() {
        //Find the piviot card (1/2 the deck +/- the fudge factor)
        //Fudge factor = 10% of what's left in the deck.
        var fudgeFactor = Math.floor(pile.length * .1);
        var depth = pile.length / 2 + randomBetween(0, fudgeFactor * 2) - fudgeFactor;
        return depth;
    };
    //Tests to see if all cards are in the deck.
    var isMissingCards = function() {
        var goodDeck, goodCard, i, found;
        var card, j;
        var retval = true;
        if (pile.length == 52) {
            //Ok, there's 52 cards, that's a good start.
            //Now, let's make a good deck and make sure that every card
            // that's in the good deck, is also in this deck.
            retval = false;
            goodDeck = createDeck();
            for(i = 0; i < goodDeck.length; i++) {
                goodCard = goodDeck[i];
                found = false;
                for(j = 0; j < pile.length; j++) {
                    if (goodCard.isSameAs(pile[j])) {
                        found = true;
                        j = pile.length;
                    }
                }
                if (!found) {
                    retval = true;
                    i = goodDeck.length;
                }
            }
        }
        return retval;
    };

    /**********************\
    *   CONSTRUCTOR AREA   *
    \**********************/
    pile = createDeck();

    /************************\
    *    END HIDDEN STUFF    *
    \************************/

    var retval = {};
    retval.getSize = function() {
        return pile.length;
    };
    retval.isEmpty = function() {
        return pile.length === 0;
    };
    retval.isComplete = function() {
        return !isMissingCards();
    };
    //Draw a card from the top of the deck.
    retval.draw = function() {
        return pile.pop();
    };
    //Put a card back on the deck.
    retval.returnCard = function(card) {
        if (card && card.isCard && card.isCard()) {
            pile.push(card);
        }
        else {
            console.log("This is not a card, so it cannot be returned: ", card);
        }
    };
    //remove a specific card from the deck (if it's there).
    //Returns the requested card (if it was there).
    retval.removeCard = function(card) {
        var i, retval;
        if (!card.isCard || !card.isCard()) {
            card = TYPES.card(card);
        }
        for (i = 0; i < pile.length; i++) {
            if (pile[i].isSameAs(card)) {
                retval = pile.splice(i, 1);
                i = pile.length;
            }
        }
        return retval;
    };
    //Perform a cut on the deck: a chunk of cards from the top gets put onto the bottom.
    retval.cut = function() {
        pile.push.apply(pile, pile.splice(0, getADepth()));
    };
    //Perform a rifle shuffle.
    //This is where the deck is split into two halves, and cards from each half are
    // alternately placed back into the deck.
    retval.rifle = function() {
        var clumpCount;
        var pileA = pile.splice(0, getADepth());
        var pileB = pile;
        pile = [];
        while(pileA.length > 0 || pileB.length > 0) {
            if (pileA.length > 0) {
                clumpCount = randomBetween(1, 3);
                if (clumpCount > pileA.length) {
                    clumpCount = pileA.length;
                }
                pile.unshift.apply(pile, pileA.splice(0, clumpCount));
            }
            if (pileB.length > 0) {
                clumpCount = randomBetween(1, 3);
                if (clumpCount > pileB.length) {
                    clumpCount = pileB.length;
                }
                pile.unshift.apply(pile, pileB.splice(0, clumpCount));
            }
        }
    };
    //Randomize the deck. I couldn't figure out a way to mimic an actual table scramble where the 
    // cards are all spread out and moved around, so I just used this name to pull random cards 
    // from the deck, putting them in the new deck until all done.
    retval.scramble = function() {
        var oldPile = pile;
        pile = [];
        while(oldPile.length > 0) {
            pile.push(oldPile.splice(randomBetween(0, oldPile.length - 1), 1)[0]);
        }
    };
    //Mimics a generic set of shuffling actions.
    retval.shuffle = function() {
        var i, extraActions = randomBetween(0, 10);
        retval.scramble();
        retval.rifle();
        retval.rifle();
        for(i = 0; i < extraActions; i++) {
            if (randomBetween(0,5) === 0) {
                retval.cut();
            }
            else {
                retval.rifle();
            }
        }
        retval.rifle();
        retval.rifle();
        retval.cut();
    };
    retval.toString = function() {
        return pile.map(function(card) {
            card.toString();
        }).join(' ');
    };

    return retval;
};