function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function calculateScore(array) {
    let score = 0;
    let numAces = 0;
    for (let i = 0; i < array.length; i++) {
        let card = array[i].slice(0,-1);
        if (card === "King" || card === "Queen" || card === "Jack") {
            score += 10;
        } else if (card === "Ace") {
            score++;
            numAces++;
        } else {
            score += parseInt(card);
        }
        if (score > 21) {
            return -1;
        }
    }
    for (let i = 0; i < numAces; i++) {
        if (score + 10 <= 21) {
            score += 10;
        }
    }
    return score;
}

function getCounts(hand) {
    let counts = {};
    for (let i = 0; i < hand.length; i++) {
        counts[hand[i]] = (counts[hand[i]] || 0) + 1;
    }
    return counts;
}

function calculateHand(hand) {
    const sortBy = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    const customSort = ({ data, sortBy }) => {
        const sortByObject = sortBy.reduce((obj, item, index) => {
            return {
                ...obj,
                [item]: index,
            };
        }, {});
        return data.sort(
            (a, b) => sortByObject[a[0]] - sortByObject[b[0]]
        );
    };
    hand.customSort({ data: hand, sortBy: sortBy });
    let handScore = 0;
    let cardType = hand.map(x => x[1]);
    let cardNum = hand.map(x => x[0]);
    let countType = getCounts(cardType);
    let countNum = getCounts(cardNum);

    if (sortedHand in sortBy && Object.values(countType).includes(5)) { // Royal flush / straight flush
        handScore += 8
    } else if (Object.values(countNum).includes(4)) { // Four of a kind
        handScore += 7
    } else if (Object.values(countNum).includes(3) && Object.values(countNum).includes(2)) { // Full house
        handScore += 6
    } else if (Object.values(countType).includes(5)) { // Flush
        handScore += 5
    } else if (sortedHand in sortBy) { // Straight
        handScore += 4
    } else if (Object.values(countNum).includes(3)) { // Three of a kind
        handScore += 3
    } else if (Object.values(countNum).includes(2) && Object.values(countNum).includes(2)) { // Two pair
        handScore += 2
    } else if (Object.values(countNum).includes(2)) { // Pair
        handScore += 1
    }
    return handScore, hand
}

function calculatePokerWinner(pokerHands) {
    scoreOrder = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush', 'Royal flush'];
    let filter = {};
    for (pokerHand in pokerHands) {
        let score = compareHands(pokerHand);
        if (scoreOrder[score] in filter) {
            filter[scoreOrder[score]].push(pokerHand);
        } else {
            filter[scoreOrder[score]] = [pokerHand];
        }
    }
    return filter



}

module.exports = { shuffleArray, calculateScore, calculatePokerWinner };