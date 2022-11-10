const logging = require("./logging");
const embed = require("./embed");
const { volume } = require("../config.json");
const { getInfo } = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
// const fetch = require("node-fetch")

async function help() {
  logging.Log(`${global.client.user.tag} request help`, "cyan");
  return embed.newEmbedMsg(
    "Список команд:",
    false,
    "➡️ Подключение к голосовому каналу\n```.join```\n ⬅️ Покинуть голосовой канал\n```.leave```\n⏯️ Включить песню (поиск или ссылка с YT)\n```.play[.p]```\n⏩ Пропуск песни\n```.skip [.next .n]```\n⏹️ Остановить музыку\n```.stop```\n🎦 Получить URL аватара\n```.avatar```",
    "https://discord.gg/jXQYn6JVqz"
  );
}
async function join() {
  await global.vChannel.join().then((connection) => {
    connection.play("./assets/hello-dad.mp3");
  });
  logging.Log(
    `${global.client.user.tag} connect to ${global.vChannel.name}`,
    "gold"
  );
}

function skip() {
  if (serverQueue.length === 0) {
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
  if (serverQueue.length > 1) {
    global.dispatcher.end();
  } else {
    global.dispatcher.destroy();
    global.serverQueue = [];
  }
  logging.Log(`[${global.message.author.tag}] skip song`, "cyan");
}

function stop() {
  try {
    global.dispatcher.destroy();
    global.serverQueue = [];
    logging.Log(`[${global.message.author.tag}] stop the music.`, "red");
    return embed.newEmbedMsg(
      "Музыка остановлена.",
      false,
      "Предлагаю наболтать немного музыки!"
    );
  } catch {}
  if (!global.vChannel) {
    logging.Err(`[${global.message.author.tag}] not in voice channel!`);
    return embed.newEmbedMsg(
      "Необходимо быть в канале для остановки музыки!",
      true
    );
  }
  if (serverQueue.length === 0)
    return embed.newEmbedMsg(
      "В данный момент в очереди нет песен.",
      true,
      "Предлагаю наболтать немного музыки!"
    );
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
  if (global.serverQueue.length === 0) {
    logging.Err(`No songs in queue!`);
    return embed.newEmbedMsg(
      "Нет песен в очереди!",
      true,
      "Надо это исправлять!"
    );
  }
  try {
    let arr = global.serverQueue.map((e, num) => {
      return `\n ${num + 1}: *${e.title}*`;
    });
    logging.Log(`${global.client.user.tag} request queue`, "cyan");
    embed.newEmbedMsg("Очередь песен:", false, arr.slice(0, 50).toString());
  } catch (e) {
    logging.Err(e);
  }
}
async function playAudio() {
  pack = [
    "https://www.myinstants.com/media/sounds/goodmorn1.mp3",
    "https://zvukitop.com/wp-content/uploads/2020/12/anime-nani-manga.mp3",
    "https://www.myinstants.com/media/sounds/vine-boom.mp3",
    "https://www.myinstants.com/media/sounds/b-e-n.mp3",
    "https://www.myinstants.com/media/sounds/talking-benn-yes.mp3",
    "https://www.myinstants.com/media/sounds/talking-bennnn-noo.mp3",
    "https://www.myinstants.com/media/sounds/discord-notification.mp3",
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

async function lyrics() {
  // let query = global.message.content.split(" ")[1];
  // fetch("https://api.musixmatch.com/ws/1.1/", {
  //   apikey: "43c46e1bb87a10496e427fd4887fb424",
  //   q: query
  // })
  //   .then((res) => res.json())
  //   .then((data) => console.log(data));
}

function shuffle() {
  global.serverQueue = global.serverQueue.sort(() => Math.random() - 0.5);
  logging.Log(`${global.client.user.tag} shuffle tracks`, "cyan");
  embed.newEmbedMsg(
    "Треки перемешаны!",
    false,
    undefined,
    undefined,
    undefined,
    undefined,
    3
  );
}

module.exports.help = help;
module.exports.playAudio = playAudio;
module.exports.join = join;
module.exports.skip = skip;
module.exports.stop = stop;
module.exports.leave = leave;
module.exports.queue = queue;
module.exports.lyrics = lyrics;
module.exports.shuffle = shuffle;
