const Calendar = require('../../models/Calendar');

module.exports = {
    name: 'calendar',
    description: 'See what events are coming soon!',

    callback: async (client, interaction) => {
        try {
            let message = ``;
            let calendarInfo = await Calendar.findOne();
            if (calendarInfo.events.length == 0) {
                interaction.reply(`There are no events coming up! You guys are lame you should plan something...`);
                return;
            }
            for (let i = 0; i < calendarInfo.events.length; i++) {
                let event = calendarInfo.events[i];
                message += `## ${event.name}\n*Date*: ${event.date}\n`;
                message += event.description ? `*Description*: ${event.description}\n` : '';
                message += `*Location*: ${event.location}\n`;
            }
            interaction.reply(`The current upcoming events are:\n${message}`);
        } catch (error) {
            console.log(`Error with /calendar: ${error}`);
        }
    },
};