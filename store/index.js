import { cloneDeep } from "lodash";

import aux from "../components/appaux";
import config from "../components/config";
import authAux from "../components/auth";
import moment from "moment";

const reauthenticate = async (vuexContext, app, redirect) => {
  if (app.$cookies) {
    app.$cookies.set("redirect", redirect);
    app.$cookies.remove("token");
  }
  vuexContext.commit("resetState");
  if (app.$router) {
    app.$router.replace("/");
    if (window) window.location.reload(true);
  }
};

const baseState = {
  sessionToken: null,
  lastRefreshed: 0,
  account: null,
  langs: [],
  selectedLang: "en",
  lang: {},
  env: {
    githubUIUrl: process.env.GITHUB_UI_URL,
    githubAPIUrl: process.env.GITHUB_API_URL,
    baseUrl: process.env.BASE_URL,
    apiUrl: process.env.API_URL,
    authUrl: process.env.AUTH_URL,
    paypalUrl: process.env.PAYPAL_URL,
    donateUrl: process.env.DONATE_URL,
    twitterUrl: process.env.TWITTER_URL,
    inviteUrl: process.env.INVITE_URL
  },
  enums: {
    GameWhen: {
      DATETIME: "datetime",
      NOW: "now"
    },
    MonthlyType: {
      WEEKDAY: "weekday",
      DATE: "date"
    },
    GameMethod: {
      AUTOMATED: "automated",
      CUSTOM: "custom"
    },
    RescheduleMode: {
      REPOST: "repost",
      UPDATE: "update"
    },
    FrequencyType: {
      NO_REPEAT: "0",
      DAILY: "1",
      WEEKLY: "2",
      BIWEEKLY: "3",
      MONTHLY: "4"
    }
  },
  config: config,
  settings: {}
};

export const state = () => baseState;

export const mutations = {
  resetState(state) {
    const bs = cloneDeep(baseState);
    for (var key in bs) {
      state[key] = bs[key];
    }
  },
  setAccount(state, account) {
    const guilds = account.guilds.map(guild => {
      guild.games = guild.games.map(game => {
        const reserved = game.reserved;
        const players = parseInt(game.players);
        game.guildAccount = guild;
        game.slot = Array.isArray(reserved)
          ? reserved.findIndex(
              r => r.tag === account.user.tag || r.id === account.user.id
            ) + 1
          : 0;
        game.waitlisted = false;
        game.signedUp = false;
        if (game.slot > players) game.waitlisted = true;
        else if (game.slot > 0) game.signedUp = true;
        return game;
      });
      return guild;
    });
    account.guilds = guilds;
    state.account = account;
  },
  setToken(state, sessionToken) {
    state.sessionToken = sessionToken;
  },
  setSelectedLang(state, selectedLang) {
    state.selectedLang = selectedLang;
  },
  setLangs(state, langs) {
    state.langs = langs;
  },
  setLang(state, lang) {
    state.lang = lang;
  },
  setGuilds(state, guilds) {
    const account = cloneDeep(state.account);
    guilds = (guilds || []).map(guild => {
      guild.games = guild.games.map(game => {
        const reserved = game.reserved;
        const players = parseInt(game.players);
        game.guildAccount = guild;
        game.slot = Array.isArray(reserved)
          ? reserved.findIndex(
              r => r.tag === account.user.tag || r.id === account.user.id
            ) + 1
          : 0;
        game.waitlisted = false;
        game.signedUp = false;
        if (game.slot > players) game.waitlisted = true;
        else if (game.slot > 0) game.signedUp = true;
        return game;
      });
      return guild;
    });
    account.guilds = guilds;
    state.account = account;
  },
  setSiteSettings(state, settings) {
    state.settings = settings;
  },
  setLastRefreshed(state, time) {
    state.lastRefreshed = time;
  }
};

export const actions = {
  async nuxtServerInit(vuexContext, context) {
    try {
      vuexContext.commit("resetState");
      await vuexContext.dispatch("fetchSiteSettings");
      // if (context.req.headers.cookie) {
      //   const cookies = context.req.headers.cookie.split("; ");
      //   const tc = cookies.find(c => c.startsWith("token="));
      // }
    } catch (err) {
      aux.log("actions.nuxtServerInit", (err && err.message) || err);
    }
  },
  setUser({ commit }, user) {
    commit("setAccount", user);
  },
  async signOut({ commit }) {
    commit("resetState");
  },
  authenticate({ commit }, code) {
    console.log(`${this.getters.env.apiUrl}/api/login?code=${code}`);
    // return this.$axios
    //   .get(`${this.getters.env.apiUrl}/api/login?code=${code}`)
    //   .then(async result => {
    //     const authResult = result.data;
    //     commit("setToken", authResult.token);
    //     return authResult;
    //   });
  },
  async initAuth(vuexContext, req) {
    vuexContext.commit("setToken", null);

    const cookies = [];
    if (req) {
      const hCookies = (req.headers.cookie || "").split("; ");
      hCookies.forEach(hc => {
        const hCookie = hc.split("=");
        cookies.push({ name: hCookie[0], value: hCookie[1] });
      });
    } else {
      const hCookies = this.$cookies.getAll();
      for (const name in hCookies) {
        cookies.push({ name: name, value: hCookies[name] });
      }
    }

    const tokenCookies = [];
    for (const cookie of cookies) {
      if (cookie.name == "token") tokenCookies.push(cookie.value);
    }

    aux.log("initAuth", tokenCookies, this.getters.sessionToken);

    if (tokenCookies.length == 0) {
      return;
    }

    return new Promise(async (resolve, reject) => {
      let savedAuthResult,
        successes = 0;
      if (process.client && (moment().unix() - vuexContext.getters.lastRefreshed) / (60 * 60) < 12) {
        return resolve({ status: "success" });
      }
      for (let i = 0; i < tokenCookies.length; i++) {
        try {
          let result = await this.$axios.get(
            `${this.getters.env.apiUrl}/auth-api/user`,
            {
              headers: {
                authorization: `Bearer ${tokenCookies[i]}`
              }
            }
          );
          const authResult = result.data;
          if (authResult.status == "success") {
            successes++;
            savedAuthResult = authResult;
            vuexContext.commit("setToken", authResult.token || tokenCookies[i]);
            vuexContext.commit("setLastRefreshed", moment().unix());
            if (authResult.user) {
              vuexContext.dispatch("setSelectedLang", authResult.user.lang);
            }
          } else if (result.data.status == "error") {
            throw new Error(authResult && authResult.message);
          }
        } catch (err) {
          aux.log("actions.initAuth", err);
        }
      }
      if (successes > 0) resolve(savedAuthResult);
      else {
        reject();
      }
    });
  },
  fetchLangs({ commit, dispatch }) {
    try {
      let lang = "en";
      const langCookie = this.$cookies.get("lang");
      if (langCookie) lang = langCookie;

      commit("setLang", require(`../components/lang/${lang}.json`));
      const langOptions = require(`../components/lang/langs.json`);
      const langs = langOptions.langs.map(lang => {
        const langData = require(`../components/lang/${lang}.json`);
        return {
          name: langData.name,
          code: lang
        };
      });
      commit("setLangs", langs);

      dispatch("setSelectedLang", lang);
    } catch (err) {
      aux.log("actions.fetchLangs", (err && err.message) || err);
    }
  },
  setSelectedLang({ commit }, selectedLang) {
    const langCookie = this.$cookies.get("lang");
    const lang = require(`../components/lang/${selectedLang}.json`);

    commit("setLang", lang);
    commit("setSelectedLang", selectedLang);

    if (langCookie) this.$cookies.remove("lang");
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    this.$cookies.set("lang", selectedLang, { expires: d });
  },
  async fetchGuilds(vuexContext, { page, games, app }) {
    await vuexContext.dispatch("fetchSiteSettings");
    vuexContext.dispatch("emptyGuilds");

    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.$axios.get(
          `${this.getters.env.apiUrl}/auth-api/guilds?${page &&
            `&page=${page}`}${games && `&games=${games}`}`,
          {
            headers: {
              authorization: `Bearer ${vuexContext.getters.sessionToken}`
            }
          }
        );
        const authResult = result.data;
        if (authResult.token && authResult.token != vuexContext.getters.sessionToken) {
          vuexContext.commit("setToken", authResult.token);
          vuexContext.commit("setLastRefreshed", moment().unix());
          await authAux.setToken(app, authResult.token);
        }
        if (authResult.status == "success") {
          vuexContext.commit("setAccount", authResult.account);
          if (authResult.user) {
            vuexContext.dispatch("setSelectedLang", authResult.user.lang);
          }
        } else if (result.data.status == "error") {
          throw new Error(authResult);
        }
        resolve(authResult);
      } catch (err) {
        aux.log('fetchGuilds', err && err.message);
        if (err.reauthenticate) reauthenticate(vuexContext, app, `/games/${page}`);
        reject(err && err.message);
      }
    });
  },
  emptyGuilds({ commit }) {
    if (this.getters.account) {
      const guilds = cloneDeep(this.getters.account.guilds);
      commit(
        "setGuilds",
        guilds.map(g => {
          g.games = [];
          return g;
        })
      );
    }
  },
  async rsvpGame({ commit, dispatch }, { gameId, route, app }) {
    await dispatch("fetchSiteSettings");

    const cookies = [];
    const hCookies = this.$cookies.getAll();
    for (const name in hCookies) {
      cookies.push({ name: name, value: hCookies[name] });
    }

    const tokenCookies = [];
    for (const cookie of cookies) {
      if (cookie.name == "token") tokenCookies.push(cookie.value);
    }

    aux.log("rsvpGame", tokenCookies);

    return new Promise(async (resolve, reject) => {
      let savedAuthResult,
        successes = 0,
        reauthenticated = 0;
      for (let i = 0; i < tokenCookies.length; i++) {
        try {
          let result = await this.$axios.post(
            `${this.getters.env.apiUrl}/auth-api/rsvp`,
            {
              g: gameId
            },
            {
              headers: {
                Authorization: `Bearer ${tokenCookies[i]}`,
                "Content-Type": "application/json"
              }
            }
          );
          const authResult = result.data;
          if (authResult.token && authResult.token != tokenCookies[i]) {
            // aux.log(1, authResult.token, tokenCookies[i]);
            await authAux.setToken(app, authResult.token);
          }
          if (authResult.status == "success") {
            successes++;
            savedAuthResult = authResult;
          } else if (result.data.status == "error") {
            if (authResult.reauthenticate) reauthenticated++;
            throw new Error(authResult && authResult.message);
          }
        } catch (err) {
          aux.log(3, err);
        }
      }
      if (successes > 0) resolve(savedAuthResult);
      else {
        if (reauthenticated > 0) reauthenticate(commit, app, route.path);
        reject();
      }
    });
  },
  async fetchGame({ dispatch }, { param, value }) {
    await dispatch("fetchSiteSettings");

    return this.$axios
      .get(`${this.getters.env.apiUrl}/api/game?${param}=${value}`)
      .then(result => {
        if (result.data.status == "error")
          throw new Error(result.data && result.data.message);
        return result.data.game;
      })
      .catch(err => {
        aux.log(err);
      });
  },
  async saveGame({ dispatch }, gameData) {
    await dispatch("fetchSiteSettings");

    return this.$axios
      .post(
        `${this.getters.env.apiUrl}/api/game?${
          gameData._id ? `g=${gameData._id}` : `s=${gameData.s}`
        }`,
        gameData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(result => {
        if (result.data.status == "error")
          throw new Error(result.data && result.data.message);
        return result.data;
      });
  },
  deleteGame({ commit }, gameId) {
    return this.$axios
      .get(`${this.getters.env.apiUrl}/api/delete-game?g=${gameId}`)
      .then(result => {
        if (result.data.status == "error")
          throw new Error(result.data && result.data.message);
        return result.data;
      });
  },
  fetchSiteSettings(vuexContext) {
    return this.$axios
      .get(`${this.getters.env.apiUrl}/api/site`)
      .then(result => {
        vuexContext.commit("setSiteSettings", result.data.settings);
      });
  },
  saveSiteSettings(vuexContext, { settings, route, app }) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.$axios.post(
          `${this.getters.env.apiUrl}/auth-api/site`,
          settings,
          {
            headers: {
              Authorization: `Bearer ${vuexContext.getters.sessionToken}`,
              "Content-Type": "application/json"
            }
          }
        );

        const authResult = result.data;
        if (authResult.token && authResult.token != vuexContext.getters.sessionToken) {
          vuexContext.commit("setToken", authResult.token);
          vuexContext.commit("setLastRefreshed", moment().unix());
          await authAux.setToken(app, authResult.token);
        }
        if (authResult.status == "success") {
        } else if (result.data.status == "error") {
          throw new Error(authResult);
        }
        resolve(authResult);
      } catch (err) {
        aux.log('saveSiteSettings', err && err.message);
        if (err.reauthenticate) reauthenticate(vuexContext, app, route);
        reject(err && err.message);
      }
    });
  },
  saveGuildConfig({ commit }, { config, route, app }) {
    const cookies = [];
    const hCookies = app.$cookies.getAll();
    for (const name in hCookies) {
      cookies.push({ name: name, value: hCookies[name] });
    }

    const tokenCookies = [];
    for (const cookie of cookies) {
      if (cookie.name == "token") tokenCookies.push(cookie.value);
    }

    aux.log("saveGuildConfig", tokenCookies);

    return new Promise(async (resolve, reject) => {
      let savedAuthResult,
        successes = 0,
        reauthenticated = 0;
      for (let i = 0; i < tokenCookies.length; i++) {
        try {
          const result = await this.$axios.post(
            `${this.getters.env.apiUrl}/auth-api/guild-config?s=${config.guild}`,
            {
              id: config.guild,
              ...config
            },
            {
              headers: {
                Authorization: `Bearer ${tokenCookies[i]}`,
                "Content-Type": "application/json"
              }
            }
          );

          const authResult = result.data;
          if (authResult.token && authResult.token != tokenCookies[i]) {
            // aux.log(1, authResult.token, tokenCookies[i]);
            await authAux.setToken(app, authResult.token);
          }
          if (authResult.status == "success") {
            successes++;
            savedAuthResult = authResult;
            const guilds = cloneDeep(this.getters.account.guilds).map(guild => {
              if (guild.id === config.guild) {
                guild.config = authResult.guildConfig;
              }
              return guild;
            });
            commit("setGuilds", guilds);
          } else if (authResult.status == "error") {
            if (authResult.reauthenticate) reauthenticated++;
            throw new Error(authResult && authResult.message);
          }
        } catch (err) {
          aux.log(3, err);
        }
      }
      if (successes > 0) resolve(savedAuthResult);
      else {
        if (reauthenticated > 0) reauthenticate(commit, this, route.path);
        reject();
      }
    });
  },
  fetchPledges() {
    return this.$axios
      .get(`${this.getters.env.apiUrl}/api/pledges`)
      .then(result => {
        return result.data;
      });
  },
  saveUserSettings({ commit }, { settings, route, app }) {
    const cookies = [];
    const hCookies = app.$cookies.getAll();
    for (const name in hCookies) {
      cookies.push({ name: name, value: hCookies[name] });
    }

    const tokenCookies = [];
    for (const cookie of cookies) {
      if (cookie.name == "token") tokenCookies.push(cookie.value);
    }

    aux.log("saveUserSettings", tokenCookies, settings);

    return new Promise(async (resolve, reject) => {
      let savedAuthResult,
        successes = 0,
        reauthenticated = 0;
      for (let i = 0; i < tokenCookies.length; i++) {
        try {
          const result = await this.$axios.post(
            `${this.getters.env.apiUrl}/auth-api/user`,
            settings,
            {
              headers: {
                Authorization: `Bearer ${tokenCookies[i]}`,
                "Content-Type": "application/json"
              }
            }
          );

          const authResult = result.data;
          if (authResult.token && authResult.token != tokenCookies[i]) {
            // aux.log(1, authResult.token, tokenCookies[i]);
            await authAux.setToken(app, authResult.token);
          }
          if (authResult.status == "success") {
            successes++;
            savedAuthResult = authResult;
          } else if (result.data.status == "error") {
            // aux.log(5, tokenCookies[i]);
            if (authResult.reauthenticate) reauthenticated++;
            throw new Error(authResult && authResult.message);
          }
        } catch (err) {
          aux.log(3, err);
        }
      }
      if (successes > 0) resolve(savedAuthResult);
      else {
        if (reauthenticated > 0) reauthenticate(commit, this, route.path);
        reject();
      }
    });
  }
};

export const getters = {
  sessionToken(state) {
    return state.sessionToken;
  },
  lastRefreshed(state) {
    return state.lastRefreshed;
  },
  langs(state) {
    return state.langs;
  },
  selectedLang(state) {
    return state.selectedLang;
  },
  lang(state) {
    return state.lang;
  },
  account(state) {
    return state.account;
  },
  config(state) {
    return state.config;
  },
  env(state) {
    return state.env;
  },
  enums(state) {
    return state.enums;
  },
  siteSettings(state) {
    return state.settings;
  }
};
