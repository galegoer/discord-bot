const { Client, Interaction } = require('discord.js');
const User = require('../../models/User');

const dailyAmount = 1000;

module.exports = {
    name: 'daily',
    description: 'Collect your daily points!',
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: 'You can only run this command inside a server.',
                ephemeral: true,
            });
            return;
        }

        try {
            await interaction.deferReply();

            const query = {
                userId: interaction.member.id,
                guildId: interaction.guild.id,
            };

            let user = await User.findOne(query);

            if (user) {
                const lastDailyDate = new Date(user.lastDaily.toString()).toDateString();
                const currentDate = new Date().toDateString();

                console.log(lastDailyDate, currentDate);

                if (lastDailyDate === currentDate) {
                    interaction.editReply(
                        `You have already collected your dailies today. Come back tomorrow!`
                    );
                    return;
                }
                
                user.lastDaily = new Date();
            } else {
                // set to yesterday because new user no wordle but daily points will be added
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                user = new User({
                    ...query,
                    lastDaily: new Date(),
                    lastWordleDate: yesterday,
                });
            }

            user.balance += dailyAmount;
            await user.save();

            interaction.editReply(
                `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
            );
        } catch (error) {
            console.log(`Error with /daily: ${error}`);
        }
    },
};