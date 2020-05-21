const moment = require("moment");
const { toPairs, cloneDeep } = require("lodash");

const log = (...content) => {
  console.log(moment().format("lll") + ":", ...content);
};

const parseConfigURLs = paths => {
  let urls = [];
  toPairs(paths).forEach(entry => {
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
  return (
    rsvp &&
    user &&
    (typeof rsvp === "string"
      ? rsvp.trim() === user.tag
      : (rsvp.tag || "").trim() === user.tag || rsvp.id === user.id)
  );
};

const gamesCSV = guild => {
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
          const cGame = cloneDeep(game);
          const keys = Object.keys(cGame);
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
            if (k === "guild") cGame[k] = guild.name;
            if (k === "dm") cGame[k] = cGame[k].tag;
            if (k === "reserved") {
              if (!Array.isArray(cGame[k])) {
                cGame[k] = cGame[k]
                  .split(/\r?\n/g)
                  .filter(r => r.trim().length > 0)
                  .map(r => ({ tag: r.trim() }));
              }
              cGame[k] = cGame[k].map(r => r.tag).join(",");
            }
            row.push(
              typeof cGame[k] === "string"
                ? cGame[k].replace(/"/g, '\\"')
                : cGame[k]
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
