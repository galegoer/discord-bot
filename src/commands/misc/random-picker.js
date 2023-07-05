const { ApplicationCommandOptionType } = require('discord.js');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');

const fs = require('fs');

module.exports = {
    name: 'random-picker',
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
        // TODO: if we use exact it won't work in for loop for %, if we use ceil it'll be a bit off but will work
        const slice = Math.ceil(WIDTH / num_entries); // this is the width of each rectangle
        let winnerInd = Math.floor(Math.random() * num_entries);
        let winnerName = entryList[winnerInd];

        ctx.textAlign = 'center';
        ctx.font = '22px serif';
        const background = () => {
            ctx.fillStyle = '#b9b6b5';
            ctx.fillRect(0, 0, WIDTH, HEIGHT); // fill the entire canvas
            ctx.fillStyle = 'black';
            let xposition = slice/2;
           
            for(let i=0; i<num_entries; i++) {
                // 22 based on pixel size of font
                if (entryList[i].length * 22 > slice ) {
                    entryList[i] = entryList[i].substring(0, Math.floor(slice/22)) + '...'
                }
                ctx.fillText(entryList[i], xposition, HEIGHT/2);
                xposition += slice;
            }
        };

        const encoder = new GIFEncoder(WIDTH, HEIGHT);
        let delay = 1;
        encoder.start(); // starts the encoder
        
        background();
        
        let iterations = winnerInd + (num_entries * 4);
        console.log(winnerInd, iterations);
        let optionNum = 0;
        for (let i=0; i<=iterations * slice; i += slice) {
            ctx.fillStyle = '#72ec5c';
            ctx.fillRect(i%WIDTH, 0, slice, HEIGHT);
            ctx.fillStyle = 'black';
            // Replace text so option is still visible
            ctx.fillText(entryList[optionNum], (i%WIDTH)+slice/2, HEIGHT/2);
            encoder.addFrame(ctx);
            background();
            encoder.setDelay(delay);
            optionNum = optionNum === num_entries - 1 ? 0 : optionNum + 1;

            delay += 10;
        }
        
        // end the encoding
        encoder.finish();

        const buffer = encoder.out.getData();

        interaction.reply({content: `The winner is... || ${winnerName} ||`, files: [{attachment: buffer, name: 'temp.gif'}]})
        .catch((error) => {
            console.error('Error sending file: ', error);
        });
    },
};