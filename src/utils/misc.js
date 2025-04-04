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

module.exports = { shuffleArray, calculateScore };