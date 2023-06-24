/**
 * Desc:
 * Creates a deck for the game.
 */
export async function getDeck(){
    const count = 1;

    const params = new URLSearchParams();
    params.append('deck_count', count);

    const response = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?${params}`)
      
    return response.json()
}

/**
 * 
 * @param {String} deck_id
 * Desc:
 * Creates pile for the game using deck_id.
 */
export async function createPile(deck_id){

    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/SnapPot/add/?cards`)
      
    return response.json()
}

/**
 * 
 * @param {String} deck_id
 * @param {Array} playerCards
 * Desc:
 * Adds player's card/s to the pile using the deck_id.
 */
export async function addPile(deck_id, playerCards){
    if (playerCards) {
        const cards = `?cards=${playerCards.shift()}`
        playerCards.map(card => {
            if (card) {
                cards += `,${card}`
            }
        } )
    
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/SnapPot/add/${cards}`)
          
        return response.json() 
    }
}

/**
 * 
 * @param {String} deck_id
 * @param {Integer} count
 * Desc:
 * Retrieve the cards from the pile.
 */
export async function drawPile(deck_id, count){

    const params = new URLSearchParams();
    params.append('count', count);
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/SnapPot/draw/random/${params}`)
      
    return response.json()
}

/**
 * 
 * @param {String} deck_id
 * @returns Array of card objects
 * 
 * Desc:
 * Retrieve a list of the cards in the pile.
 */
export async function listPile(deck_id){

    const params = new URLSearchParams();
    params.append('count', count);
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/pile/SnapPot/list/`)
      
    return response.json()
}

/**
 * 
 * @param {String} deck_id
 * @param {Integer} count
 * Desc:
 * Retrieve the cards from the main deck. Initial use only.
 */
export async function drawDeck(deck_id, count){

    const params = new URLSearchParams();
    params.append('count', count);

    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?${params}`)
    
    return response.json()
}