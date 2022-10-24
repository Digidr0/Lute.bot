const { MessageEmbed } = require("discord.js");
function newEmbedMsg(
  title = "",
  warn = false,
  description = "для просмотра команд используте .help",
  URL = "",
  image = "",
  fields = {
    name: "запрос от",
    value: `<@${global.message.author.id}>`,
    inline: false,
  },
  thumbnail = warn
    ? `https://media.discordapp.net/attachments/949632312256114759/1034113963761356853/jackbox_warn.png?width=128&height=128`
    : `https://cdn.discordapp.com/avatars/${global.client.user.id}/${global.client.user.avatar}.webp?size=128`
  // thumbnail = warn ? "./assets/jackbox.png" : "./assets/jackbox_warn.png"
) {
  // inside a command, event listener, etc.
  const Embed = new MessageEmbed()
    .setColor(warn ? 0xcc3520 : 0xfaa520)
    .setTitle(title)
    .setDescription(description)
    .setURL(URL)
    // .setAuthor(authorname, thumbnail, URL)
    .setThumbnail(thumbnail)
    // .addFields(
    //   { name: "Regular field title", value: "Some value here" },
    //   { name: "\u200B", value: "\u200B" },
    //   { name: "Inline field title", value: "Some value here", inline: true },
    //   { name: "Inline field title", value: "Some value here", inline: true }
    // )
    .addFields(fields)
    .setImage(image)
    .setTimestamp(new Date())
    .setFooter("Сундук шикарных вещей");

  global.message.channel.send(Embed);
}

module.exports.newEmbedMsg = newEmbedMsg;
