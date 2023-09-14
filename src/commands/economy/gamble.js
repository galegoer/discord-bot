const { ApplicationCommandOptionType, Embed, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'gamble',
    description: 'Gamble your points playing blackjack!',
    options: [
        {
            name: 'points',
            description: 'The amount of points you want to gamble',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
    ],

    callback: async (client, interaction) => {

        const message = await interaction.reply({content: 'testing', fetchReply: true });
        
        message.react('🛑');
        message.react('☝️');
        // message.edit('edited');

        const filter = (reaction, user) => { 
            return reaction.emoji.name === '☝️' || reaction.emoji.name === '🛑' && user.id == interaction.user.id;
        }
        const collector = message.createReactionCollector(filter, { time: 15000 });
        console.log('erfse')

        collector.on('collect', (reaction, user) => {
            console.log(user);
            console.log(interaction.member.id);
            console.log(reaction);
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.reply("You didn't respond in time")
            }
        })

    },
};