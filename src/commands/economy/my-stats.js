const { Client, Interaction } = require('discord.js');
const User = require('../../models/User');


module.exports = {
    name: 'my-stats',
    description: 'Check your stats!',
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
                // TODO: don't think we need this?
                guildId: interaction.guild.id,
            };

            let user = await User.findOne(query);

            if (!user) {
                // set to yesterday because new user no wordle but daily points will be added
                // TODO: make a separate function for new users in a utils file
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                user = new User({
                    ...query,
                    lastDaily: yesterday,
                    lastWordleDate: yesterday,
                });
                interaction.reply(`Please try again. You just set up your account. You don't have any points yet.`);
                await user.save();
                return;
            }
            // TODO: if numGames is 0
            interaction.editReply(
                `Num Points: ${user.balance}\nNum Games: ${user.numGames}\nWordle Wins: ${user.wordleWins}\nWin Rate: ${((user.wordleWins/user.numGames) * 100).toFixed(2)}%`
            );

        } catch (error) {
            console.log(`Error with /my-stats: ${error}`);
        }
    },
};