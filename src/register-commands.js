require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'hey',
        description: 'Replies with hey!',
    },
    {
        name: 'ping',
        description: 'Pong!',
    },
    {
        name: 'embed',
        description: 'explain someone',
        options: [
            {
                name: 'person',
                description: 'Embeds a description of a person.',
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'Eric',
                        value: 'Eric',
                    },
                ],
                required: true,
            },
        ]
    },
    {
        name: 'pepega-add',
        description: 'Adds two numbers pepelaugh',
        options: [
            {
                name: 'first-number',
                description: 'The first number.',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: 'second-number',
                description: 'The second number.',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Slash commands were registered successfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();