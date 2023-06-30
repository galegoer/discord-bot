const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    lastDaily: {
        type: Date,
        required: true,
    },
    lastWordleDate: {
        type: Date,
        required: true,
    },
    currWordle: {
        type: String,
        default: "",
    },
    wordleWins: {
        type: Number,
        default: 0,
    },
    numGames: {
        type: Number,
        default: 0,
    }
})

module.exports = model('User', userSchema);