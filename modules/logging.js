function Log(message, clr) {
  let color = "\u001B[0m"
  switch (clr) {
    case "red":
      color = '\033[1;31m';
      break;
    case "gold":
      color = '\033[1;33m';
      break;
    case "purple":
      color = '"\u001B[36m"';
      break;
      case "gray":
      color = "\u001B[37m";
      break;
  }
  console.log(color, message);
  global.client.channels.cache
    .get("949632312256114759")
    .send(`\`\`\`shell\n${message}\`\`\``);
  //shell bash js
}

function Err(message) {
  console.log("\u001b[31m", "Error: ", message);
  global.client.channels.cache
    .get("949632312256114759")
    .send(`\`\`\`shell\n❗${message}\`\`\``);
  //shell bash js
}
module.exports.Log = Log;
module.exports.Err = Err;
