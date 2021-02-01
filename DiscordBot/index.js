const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

client.login(config.BOT_TOKEN);


const prefix = "Nigger ";

client.once('ready', () => {
	console.log('Bot Started With Success!');
	console.log('_________________________');
});

client.on("message", function(message) {

  if (message.author.bot || !message.content.startsWith(prefix)){
  	return;
  }

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args[0].toLowerCase();

	/*
  console.log("body:");
  console.log(commandBody); //say balshit monte
  console.log("args:");
  console.log(args); // [ 'say', 'balshit', 'monte' ]
  console.log("command:");
  console.log(command); // say
	*/

  if (command === "say") {
    var i;
    let saymsg = "";
    for (i = 1; i < args.length; i++) {
    	saymsg+= args[i] + " ";
    }

    message.channel.send(saymsg);
  }


  



});