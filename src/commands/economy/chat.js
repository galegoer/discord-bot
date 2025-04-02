const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyA785ll0aBhYLD27fiI9VWpDtugPssgAHw" });

module.exports = {
    name: 'chat',
    description: 'Chat with a Gemini bot!',
    options: [
            {
                name: 'chat-message',
                description: 'The message to send to the bot',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
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
            
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: `${interaction.options.get('chat-message').value}`,
            });
            console.log(response.text);

            interaction.editReply(response.text);

        } catch (error) {
            console.log(`Error with /chat: ${error}`);
        }
    },
};