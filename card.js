/*************************************************************************\
* This describes a standard card in a standard playing deck.              *
>*************************************************************************<
* Usages: var c1 = TYPES.card("AC");   // Ace of Clubs                    *
*         var c2 = TYPES.card("3S");   // Three of Spades                 *
*         var c3 = TYPES.card({                                           *
*                     grade: 'King',                                      *
*                     suit: 'Diamonds'                                    *
*                  });                  //King of Diamonds                *
*         var c4 = TYPES.card({grade:'J',suit:'H'});  // Jack of Hearts   *
\*************************************************************************/
if (typeof TYPES === 'undefined') { TYPES = {}; }
TYPES.card = function(spec) {
    /*****************\
    *   HIDDEN VARS   *
    \*****************/
    var grade = -1;     //1 = Ace, 2 = 2 ... 10 = 10, 11 = Jack, 12 = Queen, 13 = King
    var suit = -1;      //1 = Diamonds, 2 = Hearts, 3 = Spades, 4 = Clubs

    /**********************\
    *   HIDDEN FUNCTIONS   *
    \**********************/
    var gradeStringToValue = function(g) {
        g = g.toUpperCase();
        var retval = g === 'A' || g === 'ACE'   ? 1
                   : g === 'T'                  ? 10
                   : g === 'J' || g === 'JACK'  ? 11
                   : g === 'Q' || g === 'QUEEN' ? 12
                   : g === 'K' || g === 'KING'  ? 13
                   :                              g * 1;
        if (retval < 1 || retval > 13) {
            retval = -1;
        }
        return retval;
    };
    var gradeValueToChar = function(v) {
        var retval = v === 1 || v === 14 ? 'A'
                   : v >= 2  && v <= 9   ? v + ''
                   : v === 10            ? 'T'
                   : v === 11            ? 'J'
                   : v === 12            ? 'Q'
                   : v === 13            ? 'K'
                   :                       '';
        return retval;
    };
    var suitStringToValue = function(s) {
        s = s.toUpperCase();
        var retval = s === 'D' || s === 'DIAMONDS' || s === 'DIAMOND' ? 1
                   : s === 'H' || s === 'HEARTS'   || s === 'HEART'   ? 2
                   : s === 'S' || s === 'SPADES'   || s === 'SPADE'   ? 3
                   : s === 'C' || s === 'CLUBS'    || s === 'CLUB'    ? 4
                   :                                                   -1
        return retval;
    };
    var suitValueToChar = function(s) {
        var retval = s === 1 ? 'D'
                   : s === 2 ? 'H'
                   : s === 3 ? 'S'
                   : s === 4 ? 'C'
                   :           ''
        return retval;
    };
    var suitValueToString = function(s) {
        return _suitValueToStringSingular(s) + 's';
    };
    var suitValueToStringSingular = function(s) {
        var retval = s === 1 ? 'Diamond'
                   : s === 2 ? 'Heart'
                   : s === 3 ? 'Spade'
                   : s === 4 ? 'Club'
                   :           ''
        return retval;
    };

    /**********************\
    *   CONSTRUCTOR AREA   *
    \**********************/
    if (typeof spec === 'string') {
        grade = gradeStringToValue(spec.charAt(0));
        suit = suitStringToValue(spec.charAt(1));
    }
    else {
        if (typeof spec.grade === 'string') {
            grade = (spec.grade);
        }
        else {
            grade = spec.grade;
        }
        if (typeof spec.suit === 'string') {
            suit = suitStringToValue(spec.suit);
        }
        else {
            suit = spec.suit;
        }
    }
    //Make sure aces are 1.
    if (grade === 14) {
        grade = 1;
    }
    if (grade < 1 || grade > 13 || suit < 1 || suit > 4) {
        console.log("Invalid card definition: ", spec);
        grade = -1;
        suit = -1;
    }

    /************************\
    *    END HIDDEN STUFF    *
    \************************/
    
    var retval = {};
    retval.getGrade = function() {
        return grade;
    };
    retval.getHighGrade = function() {
        return grade == 1 ? 14 : grade;
    }
    retval.getSuit = function() {
        return suit;
    };
    retval.getGradeChar = function() {
        return gradeValueToChar(grade);
    };
    retval.getSuitChar = function() {
        return suitValueToChar(suit);
    };
    retval.getSuitString = function() {
        return suitValueToString(suit);
    };
    retval.getCopy = function() {
        return TYPES.card({ "grade": grade, "suit": suit });
    }
    retval.toString = function() {
        return gradeValueToChar(grade) + suitValueToChar(suit);
    };

    /************************\
    *   BEGIN TEST METHODS   *
    \************************/
    //These test methods assume that suit doesn't matter when ranking a card.
    //Also, an ace will return both less than a two, and greater than a king.
    retval.isgt = function(otherCard) {
        if (otherCard.getGrade() === 1) {
            return false;
        }
        if (grade === 1) {
            return true;
        }
        return grade > otherCard.getGrade();
    };
    retval.isge = function(otherCard) {
        if (otherCard.getGrade() === 1) {
            if (grade === 1) {
                return true;
            }
            return false;
        }
        if (grade === 1) {
            return true;
        }
        return grade >= otherCard.getGrade();
    };
    retval.iseq = function(otherCard) {
        return grade === otherCard.getGrade();
    };
    retval.isne = function(otherCard) {
        return grade !== otherCard.getGrade();
    };
    retval.islt = function(otherCard) {
        if (otherCard.getGrade() === 1) {
            return false;
        }
        if (grade === 1) {
            return true;
        }
        return grade < otherCard.getGrade();
    };
    retval.isle = function(otherCard) {
        if (otherCard.getGrade() === 1) {
            if (grade === 1) {
                return true;
            }
            return false;
        }
        if (grade === 1) {
            return true;
        }
        return grade <= otherCard.getGrade();
    };
    retval.isSameAs = function(otherCard) {
        return otherCard && grade === otherCard.getGrade() && suit === otherCard.getSuit();
    };
    retval.isSuitedWith = function(otherCard) {
        return suit === otherCard.getSuit();
    };
    /************************\
    *    END TEST METHODS    *
    \************************/
    retval.isCard = function() {
        return true;
    };
    
    return retval;
};