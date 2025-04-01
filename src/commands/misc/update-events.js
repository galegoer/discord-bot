const { ApplicationCommandOptionType } = require('discord.js');
const Calendar = require('../../models/Calendar');

module.exports = {
    name: 'update-events',
    description: 'Update / add / delete an event the calendar. Make sure you know the name of the event.',
    options: [
        {
            name: 'operation',
            description: 'The operation to perform',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'update',
                    value: 'update',
                },
                {
                    name: 'delete',
                    value: 'delete',
                }
            ],
            required: true,
        },
        {
            name: 'name',
            description: 'The name of the event',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'date',
            description: 'The date of the event',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'description',
            description: `What's happening?`,
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'location',
            description: 'The location of the event',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],

    callback: async (client, interaction) => {
        const operation = interaction.options.get('operation').value;
        let name = interaction.options.get('name').value;
        let date = interaction.options.get('date');
        date = date ? date.value : 'TBD';
        let description = interaction.options.get('description');
        description = description ? description.value : '';
        let location = interaction.options.get('location');
        location = location ? location.value : 'TBD';

        try {
            let calendarInfo = await Calendar.findOne();
            if (operation === 'delete') {
                calendarInfo.events = calendarInfo.events.filter(event => event.name !== name);
                await calendarInfo.save();
                interaction.reply(`Event deleted! Type /calendar to see what's upcoming.`);
                return;
            }
            if (!calendarInfo) {
                calendarInfo = new Calendar({ events: [{ name, date, description, location }] });
            }
            const event = calendarInfo.events.find(event => event.name === name);
            if (event) {
                Object.assign(event, { date, description, location });
            } else {
                calendarInfo.events.push({ name, date, description, location });
            }
            await calendarInfo.save();
            interaction.reply(`Event updated! Type /calendar to see what's upcoming.`);
        } catch (error) {
            console.log(`Error with /update-events: ${error}`);
        }
    },
};