require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
// const { Configuration, OpenAIApi } = require('openai');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ],
});

eventHandler(client);

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB.');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();

client.login(process.env.TOKEN);


// client.on('ready', (c) => {
//     console.log(`${c.user.tag} is online.`);

//     // NOT Recommended to do this in the on ready functionality
//     // client.user.setActivity({
//     //     name: 'Twitch',
//     //     type: ActivityType.Streaming,
//     //     url: 'https://www.twitch.tv/',
//     // });
//     // client.user.setStatus('idle');
// });

// Commented out because API KEY expired
// const configuration = new Configuration({
//     apiKey: process.env.API_KEY,
// })
// const openai = new OpenAIApi(configuration);

// async function chatBotResponse(msg) {
//     let convoLog = [{ role: 'system', content: "You're a sarcastic chatbot that thinks they are cooler than the people asking questions."}]
//     await msg.channel.sendTyping();

//     let prevMsgs = await msg.channel.messages.fetch({ limit: 10 });
//     prevMsgs.reverse();

//     prevMsgs.forEach((prevMsg) => {
//         // Ignore other bots but not itself (may not be necessary depending on channel)
//         if (prevMsg.author.id !== client.user.id && msg.author.bot) return;
//         // ignore if last message was from someone else
//         if (prevMsg.author.id !== msg.author.id) return;
//         convoLog.push({
//             role: 'user',
//             content: prevMsg.content,
//         });
//     });

//     const result = await openai.createChatCompletion({
//         model: 'gpt-3.5-turbo',
//         messages: convoLog,
//     });

//     msg.reply(result.data.choices[0].message);
// }

// client.on('messageCreate', (msg) => {
//     // author is a bot don't respond
//     if (msg.author.bot) return;
//     if (msg.content === 'hello' || msg.content === 'hi') {
//         msg.reply(':wave: hi');
//     }
//     if (msg.channel.id === process.env.CHANNEL_ID) chatBotResponse(msg);
// });

// client.on('interactionCreate', (interaction) => {
//     if (!interaction.isChatInputCommand()) return;

//     if (interaction.commandName === 'embed') {
//         const person = interaction.options.get('person').value;

//         const embed = new EmbedBuilder()
//             .setColor('Random')
//             .setTitle('Some title')
//             .setURL('https://discord.js.org/')
//             .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
//             .setDescription('Some description here')
//             .setThumbnail('https://i.imgur.com/AfFp7pu.png')
//             .addFields(
//                 { name: 'Regular field title',
//                   value: 'Some value here' },
//             )
//             .setImage('https://i.imgur.com/AfFp7pu.png')
//             .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
//         interaction.reply({ embeds: [embed]})
//     }
// });