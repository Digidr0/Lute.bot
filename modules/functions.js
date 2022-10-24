const logging = require("./logging");
const embed = require("./embed");
const { getInfo } = require("ytdl-core");
const { volume } = require("../config.json");
const ytsr = require("ytsr");

async function help() {
  return embed.newEmbedMsg(
    "Список команд:",
    false,
    "**.join** => подключение к голосовому каналу\n\n**.leave** => покинуть голосовой канал\n\n**.play** [.p] => включить песню (поиск или ссылка с YT)\n\n**.skip** [.next .n] => пропуск песни\n\n**.stop** => остановить музыку \n\n**.avatar** => получить URL аватара",
    "https://discord.gg/jXQYn6JVqz"
  );
}
async function join() {
  await global.global.vChannel.join().then((connection) => {
    connection.play("./assets/hello-dad.mp3");
  });
  logging.Log(
    `${global.client.user.tag} connect to ${global.vChannel.name}`,
    "gold"
  );
}

function skip() {
  if (!serverQueue) {
    logging.Err(`Have not song to skip`);
    return embed.newEmbedMsg("Нет песен для пропуска!", true);
  }
  if (!global.vChannel) {
    logging.Err(`[${global.message.author.tag}] not in voice channel!`);
    return embed.newEmbedMsg(
      "Необходимо быть в голосовом канале для пропуска музыки!",
      true
    );
  }

  serverQueue.connection.dispatcher.end();
  logging.Log(`[${global.message.author.tag}] skip song`, "purple");
}

function stop() {
  if (!global.vChannel) {
    logging.Err(`[${global.message.author.tag}] not in voice channel!`);
    return embed.newEmbedMsg(
      "Необходимо быть в канале для остановки музыки!",
      true
    );
  }
  if (!serverQueue)
    return embed.newEmbedMsg(
      "В данный момент в очереди нет песен.",
      true,
      "Предлагаю наболтать немного музыки!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  return embed.newEmbedMsg(
    "Музыка остановлена.",
    false,
    "Предлагаю наболтать немного музыки!"
  );
  logging.Log(`[${global.message.author.tag}] stop the music.`, "red");
}

//play
async function leave() {
  await global.global.vChannel.leave();
  logging.Log(
    `${global.client.user.tag} leave from ${global.vChannel.name}`,
    "gold"
  );
}

async function queue() {
  if (!serverQueue) {
    logging.Err(`No songs in queue!`);
    return embed.newEmbedMsg(
      "Нет песен в очереди!",
      true,
      "Надо это исправлять!"
    );
  }
  let arr = serverQueue.songs.map((e, num) => {
    return `\n${num + 1}: ${e.title} : ${e.author}`;
  });
  embed.newEmbedMsg("Очередь песен:", false, arr.toString());
}
async function playAudio() {
  pack = [
    "https://zvukitop.com/wp-content/uploads/2020/12/anime-whoaeeee.mp3",
    "https://zvukitop.com/wp-content/uploads/2020/12/anime-nani-manga.mp3",
  ];

  try {
    n = global.message.content.split(" ")[1];
    await global.global.vChannel.join().then((connection) => {
      connection.play(pack[n - 1]);
    });
  } catch (e) {
    logging.Err(`No audio at number ${n}\n${e}`);
  }
}

async function play() {
  function playSong(guild, song) {
    global.serverQueue = global.queue.get(guild.id);
    if (!song) {
      global.queue.delete(guild.id);
      return;
    }
    let dispatcher = global.serverQueue.connection
      .play(song.url)
      .on("finish", async () => {
        global.serverQueue.songs.shift();
        playSong(guild, global.serverQueue.songs[0]);
      })
      .on("error", (error) => {
        logging.Err(error);
      });

    dispatcher.setVolumeLogarithmic(volume);

    embed.newEmbedMsg(
      song.title,
      false,
      song.author,
      song.YTurl,
      "",
      {
        name: "Заказал:",
        value: `<@${song.authorId}>`,
        inline: false,
      },
      song.thumb
    );
    currentPlaying = `\nNow playing: ${song.title}\nChannel:${
      song.author
    }\nby ${
      song.authorTag
    } at ${new Date().getHours()}:${new Date().getMinutes()}\n`;
    logging.Log(currentPlaying, "gray");
  }

  let query = global.message.content.split(" ")[1];

  if (!query) {
    embed.newEmbedMsg("Введите запрос!", true);
    return;
  }
  if (!query.startsWith("https://www.youtube.com/watch")) {
    let songInfo;
    const options = {
      //region
      gl: "RU",
      // limit requests
      limit: 3,
    };
    const filters = await ytsr.getFilters(query);
    const filter = filters.get("Type").get("Video");
    try {
      search = await ytsr(filter.url, options);
      // search = await ytsr(query, options);
      // search = search.items.filter(e => e.type = "video")
    } catch (err) {
      logging.Err(`API error:\n${err}`);
      embed.newEmbedMsg("Ошибка запроса API!", true);
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
    return embed.newEmbedMsg(
      "Некорректная ссылка!",
      true,
      "Поддерживаются только ссылки с *youtube*"
    );
  }
  const format = songInfo.formats.find((element) => element.hasAudio === true);
  const song = {
    title: songInfo.videoDetails.title,
    author: songInfo.videoDetails.author.name,
    videoId: songInfo.videoDetails.videoId,
    thumb: `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`,
    url: format.url,
    YTurl: songInfo.videoDetails.video_url,
    authorTag: global.message.author.tag,
    authorId: global.message.author.id,
  };
  if (!serverQueue) {
    const queueContruct = {
      textChannel: global.message.channel,
      voiceChannel: global.vChannel,
      connection: null,
      songs: [],
      playing: true,
    };
    global.queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);
    embed.newEmbedMsg(
      `${message.author.tag} заказал`,
      false,
      song.title,
      undefined,
      undefined,
      undefined,
      song.thumb
    );
    logging.Log(`${message.author.tag} заказал ${song.title}`, "purple");
    try {
      let connection = await global.vChannel.join();
      queueContruct.connection = connection;

      playSong(message.guild, queueContruct.songs[0]);
    } catch (err) {
      logging.Err(err);
      global.queue.delete(message.guild.id);
    }
  } else {
    global.serverQueue.songs.push(song);
    return embed.newEmbedMsg(
      song.title,
      false,
      "была добавлена в очередь!",
      song.YTurl,
      "",
      {
        name: "`Позиция в очереди:`",
        value: serverQueue.songs.length,
        inline: false,
      }
    );
  }
}
module.exports.help = help;
module.exports.play = play;
module.exports.playAudio = playAudio;
module.exports.join = join;
module.exports.skip = skip;
module.exports.stop = stop;
module.exports.leave = leave;
module.exports.queue = queue;
