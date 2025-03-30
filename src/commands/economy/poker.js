const { ApplicationCommandOptionType } = require('discord.js');
const { shuffleArray, calculatePokerWinner }  = require("../../utils/misc.js");
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
        
        try {
            // let usersInfo = await User.find();

            const deck = ['AceS', 'KingS', 'QueenS', 'JackS', '10S', '9S', '8S', '7S', '6S', '5S', '4S', '3S', '2S',
                'AceH', 'KingH', 'QueenH', 'JackH', '10H', '9H', '8H', '7H', '6H', '5H', '4H', '3H', '2H',
                'AceC', 'KingC', 'QueenC', 'JackC', '10C', '9C', '8C', '7C', '6C', '5C', '4C', '3C', '2C',
                'AceD', 'KingD', 'QueenD', 'JackD', '10D', '9D', '8D', '7D', '6D', '5D', '4D', '3D', '2D'
            ];
            shuffleArray(deck);
            
            let playerHands = {[interaction.member.id]: {'1️⃣':deck.shift(), '2️⃣': deck.shift(), '3️⃣': deck.shift(), ' 4️⃣': deck.shift(), ' ️5️⃣': deck.shift()}};
            
            const response = await interaction.reply({content: `Check your DMs for your cards... + Instructions`, withResponse: true });
            
            response.resource.message.react('☝️');
            response.resource.message.react('✅');
            const message = response.resource.message;
            
            let reactionFilter = (reaction, user) => {
                return ['☝️', '✅'].includes(reaction.emoji.name);
            }
            
            let collector = message.createReactionCollector({ filter: reactionFilter, time: 60_000, errors: ['time'] });
            
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '☝️') {
                    console.log(`Another player reacted: ${user.id}`);
                    if (!(user.id in playerHands)) {
                        playerHands.set(user.id, [deck.shift(), deck.shift(), deck.shift(), deck.shift(), deck.shift()]);
                    }
                } else if (reaction.emoji.name === '✅') {
                    collector.stop();
                    return;
                }
            });
            collector.on('end', async (collected, reason) => {
                console.log('Collector ended:', reason);
                if (reason === 'time') message.reply('No one wants to play with you that\'s sad! Points have not been deducted.');
                else {
                    for (player in playerHands) {
                        player.send(playerHands[player]);
                        // client.users.fetch(interaction.member.id, false).then((user) => {
                        //     user.send('heloo');
                        // });
                            
                        let userInfo = usersInfo.find(user => user.userId === player);
                        
                        // TODO: Make util function for checking user and setting up account
                        if (!userInfo) {
                            // set to yesterday because new user no wordle but daily points will be added
                            let yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            userInfo = new User({
                                lastDaily: new Date(),
                                lastWordleDate: yesterday,
                            });
                            await userInfo.save();
                        }
                    }
                }
            });
            // Start game
            
            reactionFilter = (reaction, user) => {
                return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '✅'].includes(reaction.emoji.name) && !user.bot;
            }
            
            collector = message.createReactionCollector({ filter: reactionFilter, time: 60_000, errors: ['time'] });
            
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === '✅') {
                    collector.stop();
                    return;
                }
            });
            collector.on('end', async (collected, reason) => {
                console.log('Collector ended:', reason);
                if (reason === 'time') message.reply('No one wants to play with you that\'s sad! Points have not been deducted.');
                else {
                    collected.forEach(async (reaction) => {
                        console.log(reaction);
                        const users = await reaction.users.fetch();
                        if (reaction.emoji.name in ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']) {
                            users.forEach((user) => {
                                if (user.id in playerHands) {
                                    playerHands[user.id][reaction.emoji.name] = deck.shift();
                                }
                            });
                        }
                    });
                }
                // Check final score after switching all cards
                calculatePokerWinner(playerHands);
            });

        } catch (error) {
            console.log(`Error with /poker: ${error}`);
        }
    },
};