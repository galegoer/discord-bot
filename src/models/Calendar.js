const { Schema, model } = require('mongoose');

const calendarSchema = new Schema({
    events: [
        {
            name: String,
            date: String,
            description: String,
            location: String
        }
    ]
})

module.exports = model('Calendar', calendarSchema);