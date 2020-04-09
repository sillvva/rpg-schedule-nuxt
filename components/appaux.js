const moment = require("moment");

const log = (...content) => {
  console.log(moment().format("lll") + ":", ...content);
};

module.exports = {
  log: log
};