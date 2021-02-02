// REQUIRES
const Discord = require("discord.js");
const config = require("./config.json");
const ytdl = require('ytdl-core');
//const ytSearch = require('yt-search');

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
            execute(message, serverQueue);
            break;
        }
        case "skip":{ //play command. adds to queue the music, if found.
            skip(message, serverQueue);
            break;
        }
        case "stop":{ //play command. adds to queue the music, if found.
            stop(message, serverQueue);
            break;
        }
        case "volume":{ //play command. adds to queue the music, if found.
            volume(message, serverQueue);
            break;
        }
        default:{
            return message.channel.send("Wtf is that command u stupid?");
        }
        
    }

});

async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel){
        return message.channel.send("Join a voice channel first!");
    }
        
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("Someone took my permissions... I need CONNECT and SPEAK to play music");
    }

    //check if in a voice room

    
/*
    if(serverQueue){ // se já houver uma queue para o server mas o bot levou disconnect
        console.log("devia estar numa sala!");
        console.dir(serverQueue);
    }else{
        console.log("Não há queue!");
    }*/

    const songInfo = await ytdl.getInfo(args[2]);

    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 0.5,
            playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    }
    else
    {
        serverQueue.songs.push(song);
        return message.channel.send("I added " + song.title + " to the queue");
    }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel){
    return message.channel.send("You have to be in my voice channel to skip the music!");
  }
    
  if (!serverQueue){
    return message.channel.send("No song is playing!");
  }


  message.channel.send("No song in queue, leaving...");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in my voice channel to stop the music!"
    );
    
  if (!serverQueue){
    return message.channel.send("No song is playing!");
  }
    
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));

    dispatcher.setVolumeLogarithmic(0.25);

    serverQueue.textChannel.send(`Now Playing: ---> ${song.title} <---`);
}

function volume(message, serverQueue){
    const args = message.content.slice(prefix.length).split(' ');

    let newVolume = args[1];

    if(newVolume > 100 && newVolume <= 0){
        return message.channel.send("Volume must be between 1 and 100");
    }


    serverQueue.volume = newVolume / 100;

    serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume);

    serverQueue.textChannel.send(`Volume changed to ${newVolume}%`);
}

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    const serverQueue = queue.get(oldVoiceState.guild.id);
    if (oldVoiceState.channel) { 
        if(oldVoiceState.member.user.tag === "MahallaBot#5373"){ //this bot was disconnected
            queue.delete(oldVoiceState.guild.id)
        }
    };


});