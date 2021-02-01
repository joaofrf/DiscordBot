// REQUIRES
const Discord = require("discord.js");
const config = require("./config.json");
const ytdl = require('ytdl-core');

// Bot settings
const client = new Discord.Client();
client.login(config.BOT_TOKEN);
const prefix = config.PREFIX;
const queue = new Map(); // music queue


client.once('ready', () => {
	console.log('Bot Started With Success!');
	console.log('_________________________');
});

client.once('reconnecting', () => {
 console.log('Bot is reconnecting...');
});

client.once('disconnect', () => {
 console.log('Bot disconnected...');
});

client.on("message", async message => {

    //if message is from bot or message does not start with prefix -> ignore
    if (message.author.bot || !message.content.startsWith(prefix)){
        return;
    }

    //explanation bellow
    const commandBody = message.content.slice(prefix.length); 
    const args = commandBody.split(' ');
    const command = args[0].toLowerCase();
    const serverQueue = queue.get(message.guild.id);

	/*
      console.log("body:");
      console.log(commandBody); //say balshit monte
      console.log("args:");
      console.log(args); // [ 'say', 'balshit', 'monte' ]
      console.log("command:");
      console.log(command); // say
	*/

    //Commands inside Switch statement with { } for better reading.
    switch(command) {
        case "say":{ //Say command. Says whatever was said after "prefix say"
            var i;

            let saymsg = "";

            for (i = 1; i < args.length; i++) {
               saymsg += args[i] + " ";
            }

            message.channel.send(saymsg);

            break;
        }
        case "play":{ //play command. adds to queue the music, if found.

            break;
        }
        default:{
            message.channel.send("Wtf is that command u stupid?");
        }
        
    }




});