const { ApplicationCommandOptionType } = require('discord.js');
const { shuffleArray, calculateScore }  = require("../../utils/misc.js");
const User = require('../../models/User');

module.exports = {
    name: 'blackjack',
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
        let gamblePoints = interaction.options.get('points').value;
        if ( gamblePoints <= 0) {
            interaction.reply(`Please gamble with more than 0 points`);
            return;
        };

        const query = {
            userId: interaction.member.id,
            guildId: interaction.guild.id,
        };
            
        try {

            let userInfo = await User.findOne(query);

            // TODO: Make util function for checking user and setting up account
            if (!userInfo) {
                // set to yesterday because new user no wordle but daily points will be added
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                userInfo = new User({
                    ...query,
                    lastDaily: new Date(),
                    lastWordleDate: yesterday,
                });
                interaction.reply(
                    `Please try again.`
                );
                return;
            }

            if (gamblePoints > userInfo.balance) {
                interaction.editReply(
                    `Nice try you don't have this many points please try again. Your balance is: ${userInfo.balance}`
                );
                return;
            }
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
            
            // TODO: Optimize calling calculateScore
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '☝️') {
                    console.log('You reacted with hit me.');
                userHand.push(deck.shift());
                if (calculateScore(userHand) === -1) {
                    userInfo.balance -= gamblePoints;
                    interaction.editReply(`Your hand: ${userHand}\n You lost your balance is: ${userInfo.balance}`);
                    collector.stop();
                    await userInfo.save();
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
                    userInfo.balance += gamblePoints;
                    interaction.editReply(`Your hand: ${userHand}\n Dealers Hand: ${dealerHand}\n You won your balance is: ${userInfo.balance}`);
                    collector.stop();
                } else {
                    userInfo.balance -= gamblePoints;
                    interaction.editReply(`Your hand: ${userHand}\n Dealers Hand: ${dealerHand}\n You lost your balance is: ${userInfo.balance}`);
                    collector.stop();
                }
                await userInfo.save();
                return;
            }
        });
        collector.on('end', (collected, reason) => {
            console.log('Collector ended:', reason);
            if (reason === 'time') message.reply('You took too long please try again! Points have not been deducted.');
        });
        } catch (error) {
            console.log(`Error with /blackjack: ${error}`);
        }
    },
};