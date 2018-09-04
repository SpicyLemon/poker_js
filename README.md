# poker_js
A Texas Hold'em Poker simulator written in javascript.

Because it's javascript, the main interaction is through webpages, and the code is run in your own browser.

## HTML Files
These files allow you to interact with and actually run similuations.  If you're looking to just run the simulations, these are the files you're looking for.

### live_play.html
This page allows you to enter hole cards and optional flop, turn and river cards, run the hand a certain number of iterations, and get the results.

### play_hand.html
This page allows you to enter hole cards, and optional flop, and turn cards, run the hand a certain number of iterations, and get statistics on which type of hands you might end up with.

### rank_pockets.html
This page allows you to enter the number of players.  It then will play out a certain number of hands and rank them according to which hands win the most.  The upper left-grey cells represent suited hole cards while the lower left white cells represent offsuit hole cards.  The simulation assumes all players stay in until the showdown.

### test_deal.html
This is just a page I used to verify the application.  It picks 10 sets of hole cards, and the entire board and puts them all together to form 10 hands.  It then ranks and tells what type of hand each is.  Refreshing the page gives a new deal.

### test_hands.html
This is another page I used to verify the application.  It's a hard-coded list of 7-card combinations and what the resulting hands are.  It also allows for temporarily adding other hands on the fly so that it's easy to test any hand you can think of.

## Javascript files
These contain the core code to the simulations.  If you're looking for the meat of the simulations, these are the files you're looking for.

### SpicyLibrary.js
This is just a js library that I've gathered and put together and often use in projects.  Not everything that's in there is used, but some of it is.

### card.js
This is the code that represents a card from a standard 52-card deck.

### deck.js
This is the code that represents a deck of cards.

### hand.js
This is the code that represents a standard Texas Hold'em poker hand.  That is, two hole cards, three flop cards, one turn card, and one river card.  Only 5 cards go into making the final hand.

### jquery-3.1.1.min.js
This is the jquery 3.1.1 minimized javascript library downloaded from google.  It's used on the html pages to make DOM manipulation easier.
