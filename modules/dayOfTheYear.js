const { HolidayAPI } = require("holidayapi");
require("dotenv").config();

const { format } = require("date-fns");
async function getDay() {
  return new Promise(async function (resolve, reject) {
    const key = process.env.HOLIDAY_TOKEN;
    const holidayApi = new HolidayAPI({ key });
    const date = new Date()
    holidayApi
      .holidays({
        country: "RU",
        language: "ru",
        year: (format(date, "yyyy") - 1).toString(),
        month:  format(date, "L"),
        day:  format(date, "d"),
        pretty: "true",
      })
      .then((holiday) => {
        resolve(holiday.holidays[0].name || ".help");
      })
      .catch((err) => {
        reject(err);
      });
  });
}
module.exports.getDay = getDay();
