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

const parseTimeZoneISO = (timezone) => {
  const tz = Math.abs(timezone);
  const hours = Math.floor(tz);
  const minutes = (tz - hours) * 60;
  const zeroPad = (n, width, z = "0") => {
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  };
  return zeroPad(hours, 2) + zeroPad(minutes, 2);
};

const parseEventTimes = (event, options = {}) => {
  const raw = `${event.date} ${event.time} UTC${event.timezone < 0 ? "-" : "+"}${Math.abs(event.timezone)}`;
  const isoutcStart = `${new Date(raw)
    .toISOString()
    .replace(/[^0-9T]/gi, "")
    .slice(0, 13)}00Z`;
  const endTime = new Date(raw);
  endTime.setHours(endTime.getHours() + parseFloat(event.runtime.replace(/[^\d\.-]/g, "").trim() || "0"));
  const isoutcEnd = `${endTime
    .toISOString()
    .replace(/[^0-9T]/gi, "")
    .slice(0, 13)}00Z`;
  const rawDate = `${event.date} ${event.time} UTC${event.timezone < 0 ? "-" : "+"}${parseTimeZoneISO(event.timezone)}`;
  const d = new Date(rawDate)
    .toISOString()
    .replace(/[^0-9T]/gi, "")
    .slice(0, 13);

  const convertExtras = [];
  if (event.adventure) convertExtras.push(`&l=${escape(event.adventure)}`);

  const convert2Extras = [];
  if (event.adventure) convert2Extras.push(`&msg=${escape(event.adventure)}`);

  const googleCalExtras = [];

  const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const weekdays = event.weekdays.map((w, i) => w && days[i]).filter((w) => w);
  if (weekdays.length === 0) weekdays.push(days[moment(event.date).weekday()]);

  if (event.frequency == 1) {
    googleCalExtras.push(`&recur=RRULE:FREQ=DAILY`);
  }
  if (event.frequency == 2) {
    googleCalExtras.push(`&recur=RRULE:FREQ=WEEKLY;BYDAY=${weekdays.join(",")}`);
  }
  if (event.frequency == 3) {
    googleCalExtras.push(`&recur=RRULE:FREQ=WEEKLY;INTERVAL=${event.xWeeks};BYDAY=${weekdays.join(",")}`);
  }
  if (event.frequency == 4) {
    if (event.monthlyType === "date") {
      googleCalExtras.push(`&recur=RRULE:FREQ=MONTHLY`);
    } else if (event.monthlyType === "weekday") {
      googleCalExtras.push(`&recur=RRULE:FREQ=MONTHLY;BYDAY=${moment(event.date).monthWeekByDay() + 1}${days[new Date(raw).getDay()]}`);
    }
  }

  if (event.adventure) googleCalExtras.push(`&text=${escape(event.adventure)}`);
  if (event.where) googleCalExtras.push(`&location=${escape(`${event.where}`)}`);
  if (event.description && !options.isField) googleCalExtras.push(`&details=${escape(event.description)}`);

  const date = `${event.date.replace(/-/g, "")}T${event.time.replace(/:/g, "")}00${event.timezone >= 0 ? "+" : "-"}${parseTimeZoneISO(event.timezone)}`;

  return {
    raw: raw,
    rawDate: rawDate,
    isoutc: isoutcStart,
    isoutcStart: isoutcStart,
    isoutcEnd: isoutcEnd,
    convert: {
      timee: `https://timee.io/${d}?${convertExtras.join("")}`,
      timeAndDate: `https://www.timeanddate.com/worldclock/converter.html?iso=${d}&p1=1440`,
    },
    countdown: `https://www.timeanddate.com/countdown/generic?iso=${d}&p0=1440${convert2Extras.join("")}`,
    googleCal: `http://www.google.com/calendar/render?action=TEMPLATE&dates=${isoutcStart}/${isoutcEnd}&trp=true${googleCalExtras.join("")}`,
    iso: date,
    date: moment(date).utcOffset(parseInt(event.timezone)).format('llll'),
    calendar: moment(date).utcOffset(parseInt(event.timezone)).calendar(),
    from: moment(date).utcOffset(parseInt(event.timezone)).fromNow(),
  };
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
  gamesCSV: gamesCSV,
  parseEventTimes: parseEventTimes
};
