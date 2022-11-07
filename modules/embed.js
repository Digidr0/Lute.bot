const { MessageEmbed } = require("discord.js");
function newEmbedMsg(
  title = "",
  warn = false,
  description = "для просмотра команд используте .help",
  URL = "",
  image = "",
  fields,
  thumbnail = warn
    ? 1
    : 0,
    // ? `https://github.com/Digidr0/Lute.bot/blob/master/assets/jukebox_warn_X128.gif?raw=true`
    // : `https://github.com/Digidr0/Lute.bot/blob/master/assets/jukebox_X256.png?raw=true`,
  authorname
  // thumbnail = warn ? "./assets/jackbox.png" : "./assets/jackbox_warn.png"
) {
  const images = [
    `https://github.com/Digidr0/Lute.bot/blob/master/assets/jukebox_X256.png?raw=true`,
    `https://github.com/Digidr0/Lute.bot/blob/master/assets/jukebox_warn_X256.gif?raw=true`,
    `https://github.com/Digidr0/Lute.bot/blob/master/assets/jukebox_magic_X256.gif?raw=true`,
    `https://github.com/Digidr0/Lute.bot/blob/master/assets/jukebox_shuffle_X256.gif?raw=true`,
  ];
  if (!fields) {
    fields = [
      {
        name: "запрос от:",
        value: `<@${global.message.author.id}>`,
        inline: false,
      },
    ];
  }
  // inside a command, event listener, etc.
  const Embed = new MessageEmbed()
    .setColor(warn ? 0xcc3520 : 0xfaa520)
    .setTitle(title)
    .setDescription(description)
    .setURL(URL)
    .setThumbnail(typeof thumbnail === "number" ? images[thumbnail] : thumbnail)
    // .addFields(
    //   { name: "Regular field title", value: "Some value here" },
    //   { name: "\u200B", value: "\u200B" },
    //   { name: "Inline field title", value: "Some value here", inline: true },
    //   { name: "Inline field title", value: "Some value here", inline: true }
    // )
    .addFields(fields[0])
    .setImage(image)
    .setTimestamp(new Date())
    .setFooter("Сундук шикарных вещей");

  if (fields[1]) {
    Embed.addFields(fields[1]);
  }
  if (fields[2]) {
    Embed.addFields(fields[2])
  }

  if (authorname) {
    Embed.setAuthor(authorname);
  }

  global.message.channel.send(Embed);
}

module.exports.newEmbedMsg = newEmbedMsg;
