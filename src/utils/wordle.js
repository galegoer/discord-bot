const User = require('../models/User');
const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');

const wordleAmt = 10000;

async function getUser(msg) {
    try {
        const query = {
            userId: msg.author.id,
            guildId: msg.guildId,
        };
        let user = await User.findOne(query);
        return user;
    } catch (error) {
        console.log(`Error finding user: ${error}`);
    }
}

async function canPlay(msg) {
    let user = await getUser(msg);
    if (user) {
        var currDate = new Date();
        var options = {
            year: "numeric",
            month: "2-digit",
            day: "numeric"
        };

        // Working solution for Node on EC2 instance, implementation dependent otherwise
        var lastWordleDate =  new Date(user.lastWordleDate.toString()).toLocaleString("en-CA", options);
        var currDateStr = currDate.toLocaleString("en-CA", options);

        console.log(lastDailyDate, currDateStr);

        // if word exists we can continue playing
        if (user.currWordle !== "") {
            return user;
        // if word does not exist and date is same, we already played
        } else if (lastWordleDate === currDateStr) {
            msg.reply(`You have already played your daily wordle. Come back tomorrow!`);
            return;
        // word does not exist and not same day, start game
        } else {
            let answer = await randomWord();
            user.currWordle = answer;
        }
    // user does not exist set them up
    } else {
        // set to yesterday because new user
        let yesterday = currDate;
        yesterday.setDate(yesterday.getDate() - 1);
        user = new User({
            ...query,
            lastDaily: yesterday,
            lastWordleDate: yesterday,
            currWordle: await randomWord(),
        });
    }
    await user.save();
    return user;
};

async function randomWord() {
    const url = `https://random-word-api.vercel.app/api?words=1&length=5`
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const word = data[0];
            return word.toUpperCase();
        }
    } catch (error) {
        console.error(error);
        throw new Error(`Error with word generator: ${error}`);
    }
};

function validGuess(guess) {
    if(guess === undefined || guess.length !== 5) return false;
    return true;
};

async function showUpdate(msg, guesses, user) {
    const canvas = Canvas.createCanvas(330, 397);
    const context = canvas.getContext('2d');

    const background = await Canvas.loadImage(path.resolve(__dirname, '../images/BlankImage.png'));
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.font = '42px Clear Sans, Helvetica Neue, Arial, sans-serif';
    context.textAlign = 'center'
    context.fillStyle = '#d7dadc';

    const absentSquare = await Canvas.loadImage(path.resolve(__dirname, '../images/ColorAbsent.png'));
    const emptySquare = await Canvas.loadImage(path.resolve(__dirname, '../images/EmptySquare.png'));
    const greenSquare = await Canvas.loadImage(path.resolve(__dirname, '../images/GreenSquare.png'));
    const yellowSquare = await Canvas.loadImage(path.resolve(__dirname, '../images/YellowSquare.png'));
    let square = absentSquare;

    let squareSize = 62;
    let rowOffset = 0;
    let buffer = 0;
    let answer = user.currWordle;

    for (let guess = 0; guess < 6; guess++) {
        for (let letter = 0; letter < 5; letter++) {
            if(guesses[guess] === undefined) square = emptySquare;
            else if(guesses[guess].charAt(letter) === answer.charAt(letter)) {
                square = greenSquare;
            }
            else if(answer.includes(guesses[guess].charAt(letter))) square = yellowSquare;
            else square = absentSquare;

            context.drawImage(square, letter*squareSize+buffer, rowOffset, squareSize, squareSize);
            if(guesses[guess] !== undefined) {
                context.fillText(guesses[guess].charAt(letter), (squareSize/2)+buffer+squareSize*letter, rowOffset+42);
            }

            buffer += 5;
        }
        buffer = 0;
        rowOffset += squareSize+5;
    }
    if(guesses[guesses.length-1] === answer) {
        user.balance += wordleAmt;
        msg.reply(`Congrats! You guessed the word ${answer} in ${guesses.length} tries! Your new balance is ${user.balance}`);
        user.wordleWins += 1;
    } else if (guesses.length >= 6) {
        msg.reply(`You failed to guess the word ${answer} in 6 tries! Try again tomorrow!`);
    } else {
        msg.reply({ files: [{attachment: canvas.toBuffer(), name: 'wordle.png'}]})
        .catch((error) => {
            console.error('Error sending wordle: ', error);
        });
        return;
    }
    // update so we can't play again today
    user.lastWordleDate = new Date();
    user.currWordle = "";
    user.guesses = [];
    user.numGames += 1;
    await user.save();
    return;
};

async function GuessWordle(client, msg) {
    
    let user = await canPlay(msg);
    if(user === undefined) return;
    let guesses = user.guesses;

    console.log(guesses);

    var guess = msg.content.split(" ")[1];

    if(!validGuess(guess)) {
        msg.reply("Guesses must be a valid 5 letter word.");
        return;
    }
    guesses.push(guess.toUpperCase());
    user.guesses = guesses
    await user.save()
    showUpdate(msg, guesses, user);

    return;
}

module.exports = { GuessWordle };