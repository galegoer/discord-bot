const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'explanation',
    description: 'Explain someone.',
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
                // add more names
            ],
            required: true,
        },
    ],

    callback: (client, interaction) => {
        const person = interaction.options.get('person').value;
        // fill in dependant on name store info somewhere
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(person)
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
    },
};