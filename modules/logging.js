const { format, getUnixTime } = require("date-fns");

function Log(message, clr) {
  let color = "\u001B[0m";
  switch (clr) {
    case "red":
      color = "\033[1;31m";
      break;
    case "gold":
      color = "\033[1;33m";
      break;
    case "cyan":
      color = '\033[1;36m' ;
      break;
      case "purple":
      color = '\033[1;34m';
      break;
    case "gray":
      color = '\033[1;37m' ;
      break;
  }
  const messageDate = `<t:${getUnixTime(new Date())}:R> `
  const logDate = format(new Date(), "[d MMM, HH:mm:ss] ");
  console.log(`${color}${logDate} ${message}`);
  global.client.channels.cache
    .get("949632312256114759")
    .send(`\n${message} ${messageDate}`);
  //shell bash js
}

function Err(message) {
  const messageDate = `<t:${getUnixTime(new Date())}:F> `
  const logDate = format(new Date(), "[d MMM, HH:mm:ss] ");

  console.error("\u001b[31m", logDate, "Error: ", message);
  global.client.channels.cache
    .get("949632312256114759")
    .send(`\n❗${messageDate} ${message}`);
  //shell bash js
}
module.exports.Log = Log;
module.exports.Err = Err;
