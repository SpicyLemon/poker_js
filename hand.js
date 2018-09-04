/*************************************************************************\
* This describes a hand in Texas Hold'em                                  *
* There are seven cards in each hand, only five are actually played.      *
>*************************************************************************<
* A 14x4 array is used to test hands. The 14 comes from the 13 grades     *
* of cards plus an extra one for when the ace is high.                    *
* There's also a five card array for each type of hand (such as two pair, *
* flush, etc.) that gets set while testing if the hand qualifies. This    *
* makes it easier to tell which cards are used for which hands.           *
>*************************************************************************<
* Usages:                                                                 *
\*************************************************************************/
if (typeof TYPES === 'undefined') { TYPES = {}; }
TYPES.hand = function(spec) {
    /*****************\
    *   HIDDEN VARS   *
    \*****************/
    //The hand rank (see below for rank explanation)
    var rank = 0;
    //A string name for the hand
    var handName = "";
    //The 7 cards involved in this hand (2 hole cards + 5 board cards)
    var cards = [];
    //handarray is a 14x4 array used for hand testing. 
    // 14 = 13 card grades + 1 to also represent an ace being high. 
    // 4 = each suit.
    var handArray = dim([14, 4], false);
    //hands stores the 5 cards used for each given hand that it qualifies for.
    // For example, if a hand is a straight, the 5 cards used in the straight
    // will be stored in hands.straight. If it also qualifies as a flush, those
    // five flush cards will be set in cards.flush.
    var hands = {
        straightFlush: [],
        fourOfAKind:   [],
        fullHouse:     [],
        flush:         [],
        straight:      [],
        threeOfAKind:  [],
        twoPair:       [],
        pair:          [],
        highCard:      [],
    };
    //cards played stores the best 5 cards that can be played with this hand.
    var cardsPlayed = [];
    
    /**********************\
    *   HIDDEN FUNCTIONS   *
    \**********************/
    var addCardEntries = function(entry) {
        if (entry) {
            if (Array.isArray(entry)) {
                entry.forEach(function(card) {
                    addCard(card);
                });
            }
            else {
                addCard(entry);
            }
        }
    };
    var addCard = function(c) {
        if (c && c.isCard && c.isCard()) {
            cards.push(c);
        }
        else {
            cards.push(TYPES.card(c));
        }
    };

    var setUpHand = function() {
        sortCards();
        populateHandArray();
        populateHands();
        calculateRank();
    };
    var sortCards = function() {
        cards.sort(function(a, b) {
            var retval = a.iseq(b) ? a.getSuit - b.getSuit
                       : a.isgt(b) ? -1 : 1 ;
            return retval;
        })
    };
    var populateHandArray = function() {
        cards.forEach(function(card) {
            if (handArray[card.getGrade() - 1][card.getSuit() - 1]) {
                console.log("Invalid hand definition (duplicate card): ", spec);
            }
            else {
                handArray[card.getGrade() - 1][card.getSuit() - 1] = true;
                if (card.getGrade() === 1) {
                    handArray[13][card.getSuit() - 1] = true;
                }
            }
        });
    };
    var populateHands = function() {
        populateHandsHighCard();
        populateHandsPair();
        populateHandsTwoPair();
        populateHandsThreeOfAKind();
        populateHandsStraight();
        populateHandsFlush();
        populateHandsFullHouse();
        populateHandsFourOfAKind();
        populateHandsStraightFlush();
    };

    var populateHandsHighCard = function() {
        fillHighCards("highCard");
    };
    var populateHandsPair = function() {
        var cardsIndex;
        for (cardsIndex = 0; cardsIndex < cards.length - 1; cardsIndex++) {
            if (cards[cardsIndex].iseq(cards[cardsIndex+1])) {
                //Success!
                hands.pair.push(cards[cardsIndex].getCopy());
                hands.pair.push(cards[cardsIndex+1].getCopy());
                fillHighCards("pair");
                cardsIndex = 100;
            }
        }
    };
    var populateHandsTwoPair = function() {
        if (hands.pair.length === 5) {
            for (cardsIndex = 0; cardsIndex < cards.length - 1; cardsIndex++) {
                if (cards[cardsIndex].iseq(cards[cardsIndex+1])) {
                    hands.twoPair.push(cards[cardsIndex].getCopy());
                    hands.twoPair.push(cards[cardsIndex+1].getCopy());
                    cardsIndex++;
                    if (hands.twoPair.length === 4) {
                        //Success!
                        fillHighCards("twoPair");
                        cardsIndex = 100;
                    }
                }
            }
        }
    };
    var populateHandsThreeOfAKind = function() {
        if (hands.pair.length === 5) {
            for (cardsIndex = 0; cardsIndex < cards.length - 2; cardsIndex++) {
                if (cards[cardsIndex].iseq(cards[cardsIndex+2]) 
                        && cards[cardsIndex].iseq(cards[cardsIndex+1])) {
                    //Success!
                    hands.threeOfAKind.push(cards[cardsIndex].getCopy());
                    hands.threeOfAKind.push(cards[cardsIndex+1].getCopy());
                    hands.threeOfAKind.push(cards[cardsIndex+2].getCopy());
                    fillHighCards("threeOfAKind");
                    cardsIndex = 100;
                }
            }
        }
    };
    var populateHandsStraight = function() {
        var suit, grade, foundCard;
        for(grade = 14; grade >= 1; grade--) {
            foundCard = false;
            for(suit = 1; suit <= 4; suit++) {
                if (handArray[grade-1][suit-1]) {
                    foundCard = true;
                    hands.straight.push(TYPES.card({ "grade": grade, "suit": suit }));
                    suit = 100;
                }
            }
            if (foundCard) {
                if (hands.straight.length === 5) {
                    //Success!
                    grade = 0;
                }
            }
            else {
                hands.straight.length = 0;
            }
        }
        if (hands.straight.length != 5) {
            hands.straight.length = 0;
        }
    };
    var populateHandsFlush = function() {
        var suit, grade;
        for (suit = 1; suit <= 4; suit++) {
            for (grade = 14; grade >= 2 && hands.flush.length < 5; grade--) {
                if (handArray[grade-1][suit-1]) {
                    hands.flush.push(TYPES.card({ "grade": grade, "suit": suit }));
                }
            }
            if (hands.flush.length === 5) {
                //Success! We're done here.
                suit = 100;
            }
            else {
                //Nope, clear it out.
                hands.flush.length = 0;
            }
        }
    };
    var populateHandsFullHouse = function() {
        if (hands.threeOfAKind.length === 5 && hands.twoPair.length === 5) {
            var cardsIndex, i;
            for (cardsIndex = 0; cardsIndex < cards.length - 1; cardsIndex++) {
                if (cards[cardsIndex].iseq(cards[cardsIndex+1]) 
                        && cards[cardsIndex].isne(hands.threeOfAKind[0])) {
                    //Success!
                    for (i = 0; i <= 2; i++) {
                        hands.fullHouse[i] = hands.threeOfAKind[i].getCopy();
                    }
                    hands.fullHouse.push(cards[cardsIndex].getCopy());
                    hands.fullHouse.push(cards[cardsIndex+1].getCopy());
                    cardsIndex = 100;
                }
            }
        }
    };
    var populateHandsFourOfAKind = function() {
        if (hands.threeOfAKind.length === 5) {
            var cardsIndex;
            for (cardsIndex = 0; cardsIndex < cards.length - 3; cardsIndex++) {
                if (cards[cardsIndex].iseq(cards[cardsIndex+3]) 
                        && cards[cardsIndex].iseq(cards[cardsIndex+2]) 
                        && cards[cardsIndex].iseq(cards[cardsIndex+1])) {
                    //Success!
                    hands.fourOfAKind.push(cards[cardsIndex].getCopy());
                    hands.fourOfAKind.push(cards[cardsIndex+1].getCopy());
                    hands.fourOfAKind.push(cards[cardsIndex+2].getCopy());
                    hands.fourOfAKind.push(cards[cardsIndex+3].getCopy());
                    fillHighCards("fourOfAKind");
                    cardsIndex = 100;
                }
            }
        }
    };
    var populateHandsStraightFlush = function() {
        if (hands.flush.length === 5 && hands.straight.length === 5) {
            var suit = hands.flush[0].getSuit();
            var grade, count = 0;
            for (grade = 14; grade >= 5 - count; grade--) {
                if (handArray[grade-1][suit-1]) {
                    count++;
                    if (count === 5) {
                        //success!
                        for (count = 0; count < 5; count++) {
                            hands.straightFlush.unshift(TYPES.card({ "grade": grade + count, "suit": suit }));
                        }
                        grade = 0;
                    }
                }
                else {
                    count = 0;
                }
            }
        }
    };
    var fillHighCards = function(handType) {
        var cardsIndex, handTypeIndex, alreadyHasCard;
        for (cardsIndex = 0; cardsIndex < cards.length && hands[handType].length < 5; cardsIndex++) {
            alreadyHasCard = false;
            for (handTypeIndex = 0; handTypeIndex < hands[handType].length; handTypeIndex++) {
                if (cards[cardsIndex].isSameAs(hands[handType][handTypeIndex])) {
                    alreadyHasCard = true;
                    handTypeIndex = 100;
                }
            }
            if (! alreadyHasCard) {
                hands[handType].push(cards[cardsIndex].getCopy());
            }
        }
    }

    /*****************************************\
    * a hands rank is as follows              *
    *     royal flush: 1       - ~            *
    *    Strait Flush: 2       - 10           *
    *  Four of a Kind: 11      - 249          *
    *      Full House: 250     - 499          *
    *           Flush: 500     - 799,999      *
    *          Strait: 800,000 - 800,019      *
    * Three of a kind: 800,020 - 303,999      *
    *        Two pair: 804,000 - 807,999      *
    *            pair: 808,000 - 899,999      *
    *       high card: 900,000 - ~            *
    * a hands rank also includes its kickers  *
    * I know there's lots of wiggle room,     *
    *    but I don't care.                    *
    >*****************************************<
    * formula for calculating hands:          *
    * find number of values needed to         *
    *   distinguish one hand from another     *
    *   (include all kickers)                 *
    * look up formula below.                  *
    * 1: _                           m:14     *
    * 2: _+15*_                      m:224    *
    * 3: _+15*(_+15*_)               m:3374   *
    * 4: _+15*(_+15*(_+15*_))        m:50624  *
    * 5: _+15*(_+15*(_+15*(_+15*_))) m:759374 *
    * note: the m value is calculated by      *
    *   putting 14 in each blank, it is the   *
    *   maximum that each formula can have    *
    * insert important values in spaces with  *
    *   the least important number in the     *
    *   first space followed by the second    *
    *   etc. Call this number n.              *
    * finally use the first table and find    *
    * the beginning for the hand              *
    * for example, if it's two pair, the      *
    *   beginning is 804,000.                 *
    * finally,                                *
    *      rank = beginning + m - n           *
    \*****************************************/
    var calculateRank = function() {
        var v1, v2, v3, v4, v5, n;
        //Straight/Royal Flush
        //1-10
        if (hands.straightFlush.length === 5) {
            v1 = hands.straightFlush[0].getHighGrade();
            rank = 1 + 14 - v1;
            handName = rank === 1 ? "Royal Flush" : "Straight Flush";
            cardsPlayed = hands.straightFlush;
        }
        //Four of a Kind
        //11-249
        if (rank === 0 && hands.fourOfAKind.length === 5) {
            v1 = hands.fourOfAKind[0].getHighGrade();
            v2 = hands.fourOfAKind[4].getHighGrade();
            n = v2 + 15 * v1;
            rank = 11 + 224 - n;
            handName = "Four of a Kind";
            cardsPlayed = hands.fourOfAKind;
        }
        //Full House
        //250-499
        if (rank === 0 && hands.fullHouse.length === 5) {
            v1 = hands.fullHouse[0].getHighGrade();
            v2 = hands.fullHouse[3].getHighGrade();
            n = v2 + 15 * v1;
            rank = 250 + 224 - n;
            handName = "Full House";
            cardsPlayed = hands.fullHouse;
        }
        //Flush
        //500-799,999
        if (rank === 0 && hands.flush.length === 5) {
            v1 = hands.flush[0].getHighGrade();
            v2 = hands.flush[1].getHighGrade();
            v3 = hands.flush[2].getHighGrade();
            v4 = hands.flush[3].getHighGrade();
            v5 = hands.flush[4].getHighGrade();
            n =  v5 + 15 * (v4 + 15 * (v3 + 15 * (v2 + 15 * v1)));
            rank = 500 + 759374 - n;
            handName = "Flush";
            cardsPlayed = hands.flush;
        }
        //Straight
        //800,000-800,019
        if (rank === 0 && hands.straight.length === 5) {
            v1 = hands.straight[0].getHighGrade();
            rank = 800000 + 14 - v1;
            handName = "Straight";
            cardsPlayed = hands.straight;
        }
        //Three of a Kind
        //800,020-303,999
        if (rank === 0 && hands.threeOfAKind.length === 5) {
            v1 = hands.threeOfAKind[0].getHighGrade();
            v2 = hands.threeOfAKind[3].getHighGrade();
            v3 = hands.threeOfAKind[4].getHighGrade();
            n = v3 + 15 * (v2 + 15 * v1);
            rank = 800020 + 3374 - n;
            handName = "Three of a Kind";
            cardsPlayed = hands.threeOfAKind;
        }
        //Two Pair
        //804,000-807,999
        if (rank === 0 && hands.twoPair.length === 5) {
            v1 = hands.twoPair[0].getHighGrade();
            v2 = hands.twoPair[2].getHighGrade();
            v3 = hands.twoPair[4].getHighGrade();
            n = v3 + 15 * (v2 + 15 * v1);
            rank = 804000 + 3374 - n;
            handName = "Two Pair";
            cardsPlayed = hands.twoPair;
        }
        //One Pair
        //808,000-899,999
        if (rank === 0 && hands.pair.length === 5) {
            v1 = hands.pair[0].getHighGrade();
            v2 = hands.pair[2].getHighGrade();
            v3 = hands.pair[3].getHighGrade();
            v4 = hands.pair[4].getHighGrade();
            n = v4 + 15 * (v3 + 15 * (v2 + 15 * v1));
            rank = 808000 + 50624 - n;
            handName = "Pair";
            cardsPlayed = hands.pair;
        }
        //High Card
        //900,000->
        if (rank === 0) {
            v1 = hands.highCard[0].getHighGrade();
            v2 = hands.highCard[1].getHighGrade();
            v3 = hands.highCard[2].getHighGrade();
            v4 = hands.highCard[3].getHighGrade();
            v5 = hands.highCard[4].getHighGrade();
            n =  v5 + 15 * (v4 + 15 * (v3 + 15 * (v2 + 15 * v1)));
            rank = 900000 + 759374 - n;
            handName = "High Card";
            cardsPlayed = hands.highCard;
        }
    };

    /**********************\
    *   CONSTRUCTOR AREA   *
    \**********************/
    if (spec.constructor === Array) {
        //Allow for a flat array, or an array of arrays, or even a mix.
        //example 1: [card1, card2, card3, card4, card5, card6, card7];
        //example 2: [[card1, card2], [card3, card4, card5], [card6], [card7]];
        //example 3: [[card1, card2], [card3, card4, card5], card6, card7];
        spec.forEach(function(entry) {
            addCardEntries(entry);
        });
    } else {
        //assume it's an object with the cards split out into arrays in parameters.
        //example 1: { hole: [card1, card2], board: [card3, card4, card5, card6, card7]};
        //example 2: { hole: [card1, card2], flop: [card3, card4, card5], turn: [card6], river: [card7]};
        //example 3: { hole: [card1, card2], flop: [card3, card4, card5], turn: card6, river: card7};
        ['hole', 'board', 'flop', 'turn', 'river'].forEach(function(param) {
            addCardEntries(spec[param]);
        });
    }
    if (cards.length === 7) {
        setUpHand();
    }
    else {
        console.log("Invalid hand definition (incorrect card count): ", spec);
    }

    /************************\
    *    END HIDDEN STUFF    *
    \************************/
    var retval = {};

    retval.isHandType = function(handType) {
        if (!hands[handType]) {
            console.log("Invalid handType variable passed to isHandType: '" + handType + "'. Returning false.");
            console.trace();
            return false;
        }
        return hands[handType].length === 5;
    };
    retval.isRoyalFlush = function() {
        return hands.straightFlush.length === 5 && hands.straightFlush[0].getGrade === 1;
    };
    retval.isStraightFlush = function() {
        return hands.straightFlush.length === 5;
    };
    retval.isFourOfAKind = function() {
        return hands.fourOfAKind.length === 5;
    };
    retval.isFullHouse = function() {
        return hands.fullHouse.length === 5;
    };
    retval.isFlush = function() {
        return hands.flush.length === 5;
    };
    retval.isStraight = function() {
        return hands.straight.length === 5;
    };
    retval.isThreeOfAKind = function() {
        return hands.threeOfAKind.length === 5;
    };
    retval.isTwoPair = function() {
        return hands.twoPair.length === 5;
    };
    retval.isPair = function() {
        return hands.isPair.length === 5;
    };
    retval.getRank = function() {
        return rank;
    };
    retval.getHandName = function() {
        return handName;
    };
    retval.getCardsPlayed = function(handType) {
        if (handType) {
            if (hands[handType]) {
                return hands[handType];
            }
            console.log("Invalid handType variable passed to getCardsPlayed: '" + handType + "'");
            console.trace();
        }
        return cardsPlayed;
    };
    retval.getCardsPlayedString = function(handType) {
        var i;
        var myCards = retval.getCardsPlayed(handType);
        var cardString = "";
        if (myCards.length === 5) {
            cardString = myCards[0].toString();
            for(i = 1; i < 5; i++) {
                cardString += " " + myCards[i].toString();
            }
        }
        return cardString;
    };
    retval.getAllCards = function() {
        return cards;
    };
    retval.getAllCardsString = function() {
        var i, retval = cards[0].toString();
        for(i = 1; i < 7; i++) {
            retval += " " + cards[i].toString();
        }
        return retval;
    };

    return retval;
};
