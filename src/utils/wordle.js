const User = require('../models/User');
const Canvas = require('canvas');

async function canPlay(interaction) {
    try {
        const query = {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
        };
        let user = await User.findOne(query);

        if (user) {
            const lastDailyDate = user.lastDaily.toDateString();
            const currentDate = new Date().toDateString();
            console.log(currentDate);

            if (lastDailyDate === currentDate) {
                // interaction.editReply(
                //     'You have already played your daily wordle. Come back tomorrow!'
                // );
                return false;
            }
            user.lastDaily = new Date();
        }
    } catch (error) {
        console.log(`Error with !playwordle: ${error}`);
    }
    return true;
};

function randomWord() {
    //TODO: Make list of words
    // var randInd = Math.floor(Math.random() * wordList.length);
    // return wordList[randInd];
    return 'TEMPS';
};

function validGuess(guess) {
    if(guess === undefined || guess.length !== 5) return false;
    return true;
};

async function startGame(msg, guesses, answer) {
    const canvas = Canvas.createCanvas(330, 397);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./images/BlankImage.png');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.font = '42px Clear Sans, Helvetica Neue, Arial, sans-serif';
    context.textAlign = 'center'
    context.fillStyle = '#d7dadc';

    const absentSquare = await Canvas.loadImage('./images/ColorAbsent.png');
    const emptySquare = await Canvas.loadImage('./images/EmptySquare.png');
    const greenSquare = await Canvas.loadImage('./images/GreenSquare.png');
    const yellowSquare = await Canvas.loadImage('./images/YellowSquare.png');
    let square = absentSquare;

    let squareSize = 62;
    let rowOffset = 0;
    let buffer = 0;

    for (let j = 0; j < 6; j++)
    {
        for (let i = 0; i < 5; i++)
        {

            if(guesses[j] === undefined) square = emptySquare;
            else if(guesses[j].charAt(i) === answer[j].charAt(i)) square = greenSquare;
            else if(answer[j].includes(guesses.charAt(i))) square = yellowSquare;
            else square = absentSquare;

            context.drawImage(square, i*squareSize+buffer, rowOffset, squareSize, squareSize);
            if(guesses[j] !== undefined) {
                context.fillText(guesses[j].charAt(i), (squareSize/2)+buffer+squareSize*i, rowOffset+42);
            }

            buffer+=5;
        }
        buffer=0;
        rowOffset+=squareSize+5;
    }

    const attachment = new MessageAttachment(canvas.toBuffer(), 'wordle.png');

    msg.reply({files: [attachment] });  
};

async function LoadNewWordle(client, msg) {
    console.log(client);
    console.log(msg);

    if(canPlay(msg)) {
        let answer = randomWord();
        startGame(msg, "", answer);
    }
}

function GuessWordle(client, msg) {

    if(canPlay(msg)) {
        // TODO: if game is started
        // if(gameStarted()) {

        // } else {
        //     msg.reply("You have not started a game yet today");
        // }
        var guess = msg.content.split(" ")[1];
            
        if(!validGuess(guess)) {
            msg.reply("Guesses must be a valid 5 letter word ");
            return;
        }

        // Check guess
        // checkGuess(guess);

        //check to see if guess and answer match
        for (var c=0; c < guess.length; c++) {
            if (guess.charCodeAt(c) !== answer.charCodeAt(c)) {
                // TODO: store guesses in mongodb
                if(guesses.length === 5) {
                    msg.reply("Game over");
                }
                return;
            }
        }

        msg.reply(`Congrats! You guessed the word ${answer} in ${guesses.length+1} tries!`)
    
        return;
    } else {
        msg.reply("You've already played today try again tomorrow.");
        return;
    }
}

function ShowStats(client, msg) {

};

module.exports = { LoadNewWordle, GuessWordle, ShowStats};