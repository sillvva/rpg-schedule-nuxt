export default {
  title: "RPG Schedule",
  urls: {
    base: { path: "/", session: true },
    redirects: {
      game: { path: "/game", redirect: "/games/edit" },
      upcoming: { path: "/games", redirect: "/games/upcoming" },
      mygames: { path: "/my-games", redirect: "/games/my-games" }
    },
    game: {
      games: { path: "/games/upcoming", session: true, guildPermission: true, loadGames: true },
      dashboard: { path: "/games/my-games", session: true, guildPermission: true, loadGames: true },
      calendar: { path: "/games/calendar", session: true, guildPermission: true, loadGames: true },
      server: { path: "/games/manage-server", session: true, guildPermission: true, loadGames: true },
      create: { path: "/games/edit", session: true, refreshOnParamsChange: true },
      delete: { path: "/games/delete", session: true },
      password: { path: "/games/password", session: true },
      auth: { path: "/games/authenticate", session: true },
      rsvp: { path: "/games/rsvp", session: true }
    },
    about: { path: "/help", session: true },
    changeLang: { path: "/lang/:newLang" },
    auth: { path: "/r/auth" },
    invite: { path: "/r/invite" },
    donate: { path: "/r/donate" },
    github: { path: "/r/github" },
    twitter: { path: "/r/twitter" },
    login: { path: "/login" },
    logout: { path: "/logout" },
    maintenance: { path: "/maintenance" },
    rss: { path: "/rss/:uid" },
    ics: { path: "/ics/:uid.ics" },
    timezone: {
      convert: { path: "/tz/:time/:tz" },
      countdown: { path: "/cd/:time/:tz" }
    }
  },
  formats: {
    dateLong: "llll"
  },
  author: "Sillvva#2532",
  command: "schedule",
  patreon: {
    creditPledge: '4773971'
  },
  defaults: {
    sessionStatus: {
      access: {},
      loggedInTo: []
    }
  }
};