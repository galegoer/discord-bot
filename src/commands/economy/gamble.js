const { ApplicationCommandOptionType } = require('discord.js');
const { shuffleArray, calculateScore }  = require("../../utils/misc.js");

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

        const response = await interaction.reply({content: `Your hand: ${userHand}\n Dealers Hand: ${dealerHand[0]}`, withResponse: true });
        
        response.resource.message.react('🛑');
        response.resource.message.react('☝️');
        const message = response.resource.message;

        const reactionFilter = (reaction, user) => {
            return ['☝️', '🛑'].includes(reaction.emoji.name) && user.id == interaction.user.id;
        }

        const collector = message.createReactionCollector({ filter: reactionFilter, time: 60_000, errors: ['time'] });
        
        // TODO: Deduct points
        // TODO: Optimize calling calculateScore
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '☝️') {
                console.log('You reacted with hit me.');
                userHand.push(deck.shift());
                if (calculateScore(userHand) === -1) {
                    interaction.editReply(`Your hand: ${userHand}\n You lost! You lost __ points!`);
                    collector.stop();
                    return;
                } else {
                    interaction.editReply(`Your hand: ${userHand}\n Dealers Hand: ${dealerHand[0]}`);
                }
            } else if (reaction.emoji.name === '🛑') {
                console.log('You reacted with a stop.');
                let userScore = calculateScore(userHand);
                let dealerScore = calculateScore(dealerHand);
                while (userScore > dealerScore && dealerScore !== -1) {
                    dealerHand.push(deck.shift());
                    dealerScore = calculateScore(dealerHand);
                }
                if (dealerScore === -1) {
                    interaction.editReply(`Your hand: ${userHand}\n Dealers Hand: ${dealerHand}\n You won! You get __ points!`);
                    collector.stop();
                } else {
                    interaction.editReply(`Your hand: ${userHand}\n Dealers Hand: ${dealerHand}\n You lost! You lose __ points!`);
                    collector.stop();
                }
                return;
            }
        });
        collector.on('end', (collected, reason) => {
            console.log('Collector ended:', reason);
            if (reason === 'time') message.reply('You took too long please try again! Points have not been deducted.');
        });
    },
};