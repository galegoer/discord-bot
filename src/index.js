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
    if (interaction.commandName === 'pepega-add') {
        const num1 = interaction.options.get('first-number').value;
        const num2 = interaction.options.get('second-number').value;

        interaction.reply(`The sum of these two numbers is ${num1.toString() + num2.toString()} :slight_smile:`)
    }
})

client.login(process.env.TOKEN);