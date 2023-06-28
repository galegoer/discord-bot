const User = require('../models/User');
const Canvas = require('canvas');
const path = require('path');

async function canPlay(msg) {
    try {
        const query = {
            userId: msg.author.id,
            guildId: msg.guildId,
        };
        let user = await User.findOne(query);

        if (user) {
            const lastWordle = user.lastWordleDate.toDateString();
            const currentDate = new Date().toDateString();
            console.log(lastWordle, currentDate);

            if (lastWordle === currentDate) {
                msg.reply('You have already played your daily wordle. Come back tomorrow!');
                return;
            }
        } else {
            // set to yesterday because new user nothing started
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            console.log(yesterday.toDateString());
            user = new User({
                ...query,
                lastDaily: yesterday,
                lastWordleDate: yesterday,
            });
        }
        await user.save();
        return user;
    } catch (error) {
        console.log(`Error with !playwordle: ${error}`);
    }
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
    console.log(user);
    let answer = user.lastWordle;

    for (let j = 0; j < 6; j++) {
        for (let i = 0; i < 5; i++) {
            if(guesses[j] === undefined) square = emptySquare;
            else if(guesses[j].charAt(i) === answer[j].charAt(i)) {
                square = greenSquare;
                numGreen += 1;
            }
            else if(answer[j].includes(guesses.charAt(i))) square = yellowSquare;
            else square = absentSquare;

            context.drawImage(square, i*squareSize+buffer, rowOffset, squareSize, squareSize);
            if(guesses[j] !== undefined) {
                context.fillText(guesses[j].charAt(i), (squareSize/2)+buffer+squareSize*i, rowOffset+42);
            }

            buffer += 5;
        }
        buffer = 0;
        rowOffset += squareSize+5;
    }
    if(numGreen == 5) {
        msg.reply(`Congrats! You guessed the word ${answer} in ${guesses.length+1} tries!`);
    } else if (guesses == 5) {
        msg.reply(`You failed to guess the word ${answer} in 5 tries! Try again tomorrow!`);
    } else {
        msg.reply({ files: [{attachment: canvas.toBuffer(), name: 'wordle.png'}]})
        .catch((error) => {
            console.error('Error sending wordle: ', error);
        });
        return;
    }
    user.lastWordleDate = new Date();
    user.lastWordle = "";
    await user.save();
    return;
};

async function LoadNewWordle(client, msg) {

    let user = await canPlay(msg);
    if(user !== undefined) {
        let answer = randomWord();
        user.lastWordle = answer;
        await user.save();
        // start off board
        showUpdate(msg, [], user);
        return;
    }
}

async function GuessWordle(client, msg) {
    let user = await canPlay(msg);
    // console.log(user);
    if(user !== undefined) {
        // if game hasn't started
        // TODO: pull guesses from user, could pull previous messages but they may talk in between
        let prevMsgs = await msg.channel.messages.fetch({ limit: 10 });
        let guesses = [];
        for(let i=0; i < prevMsgs.length; i++) {
            if(prevMsgs[i].includes('!guess') && validGuess(prevMsgs[i].split(" ")[i])) {
                guesses.push(prevMsgs[i].split(" ")[i]);
            }
        }
        console.log(guesses);

        if(user.lastWordle == "") {
            msg.reply("You have not started a game yet today. Type !playwordle to begin.");
            return;
        }
        var guess = msg.content.split(" ")[1];
            
        if(!validGuess(guess)) {
            msg.reply("Guesses must be a valid 5 letter word.");
            return;
        }

        // Check guess
        showUpdate(msg, guesses, user);
    
        return;
    }
}

function ShowStats(client, msg) {

};

module.exports = { LoadNewWordle, GuessWordle, ShowStats};