const User = require('../models/User');
const Canvas = require('canvas');
const path = require('path');
const fetch = require('node-fetch');

async function canPlay(msg) {
    try {
        const query = {
            userId: msg.author.id,
            guildId: msg.guildId,
        };
        let user = await User.findOne(query);

        if (user) {
            const lastWordleDate = user.lastWordleDate.toDateString();
            const currentDate = new Date().toDateString();

            // if word exists we can continue playing
            if (user.currWordle !== "") {
                return user;
            // if word does not exist and date is same, we already played
            } else if (lastWordleDate === currentDate) {
                msg.reply('You have already played your daily wordle. Come back tomorrow!');
                return;
            // word does not exist and not same day, start game
            } else {
                let answer = await randomWord();
                user.currWordle = answer;
            }
        // user does not exist set them up
        } else {
            // set to yesterday because new user nothing started
            let yesterday = new Date();
            // yesterday.setDate(yesterday.getDate() - 1);
            user = new User({
                ...query,
                lastDaily: yesterday,
                lastWordleDate: yesterday,
                currWordle: await randomWord(),
            });
        }
        await user.save();
        return user;
    } catch (error) {
        console.log(`Error with database: ${error}`);
    }
};

async function randomWord() {
    //TODO: Make list of words
    const url = `https://random-word-api.vercel.app/api?words=1&length=5`
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const word = data[0];
            return word;
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
    let numGreen = 0;
    let answer = user.currWordle;

    for (let guess = 0; guess < 6; guess++) {
        for (let letter = 0; letter < 5; letter++) {
            // console.log(guesses[guess], answer);
            if(guesses[guess] === undefined) square = emptySquare;
            else if(guesses[guess].charAt(letter) === answer.charAt(letter)) {
                square = greenSquare;
                numGreen += 1;
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
    if(numGreen == 5) {
        msg.reply(`Congrats! You guessed the word ${answer} in ${guesses.length+1} tries!`);
        user.wordleWins += 1;
    // should just be equal to 5? but if it somehow pulls more guesses?
    } else if (guesses.length >= 5) {
        msg.reply(`You failed to guess the word ${answer} in 5 tries! Try again tomorrow!`);
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
    user.numGames += 1;
    await user.save();
    return;
};

async function GuessWordle(client, msg) {
    
    let user = await canPlay(msg);
    if(user === undefined) return;
    // TODO: pull guesses from user, pulling previous messages but they may talk in between or invalid guesses
    const channel = await client.channels.fetch(msg.channelId);
    let prevMsgs = await channel.messages.fetch(limit=10, after=user.lastWordleDate);
    let guesses = [];

    prevMsgs.reverse();

    prevMsgs.forEach((prevMsg) => {
        // ignore if last message was from someone else
        // console.log(prevMsg.content, prevMsg.author, msg.author);
        if (prevMsg.author.id !== msg.author.id) return;
        // console.log(prevMsg.content.split(" "));
        if(prevMsg.content.includes('!guess') && validGuess(prevMsg.content.split(" ")[1])) {
            guesses.push(prevMsg.content.split(" ")[1].toUpperCase());
        }
    });

    console.log(guesses);

    var guess = msg.content.split(" ")[1];

    if(!validGuess(guess)) {
        msg.reply("Guesses must be a valid 5 letter word.");
        return;
    }
    guesses.push(guess.toUpperCase());
    showUpdate(msg, guesses, user);

    return;
}

async function ShowStats(client, msg) {
    let user = await canPlay(msg);
    message_content = `Num Games: ${user.numGames} \n Wordle Wins: ${user.wordleWins} \n Win Rate: ${user.wordleWins/user.numGames}`

    msg.reply(message_content);
};

module.exports = { GuessWordle, ShowStats};