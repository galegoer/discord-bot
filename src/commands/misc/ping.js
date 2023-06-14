module.exports = {
    name: 'ping',
    description: 'Pong!',
    testOnly: true,
  
    callback: (client, interaction) => {
      interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};