require('dotenv').config();
const { Client, IntentsBitField, messageLink, EmbedBuilder, ActivityType } = require('discord.js');

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

    // NOT Recommended to do this in the on ready functionality
    // client.user.setActivity({
    //     name: 'Twitch',
    //     type: ActivityType.Streaming,
    //     url: 'https://www.twitch.tv/',
    // });
    // client.user.setStatus('idle');
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
    if (interaction.commandName === 'embed') {
        const person = interaction.options.get('person').value;

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Some title')
            .setURL('https://discord.js.org/')
            .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
            .setDescription('Some description here')
            .setThumbnail('https://i.imgur.com/AfFp7pu.png')
            .addFields(
                { name: 'Regular field title',
                  value: 'Some value here' },
            )
            .setImage('https://i.imgur.com/AfFp7pu.png')
            .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        interaction.reply({ embeds: [embed]})
    }
})

client.login(process.env.TOKEN);