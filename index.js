//https://discord.com/developers/applications/1032385916242759731/oauth2/general
require('http').createServer((req, res) => res.end('Lute.bot started!')).listen(3000);
const { Client, MessageEmbed } = require("discord.js");
const { prefix, token } = require("./config.json");
const logging = require("./modules/logging");
const functions = require("./modules/functions");
const music = require("./modules/music");
const embed = require("./modules/embed");
require("dotenv").config();
// const slashCommands = require("./modules/slashCommands");

// const searchResults = await ytsr("github");
//on start
const client = new Client({
  intents: ["GUILDS", "MESSAGE", "REACTION"],
});
global.client = client;
//on start
client.once("ready", () => {
  logging.Log(`${client.user.tag} has log in`, "gold");
  client.user.setPresence({
    activity: {
      name: ".help",
      type: "STREAMING",
      url: "https://www.twitch.tv/digidro_",
    },
  });
});

//ping
client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content == "ping") {
    message.reply("pong");
  }
});
global.queue = new Map();
global.serverQueue = [];

client.on("message", async (message) => {
  //tests
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  if (chkCmd("avatar")) return message.channel.send(message.author.avatarURL());

  global.message = message;
  // global.serverQueue = queue.get(message.guild.id);
  global.vChannel = message.member.voice.channel;

  if (!message.member.voice.channel) {
    logging.Err(`[${message.author.tag}] not in voice channel!`);
    return embed.newEmbedMsg("Вы должны быть в голосовом канале!", true);
  }

  function chkCmd(command) {
    return message.content.startsWith(prefix + command) ? true : false;
  }

  if (message.content.startsWith(`${prefix}`)) {
    //  await global.message.delete()
  }
  if (chkCmd("help")) return functions.help();
  else if (chkCmd("p")) return music.play();
  else if (chkCmd("join")) return functions.join();
  else if (chkCmd("queue")) return functions.queue();
  else if (chkCmd("stop")) return functions.stop();
  else if (chkCmd("skip") || chkCmd("next") || chkCmd("n"))
    return functions.skip(message, global.serverQueue);
  else if (chkCmd("a")) return functions.playAudio();
  else if (chkCmd("ly")) return functions.lyrics();
  else if (chkCmd("shuffle")) return functions.shuffle();
  else if (chkCmd("leave") || chkCmd("disconnect")) return functions.leave();
  else {
    logging.Err(`invalid command "${global.message.content.split(" ")[0]}"`);
    embed.newEmbedMsg("Неправильная команда!", true);
  }
});

//login
client.login(process.env.TOKEN);
