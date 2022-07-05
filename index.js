// REQUIRES
const Discord = require("discord.js");
const config = require("./config.json");
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { exec } = require("ffmpeg/lib/utils");

const QuadrasDoTji = require("./QuadrasDoTji.json");

// Bot settings
const client = new Discord.Client({ intents: ["GUILDS"] });
client.login(config.BOT_TOKEN);
const prefix = config.PREFIX;
const queue = new Map(); // music queue
let MandarMadonisComOCaralho = false;

client.once('ready', () => {
    console.log('Bot Started With Success!');
    console.log('prefix is ' + prefix);
    console.log('_________________________');
});

client.once('reconnecting', () => {
 console.log('Bot is reconnecting...');
});

client.once('disconnect', () => {
 console.log('Bot disconnected...');
});

client.on('guildMemberRemove', async(member) => {
    if(member == left){
        console.log(member.user.tag + "left the server")
    }else if(member == kicked){
        console.log(member.user.tag + "got kicked from the server the server bacause, "+reason)
    }else if(member == banned){
        console.log(member.user.tag + "got banned from the server the server bacause, "+reason)
    }
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
        case "andacacaralho":{ //enters the server.
            JoinVoiceChat(message);
            break;
        }
        case "madonis":{ //play command. adds to queue the music, if found.
            MandarMadonisComOCaralho = !MandarMadonisComOCaralho;
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
        case "queue":{ //play command. adds to queue the music, if found.
            queuelist(message, serverQueue);
            break;
        }
        case "decide":{ //play command. adds to queue the music, if found.
            let randomvars = args;
            randomvars.shift();
            let maxval = args.length;
            let random = Math.floor(Math.random() * maxval) + 1;
            message.channel.send("I would say " + randomvars[random-1]);
            
            break;
        }
        case "commands":{ //play command. adds to queue the music, if found.
            let msg = "``` \n say \n play \n skip \n stop \n volume (1 - 100) \n queue \n decide \n ```";

            message.channel.send(msg);
            
            break;
        }
        default:{
            return message.channel.send("Wtf is that command u stupid? use commands to check my commands");
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


    let songInfo;

    if(args[1].includes("www.youtube.com/watch?v=")){
        songInfo = await ytdl.getInfo(args[1]);
    }else{
        
        let saymsg = "";

        for (i = 1; i < args.length; i++) {
           saymsg += args[i] + " ";
        }

        const r = await ytSearch(saymsg);
        if(r.all){
            songInfo = await ytdl.getInfo(r.all[0].url);
        }

    }


     

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

async function JoinVoiceChat(message) {

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel){
        return message.channel.send("Join a voice channel first!");
    }
    try {
        var connection = await voiceChannel.join();
    } catch (err) {
    }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel){
    return message.channel.send("You have to be in my voice channel to skip the music!");
  }
    
  if (!serverQueue){
    return message.channel.send("No song is playing!");
  }

  serverQueue.songs.shift();
  play(message.guild, serverQueue.songs[0]);
/*
  message.channel.send("No song in queue, leaving...");
  serverQueue.connection.dispatcher.end();
*/
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
    try {
        const args = message.content.slice(prefix.length).split(' ');

        let newVolume = args[1];

        if(newVolume > 100 && newVolume <= 0){
            return message.channel.send("Volume must be between 1 and 100");
        }


        serverQueue.volume = newVolume / 100;

        serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume);

        serverQueue.textChannel.send(`Volume changed to ${newVolume}%`);
    } catch (error) {
        return;
    }
}

function queuelist(message, serverQueue) {
    try {
        let msg = "```";

        for (var i = 0; i < serverQueue.songs.length; i++) {
            if(i == 0){
                msg += "\n" + serverQueue.songs[i].title + " -----> (Currently playing)";
                continue;
            }
            msg += "\n" + serverQueue.songs[i].title;
        }

        msg += "\n```";

        return message.channel.send(msg);
    } catch (error) {
        return null;
    }
    
  
}

//get a random number between variables parameters
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on("voiceStateUpdate", async (oldVoiceState, newVoiceState) => { // Listening to the voiceStateUpdate event
    const serverQueue = queue.get(oldVoiceState.guild.id);
    if (oldVoiceState.channel) { 
        if(oldVoiceState.member.user.tag === "MahallaBot#5373"){ //this bot was disconnected
            queue.delete(oldVoiceState.guild.id)
        }
    };
    
    try {
        if (newVoiceState.channel === null) {
            if (!oldVoiceState.guild.me.hasPermission('VIEW_AUDIT_LOG'))
                return console.log('Missing permission: "VIEW_AUDIT_LOG"');
    
            const fetchedLogs = await oldVoiceState.guild.fetchAuditLogs({
                type: 'MEMBER_DISCONNECT'
            });

            var LastDC = fetchedLogs.entries.sort((a, b) => b.createdAt - a.createdAt).first();

            // console.dir(LastDC);
    
            const { executor } = LastDC;
            
            var AuditDate = LastDC.createdAt;

            console.log("AuditDate " + AuditDate);

            var diff = Date.now() - AuditDate;

            if(diff > 7500)
                return;

            if(executor.tag === "MahallaBot#5373" || executor.id === "452275672757436436")
                return;

            

            console.log(`<@${executor.id}>(@${executor.username})  Disconnected <@${oldVoiceState.id}>(${oldVoiceState.member.user.username})`);
    
            var UserToDisconnect = oldVoiceState.guild.voiceStates.cache.get(executor.id);

            if(UserToDisconnect !== undefined){
                UserToDisconnect.setChannel(null, "Mandou uma pessoa com o caralho também.");

                console.log("A mandar o " + UserToDisconnect.member.displayName + " com o caralho");

                
                var NumQuadra = getRandomInt(0, QuadrasDoTji.quadras.length - 1);
                client.channels.cache.get(`925162059753205850`).send(`O <@${UserToDisconnect.member.id}> foi com o caralho.`);
                
                client.channels.cache.get(`925162059753205850`).send(QuadrasDoTji.quadras[NumQuadra]);
            }

        }else{
            console.log(newVoiceState.member.user.id + " | " + MandarMadonisComOCaralho);
            if(newVoiceState.member.user.id+"" === '183249276598484992' && MandarMadonisComOCaralho){
                var UserToDisconnect = newVoiceState.guild.voiceStates.cache.get('183249276598484992');
                UserToDisconnect.setChannel(null, "É o madonis. Não merece estar aqui.");

                client.channels.cache.get(`925162059753205850`).send(`Madonis do caralho seu fdp, não me voltas a kickar do servidor.`);
            }
        }
    } catch (error) {
        console.log(error);
    }
    
});