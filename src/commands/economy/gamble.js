const { ApplicationCommandOptionType } = require('discord.js');
const { shuffleArray }  = require("../../utils/misc.js");

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

        const deck = ['AceS', 'KingS', 'QueenS', 'JackS', '10S', '9S', '8S', '7S', '6S', '5S', '4S', '3S', '2S',
                    'AceH', 'KingH', 'QueenH', 'JackH', '10H', '9H', '8H', '7H', '6H', '5H', '4H', '3H', '2H',
                    'AceC', 'KingC', 'QueenC', 'JackC', '10C', '9C', '8C', '7C', '6C', '5C', '4C', '3C', '2C',
                    'AceD', 'KingD', 'QueenD', 'JackD', '10D', '9D', '8D', '7D', '6D', '5D', '4D', '3D', '2D'
        ];
        shuffleArray(deck);

        let userHand = [deck.shift(), deck.shift()];
        let dealerHand = [deck.shift(), deck.shift()];

        const message = await interaction.reply({content: `Your hand: ${userHand}\n Dealers Hand: ${dealerHand[0]}`, fetchReply: true });
        
        message.react('🛑');
        message.react('☝️');
        // message.edit('edited');

        const reactionFilter = (reaction, user) => { 
            return ['☝️', '🛑'].includes(reaction.emoji.name) && user.id == interaction.user.id;
        }
        message.awaitReactions({ filter: reactionFilter, max: 1, time: 60_000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '☝️') {
                message.reply('You reacted with hit me.');
            } else if (reaction.emoji.name === '🛑') {
                message.reply('You reacted with a stop.');
            }
        })
        .catch(collected => {
            message.reply('You reacted with neither in time, please start over.');
	    })
        // const collector = message.createReactionCollector(filter, { time: 15000 });

        // collector.on('collect', (reaction, user) => {
        //     console.log(user);
        //     console.log(interaction.member.id);
        //     console.log(reaction);
        // });

        // collector.on('end', collected => {
        //     if (collected.size === 0) {
        //         message.reply("You didn't respond in time, please start over.")
        //     }
        // })

    },
};