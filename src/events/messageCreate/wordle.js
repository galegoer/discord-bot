const { GuessWordle } = require('../../utils/wordle');

module.exports = (client, message) => {
    if(!message.inGuild() || message.author.bot) return;

    if(message.content.includes("!guess")) {
        GuessWordle(client, message);
    }
}