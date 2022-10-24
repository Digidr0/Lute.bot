//https://discord.com/developers/applications/1032385916242759731/oauth2/general
const { Client, MessageEmbed } = require("discord.js");
const { prefix, token } = require("./config.json");
const logging = require("./modules/logging");
const functions = require("./modules/functions");
const embed = require("./modules/embed");

// const searchResults = await ytsr("github");
//on start
const client = new Client({
  intents: ["GUILDS", "MESSAGE", "REACTION"],
});
global.client = client;
//on start
client.once("ready", () => {
  logging.Log(`\n${client.user.tag} has logging in at ${new Date()}`, "gold");
});

//ping
client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content == "ping") {
    message.channel.send("```pong```");
  }
});

global.queue = new Map();
client.on("message", async (message) => {
  //tests
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  if (!message.member.voice.channel) {
    logging.Err(`[${message.author.tag}] not in voice channel!`);
    return message.channel.send("Вы должны быть в голосовом канале!");
  }

  global.message = message;
  global.serverQueue = queue.get(message.guild.id);
  global.vChannel = message.member.voice.channel;
  function chkCmd(command) {
    return global.message.content.startsWith(prefix + command) ? true : false;
  }

  if (message.content.startsWith(`${prefix}`)) {
    //  await global.message.delete()
  }
  if (chkCmd("help")) return functions.help();
  else if (chkCmd("p")) return functions.play();
  else if (chkCmd("join")) return functions.join();
  else if (chkCmd("queue")) return functions.queue(message, global.serverQueue);
  else if (chkCmd("leave") || chkCmd("disconnect")) return functions.leave();
  else if (chkCmd("stop")) return functions.stop(message, global.serverQueue);
  else if (chkCmd("skip") || chkCmd("next") || chkCmd("n"))
  return functions.skip(message, global.serverQueue);
  else if (chkCmd("avatar"))
  return global.message.channel.send(message.author.avatarURL());
  else if (chkCmd("a")) return functions.playAudio();
  else {
    logging.Err(`invalid command "${global.message.content.split(" ")[0]}"`);
   embed.newEmbedMsg("Неправильная команда!", true);
  }
});

//login
client.login(token);
