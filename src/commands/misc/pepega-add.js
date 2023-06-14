const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'pepega-add',
    description: 'Adds two numbers...',
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

    callback: (client, interaction) => {
        const num1 = interaction.options.get('first-number').value;
        const num2 = interaction.options.get('second-number').value;
        interaction.reply(`The sum of these two numbers is ${num1.toString() + num2.toString()} :slight_smile:`)
    },
};