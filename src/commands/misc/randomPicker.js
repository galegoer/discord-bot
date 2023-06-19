const { ApplicationCommandOptionType } = require('discord.js');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

const fs = require('fs');

module.exports = {
    name: 'Random Picker',
    description: 'Picks a random choice from the list of names provided.',
    testOnly: true,
    options: [
        {
            name: 'entries',
            description: 'List of entries to pick from. Separated by commas',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
  
    callback: (client, interaction) => {
        const entries = interaction.options.get('entries').value;
        let entryList = entries.split(',');

        // TODO: put this functionality in another file
        const WIDTH = 1000;
        const HEIGHT = 200;
        const num_entries = entryList.length;
        const canvas = createCanvas(WIDTH, HEIGHT) // set the height and width of the canvas
        const ctx = canvas.getContext('2d');

        ctx.textAlign = 'center';
        ctx.font = '22px serif';
        const background = () => {
            ctx.fillStyle = '#b9b6b5';
            ctx.fillRect(0, 0, WIDTH, HEIGHT); // fill the entire canvas
            ctx.fillStyle = 'black';
            let xposition = 50;
           
            for(let i=1; i<=num_entries; i++) {
                ctx.fillText(entries[i], xposition, HEIGHT/2);
                xposition += WIDTH/num_entries;
            }
        };

        
        const encoder = new GIFEncoder(WIDTH, HEIGHT);
        let delay = 1;
        encoder.start(); // starts the encoder
        
        const slice = WIDTH / num_entries; // this is the width of each rectangle// frame 1
        background();
        
        let iterations = (Math.floor(Math.random() * num_entries) + 1) + 30; // 1 to 10 (3 iterations) smaller numbers will be more iterations but still fine
        console.log(iterations);
        let optionNum = 1;
        for (let i=0; i<iterations * slice; i += slice) {
            ctx.fillStyle = '#72ec5c';
            ctx.fillRect(i%WIDTH, 0, slice, HEIGHT);
            ctx.fillStyle = 'black';
            // Replace text so option is still visible
            ctx.fillText(entries[i], i%WIDTH+50, HEIGHT/2);
            encoder.addFrame(ctx);
            background();
            encoder.setDelay(delay);
            optionNum = optionNum >= 10 ? 1 : optionNum + 1;
            delay += delay;
        }
        
        // end the encoding
        encoder.finish();

        const buffer = encoder.out.getData();

        // TODO: change to output w/o having to save locally

        fs.writeFile('example.gif', buffer, error => {
            error ? console.log(error) : null;
        });
    },
};