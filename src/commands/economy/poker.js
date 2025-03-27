const { ApplicationCommandOptionType } = require('discord.js');
const { shuffleArray, calculateScore }  = require("../../utils/misc.js");
const User = require('../../models/User');

module.exports = {
    name: 'poker',
    description: 'Gamble your points playing 5 card stud poker!',
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
            const deck = ['AceS', 'KingS', 'QueenS', 'JackS', '10S', '9S', '8S', '7S', '6S', '5S', '4S', '3S', '2S',
                'AceH', 'KingH', 'QueenH', 'JackH', '10H', '9H', '8H', '7H', '6H', '5H', '4H', '3H', '2H',
                'AceC', 'KingC', 'QueenC', 'JackC', '10C', '9C', '8C', '7C', '6C', '5C', '4C', '3C', '2C',
                'AceD', 'KingD', 'QueenD', 'JackD', '10D', '9D', '8D', '7D', '6D', '5D', '4D', '3D', '2D'
            ];
            shuffleArray(deck);
            
            let players = {[interaction.member.id]: [deck.shift(), deck.shift(), deck.shift(), deck.shift(), deck.shift()]};
            
            const response = await interaction.reply({content: `Your Hand: ${userHand}\n Dealers Hand: ${dealerHand[0]}`, withResponse: true });
            
            response.resource.message.react('☝️');
            response.resource.message.react('✅');
            const message = response.resource.message;
            
            const reactionFilter = (reaction, user) => {
                return ['☝️', '✅'].includes(reaction.emoji.name);
            }
            
            const collector = message.createReactionCollector({ filter: reactionFilter, time: 60_000, errors: ['time'] });
            
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '☝️') {
                    console.log(`Another player reacted: ${user.id}`);
                    if (!(user.id in players)) {
                        players.set(user.id, [deck.shift(), deck.shift(), deck.shift(), deck.shift(), deck.shift()]);
                    }
                } else if (reaction.emoji.name === '✅') {
                    collector.stop();
                    return;
                }
            });
        collector.on('end', (collected, reason) => {
            console.log('Collector ended:', reason);
            if (reason === 'time') message.reply('No one wants to play with you that\'s sad! Points have not been deducted.');
            else {
                for (player in players) {
                    user.send(userHand);
                }
                client.users.fetch(interaction.member.id, false).then((user) => {
                    user.send('heloo');
                });
            }
        });
        } catch (error) {
            console.log(`Error with /poker: ${error}`);
        }
    },
};