const moment = require("moment");
const { toPairs } = require("lodash");

const log = (...content) => {
  console.log(moment().format("lll") + ":", ...content);
};

const parseConfigURLs = (paths) => {
  let urls = [];
  toPairs(paths).forEach((entry) => {
    const [id, path] = entry;
    if (path.hasOwnProperty("path")) {
      urls.push(path);
    } else if (path instanceof Object) {
      urls = [...urls, ...parseConfigURLs(path)];
    }
    return [id, path];
  });
  return urls;
};

const checkRSVP = (rsvp, user) => {
  return rsvp && user && (typeof rsvp === "string" ? rsvp.trim() === user.tag : (rsvp.tag || "").trim() === user.tag || rsvp.id === user.id);
}

const gamesCSV = (guild) => {
  const includeKeys = [
    "guild",
    "channel",
    "adventure",
    "minPlayers",
    "players",
    "where",
    "date",
    "time",
    "timezone",
    "dm",
    "reserved"
  ];
  const replaceKeys = {
    guild: "server",
    minPlayers: "min players",
    players: "max players",
    adventure: "game name",
    dm: "gm"
  };

  if (guild.games.length > 0) {
    const csv =
      guild.games
        .map((game, i) => {
          const keys = Object.keys(game);
          const rows = [];
          let row = [];
          if (i === 0) {
            includeKeys.forEach(k => {
              row.push(replaceKeys[k] ? replaceKeys[k] : k);
            });
            rows.push(row.join(","));
            row = [];
          }
          includeKeys.forEach((k, i) => {
            if (k === "guild") game[k] = guild.name;
            if (k === "dm") game[k] = game[k].tag;
            if (k === "reserved")
              game[k] = game[k].map(r => r.tag).join(",");
            row.push(
              typeof game[k] === "string"
                ? game[k].replace(/"/g, '\\"')
                : game[k]
            );
          });
          rows.push(`"${row.join('","')}"`);
          return rows.join("\r\n");
        })
        .join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  }
  return null;
};

module.exports = {
  log: log,
  parseConfigURLs: parseConfigURLs,
  checkRSVP: checkRSVP,
  gamesCSV: gamesCSV
};