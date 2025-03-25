const { ApplicationCommandOptionType } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'coin-flip',
    description: 'Gamble your points playing blackjack!',
    options: [
        {
            name: 'points',
            description: 'The amount of points you want to gamble',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'heads-or-tails',
            description: 'Guess heads or tails for the coin flip',
            type: ApplicationCommandOptionType.Integer,
            choices: [
                {
                    name: 'Heads',
                    value: 0,
                },
                {
                    name: 'Tails',
                    value: 1,
                },
            ],
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
            await interaction.deferReply();

            let user = await User.findOne(query);

            // TODO: Make util function for checking user and setting up account
            if (!user) {
                // set to yesterday because new user no wordle but daily points will be added
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                user = new User({
                    ...query,
                    lastDaily: new Date(),
                    lastWordleDate: yesterday,
                });
                interaction.reply(
                    `Please try again.`
                );
                return;
            }

            if (gamblePoints > user.balance) {
                interaction.editReply(
                    `Nice try you don't have this many points please try again. Your balance is: ${user.balance}`
                );
                return;
            }

            let randInt = Math.floor(Math.random() * 2);
            let guess = interaction.options.get('heads-or-tails').value;

            if (randInt === guess) {
                user.balance += gamblePoints;
                setTimeout(() => interaction.editReply(`Congratulations! You won your balance is: ${user.balance}`), 3000);
            } else {
                user.balance -= gamblePoints;
                setTimeout(() => interaction.editReply(`You failure, your balance is: ${user.balance}`), 3000);
            }
            await user.save();
        } catch (error) {
            console.log(`Error with /coin-flip: ${error}`);
        }
    },
};