//https://discord.com/developers/applications/1032385916242759731/oauth2/general
const { Client, MessageEmbed } = require("discord.js");
const { prefix, token, volume } = require("./config.json");
const { ytdl, getInfo, chooseFormat } = require("ytdl-core");
const ytsr = require("ytsr");
const logging = require("./modules/logging");
const functions = require("./modules/functions");

// const searchResults = await ytsr("github");
//on start
const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_TYPING",
    "MESSAGE_CREATE",
    "MESSAGE_UPDATE",
    "MESSAGE_DELETE",
    "MESSAGE_CONTENT",
    "MESSAGE",
    "REACTION",
  ],
});
global.client = client;
//on start
client.once("ready", () => {
  logging.Log(`\n${client.user.tag} has logging in at \n ${new Date()}`);
});

//ping
client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content == "ping") {
    message.channel.send("pong");
  }
});

const queue = new Map();
client.on("message", async (message) => {
  const serverQueue = queue.get(message.guild.id);
  //tests
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const content = message.content;
  const tag = message.author.tag;
  const vChannel = message.member.voice.channel;
  global.vChannel = message.member.voice.channel;
  if (!vChannel) {
    logging.Err(`[${message.author.tag}] not in voice channel!`);
    return message.channel.send("Вы должны быть в голосовом канале!");
  }

  function chkCmd(command) {
    return content.startsWith(prefix + command) ? true : false;
  }
  async function Play() {
    function playSong(guild, song) {
      const serverQueue = queue.get(guild.id);

      if (!song) {
        functions.leave();
        queue.delete(guild.id);
        message.channel.send("**Очередь пуста!** *До встречи на танцполе*");
        return;
      }
      let dispatcher = serverQueue.connection
        .play(song.url)
        .on("finish", async () => {
          serverQueue.songs.shift();
          playSong(guild, serverQueue.songs[0]);
        })
        .on("error", (error) => {
          logging.Log(error);
        });

      dispatcher.setVolumeLogarithmic(volume);
      currentPlaying = `\nNow playing: ${song.title}\nChannel:${song.author}\nURL:${query}`;
      logging.Log(currentPlaying);
      message.channel.send(currentPlaying);
    }

    let query = message.content.split(" ")[1];

    if (!query) {
      message.channel.send("Введите запрос!");
      return;
    }
    if (!query.startsWith("https://")) {
      let songInfo;
      const options = {
        //region
        gl: "RU",
        // limit requests
        limit: 2,
      };
      const filters = await ytsr.getFilters(query);
      const filter = filters.get("Type").get("Video");
      try {
        search = await ytsr(filter.url, options);
        // search = await ytsr(query, options);
        // search = search.items.filter(e => e.type = "video")
      } catch (err) {
        logging.Err(`API error:\n${err}`);
        return message.channel.send("Ошибка запроса API");
      }

      query = search.items[0].url;
      // log
      let arr = search.items.map((e, num) => {
        return `\n${num + 1}: ${e.title}`;
      });
      console.log(arr.toString());
    }
    try {
      songInfo = await getInfo(query, {
        filter: (format) => format.hasAudio === true,
      });
    } catch (err) {
      logging.Err(err);
      return message.channel.send("Некорректная ссылка!");
    }
    const format = songInfo.formats.find(
      (element) => element.hasAudio === true
    );
    const song = {
      title: songInfo.videoDetails.title,
      author: songInfo.videoDetails.author.name,
      url: format.url,
      authorTag: tag,
    };
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: vChannel,
        connection: null,
        songs: [],
        playing: true,
      };
      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        let connection = await vChannel.join();
        queueContruct.connection = connection;
        playSong(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(
        `${song.title} была добавлена в очередь! Позиция в очереди: ${serverQueue.songs.length}`
      );
    }

    message.channel.send(`[${tag}] заказал *"${song.title}"*`);
  }

  if (content.startsWith(`${prefix}`)) {
    //  await message.delete()
  }
  if (content.startsWith(`${prefix}p`)) {
    Play();
    return;
  } else if (chkCmd("join")) {
    functions.join();
    return;
  } else if (chkCmd("queue")) {
    return functions.queue(message, serverQueue);
  } else if (chkCmd("leave") || chkCmd("disconnect")) {
    return functions.leave();
  } else if (chkCmd("skip") || chkCmd("next") || chkCmd("n")) {
    return functions.skip(message, serverQueue);
  } else if (chkCmd("stop")) {
    return functions.stop(message, serverQueue);
  } else if (chkCmd("avatar")) {
    return message.channel.send(message.author.avatarURL());
  } else {
    logging.Err(`invalid command "${content.split(" ")[0]}"`);
    message.channel.send("Неправильная команда!");
  }
});

//login
client.login(token);
