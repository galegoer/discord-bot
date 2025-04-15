const Calendar = require('../models/Calendar');

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
    let cardType = hand.map(x => x[1]);
    let cards = hand.map(x => x[0]);
    const customSort = ({ data, sortBy }) => {
        const sortByObject = sortBy.reduce((obj, item, index) => {
            return {
                ...obj,
                [item]: index,
            };
        }, {});
        return data.sort(
            (a, b) => sortByObject[a] - sortByObject[b]
        );
    };
    let sortedHand = customSort({ data: cards, sortBy: sortBy });
    let handScore = 0;
    let countType = getCounts(cardType);
    let occurences = getCounts(cards);
    let straight = sortBy.join(',').includes(sortedHand.join(','));

    if (straight && Object.values(countType).includes(5)) { // Royal flush / straight flush
        handScore += 68 * 8
    } else if (Object.values(occurences).includes(4)) { // Four of a kind
        handScore += 67 * 7
    } else if (Object.values(occurences).includes(3) && Object.values(occurences).includes(2)) { // Full house
        handScore += 66 * 6
    } else if (Object.values(countType).includes(5)) { // Flush
        handScore += 65 * 5
    } else if (straight) { // Straight
        handScore += 64 * 4
    } else if (Object.values(occurences).includes(3)) { // Three of a kind
        handScore += 63 * 3
    } else if (Object.values(occurences).includes(2) && Object.values(occurences).includes(2)) { // Two pair
        handScore += 62 * 2
    } else if (Object.values(occurences).includes(2)) { // Pair
        handScore += 61
    }
    handScore += sortBy.indexOf(cards[0]) + sortBy.indexOf(cards[1]) + sortBy.indexOf(cards[2]) + sortBy.indexOf(cards[3]) + sortBy.indexOf(cards[4]);
    return [handScore, sortedHand]
}

function calculatePokerWinner(pokerHands) {
    let currWinner = [0, []];
    for (pokerHand in pokerHands) {
        currHand = calculateHand(pokerHand);
        if (currWinner[0] > currHand[0]) {
            currWinner = currHand;
        }
    }
    return currWinner;
}

async function getCalendarMessage() {
    let message = ``;
    let calendarInfo = await Calendar.findOne();
    if (calendarInfo.events.length == 0) {
        return `There are no events coming up! You guys are lame you should plan something...`;
    }
    for (let i = 0; i < calendarInfo.events.length; i++) {
        let event = calendarInfo.events[i];
        message += `## ${event.name}\n*Date*: ${event.date}\n`;
        message += event.description ? `*Description*: ${event.description}\n` : '';
        message += `*Location*: ${event.location}\n`;
    }
    return `The current upcoming events are:\n${message}`;
}

module.exports = { shuffleArray, calculateScore, calculatePokerWinner, getCalendarMessage };