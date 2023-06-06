require('dotenv').config();
const { Client, IntentsBitField, messageLink } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on('messageCreate', (msg) => {
    // author is a bot don't respond
    if (msg.author.bot) {
        return;
    }
    console.log(msg.content);
    if (msg.content === 'hello' || msg.content === 'hi') {
        msg.reply(':wave: hi');
    }
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    console.log(interaction.commandName);
    if (interaction.commandName === 'hey') {
        interaction.reply('hey!');
    }
    if (interaction.commandName === 'ping') {
        interaction.reply('Pong!');
    }
})

client.login(process.env.TOKEN);