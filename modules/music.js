const logging = require("./logging");
const embed = require("./embed");
const { volume } = require("../config.json");
const { getInfo } = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");

const options = {
  //region
  gl: "RU",
  // limit requests
  limit: 3,
};

async function playSong() {
  let song = global.serverQueue[0];
  if (!song) {
    logging.Err(`End of queue!`);
    return;
  }
  await global.vChannel.join().then((connection) => {
    global.dispatcher = connection.play(song.url)
    .on("finish", async () => {
      global.serverQueue.shift();
      global.dispatcher.setVolumeLogarithmic(volume);
      playSong();
    });
    // let startSec = new Date().getTime();
    // setTimeout(() => {
    //   let endSec = new Date().getTime();
    //   console.log(
    //     `СЕКУНД ПРОШЛО:${(endSec - startSec) / 1000}, должно пройти:${
    //       song.length
    //     }`
    //   );
    //   global.serverQueue.shift();
    //   global.dispatcher.setVolumeLogarithmic(volume);
    //   playSong();
    // }, song.length * 1000);
    logging.Log(
      `Current song: ${song.title} - ${song.author} by ${song.authorTag}`,
      "purple"
    );
    embed.newEmbedMsg(
      song.title,
      false,
      `Автор: ${song.author}`,
      song.YTurl,
      "",
      [
        {
          name: "Заказал:",
          value: `\`\`\`${song.authorTag}\`\`\``,
          inline: true,
        },
        {
          name: "Треков в очереди:",
          value: `\`\`\`${global.serverQueue.length}\`\`\``,
          inline: true,
        },
        {
          name: "Длительность",
          value: `\`\`\`${Math.floor(song.length / 60)}:${(song.length % 60)
            .toString()
            .padStart(2, "0")}\`\`\``,
          inline: true,
        },
      ],
      song.thumb,
      "Сейчас играет:"
    );
  });
}
async function createPlaylist(query) {
  let url = query.split("list=")[1].split("&")[0];
  let arr = [];
  try {
    arr = await ytpl(url);
  } catch (err) {
    logging.Err(err);
    return;
  }
  embed.newEmbedMsg(
    "Формирование плейлиста...",
    false,
    "Немного подождите, пока я творю магию 🔮",
    undefined,
    undefined,
    [
      {
        name: "запрос от:",
        value: `\`\`\`${global.message.author.tag}\`\`\``,
        inline: false,
      },
      {
        name: "Примерное вермя формирования:",
        value: `\`\`\`${Math.floor(arr.items.length * 0.8)} сек.\`\`\``,
        inline: false,
      },
    ],
    2
  );
  arr = arr.items.map((e) => e.shortUrl);
  for (let i = 0; i < arr.length; i++) {
    let request = await getsong(arr[i]);
    if (request) {
      global.serverQueue.push(request);
    } else {
    }
  }
  console.log(`${global.message.author.tag} request ${arr.length} tracks`);
  embed.newEmbedMsg(
    "Плейлист создан.",
    false,
    `\`\`\`${global.message.author.tag}\`\`\` добавил аж ${arr.length} треков`,
    undefined,
    "",
    [
      {
        name: "Всего песен в очереди:",
        value: `\`\`\`${global.serverQueue.length}\`\`\``,
        inline: true,
      },
    ]
  );
}
async function addSong(song) {
  if (global.serverQueue.length === 0) {
    global.serverQueue.push(song);
    playSong();
  } else {
    global.serverQueue.push(song);
    embed.newEmbedMsg(
      song.title,
      false,
      "была добавлена в очередь!",
      song.YTurl,
      "",
      [
        {
          name: "Заказал:",
          value: `\`\`\`${song.authorTag}\`\`\``,
          inline: true,
        },
        {
          name: "Позиция в очереди:",
          value: `\`\`\`${global.serverQueue.length}\`\`\``,
          inline: true,
        },
      ]
    );
  }
}

async function getsong(url) {
  // const filters = await ytsr.getFilters(url);
  // const filter = filters.get("Type").get("Video");
  try {
    songInfo = await getInfo(url, {
      filter: (format) => format.hasAudio === true,
    });
  } catch (err) {
    // console.error(err.code);
    return undefined;
  }
  const format = songInfo.formats.find((element) => element.hasAudio === true);
  console.log("\033[1;33m",`• Track added: ${songInfo.videoDetails.title}`);
  const song = {
    title: songInfo.videoDetails.title,
    author: songInfo.videoDetails.author.name,
    videoId: songInfo.videoDetails.videoId,
    length: songInfo.videoDetails.lengthSeconds,
    url: format.url,
    YTurl: songInfo.videoDetails.video_url,
    authorTag: global.message.author.tag,
    authorId: global.message.author.id,
    thumb: `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`,
  };

  return song;
}

async function play() {
  let query = global.message.content.split(" ")[1];

  if (!query) {
    embed.newEmbedMsg("Введите запрос!", true);
    return;
  }
  if (query.includes("list=")) {
    console.log("ytdl-core API request...");

    await createPlaylist(query)
      .then(() => {
        console.log("Playlist created. Starting...");
        playSong();
      })
      .catch((e) => console.error(e));

    return;
  }
  if (
    query.startsWith("https://www.youtube.com/watch" || " https://youtu.be")
  ) {
    let song = await getsong(query);
    logging.Log(`${song.authorTag} request ${song.title}`, "cyan");
    if (song) {
      addSong(song);
    }
  } else {
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
    let song = await getsong(query);
    if (song) {
      addSong(song);
    }
  }
}

module.exports.play = play;
