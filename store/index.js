import { cloneDeep } from "lodash";

import config from "../components/config";
import authAux from "../components/auth";

const signOut = async (commit, app) => {
  app.$cookies.remove("token");
  commit("resetState");
  return;
};

const baseState = {
  sessionToken: null,
  account: null,
  langs: [],
  selectedLang: "en",
  lang: {},
  env: {
    baseUrl: process.env.BASE_URL,
    apiUrl: process.env.API_URL,
    authUrl: process.env.AUTH_URL,
    donateUrl: process.env.DONATE_URL,
    githubURL: process.env.GITHUB_URL,
    twitterUrl: process.env.TWITTER_URL,
    inviteUrl: process.env.INVITE_URL
  },
  config: config
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
    account.guilds = guilds;
    state.account = account;
  }
};

export const actions = {
  nuxtServerInit(vuexContext, context) {
    // nothing
  },
  setUser({ commit }, user) {
    commit("setAccount", user);
  },
  signOut({ commit }) {
    console.log(2);
    signOut(commit, this);
  },
  authenticate({ commit }, code) {
    return this.$axios
      .get(`${this.getters.env.apiUrl}/api/login?code=${code}`)
      .then(result => {
        const authResult = result.data;
        commit("setToken", authResult.token);
        commit("setAccount", authResult.account);
        return authResult;
      });
  },
  fetchLangs({ commit, dispatch }) {
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
  initAuth({ commit }, req) {
    const cookies = [];
    if (req) {
      const hCookies = req.headers.cookie.split('; ');
      hCookies.forEach(hc => {
        const hCookie = hc.split('=');
        cookies.push({ name: hCookie[0], value: hCookie[1] });
      });
    }
    else {
      const hCookies = this.$cookies.getAll();
      for (const name in hCookies) {
        cookies.push({ name: name, value: hCookies[name] });
      }
    }
    
    const tokenCookies = [];
    for (const cookie of cookies) {
      if (cookie.name == "token") tokenCookies.push(cookie.value);
    }

    console.log("initAuth", tokenCookies, this.state.sessionToken);

    if (tokenCookies.length == 0) {
      if (this.state.sessionToken) {
        signOut(commit, this);
      }
      return;
    }

    return new Promise(async (resolve, reject) => {
      let savedAuthResult,
        successes = 0;
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
          console.log(6, JSON.stringify(authResult));
          if (authResult.status == "success") {
            successes++;
            savedAuthResult = authResult;
            commit("setAccount", authResult.account);
            commit("setToken", authResult.token || tokenCookies[i]);
            if (authResult.token != tokenCookies[i]) {
              console.log(1, authResult.token, tokenCookies[i]);
              await authAux.setToken(this, authResult.token);
            }
          } else if (result.data.status == "error") {
            console.log(5, tokenCookies[i]);
            throw new Error(authResult.message);
          }
        } catch (err) {
          // console.log(3, err);
        }
      }
      if (successes > 0) resolve(savedAuthResult);
      else {
        signOut(commit, this);
        reject();
      }
    });
  },
  fetchGuilds({ commit }, { page, games }) {
    const cookies = [];
    const hCookies = this.$cookies.getAll();
    for (const name in hCookies) {
      cookies.push({ name: name, value: hCookies[name] });
    }
    
    const tokenCookies = [];
    for (const cookie of cookies) {
      if (cookie.name == "token") tokenCookies.push(cookie.value);
    }

    console.log("fetchGuilds", tokenCookies);

    return new Promise(async (resolve, reject) => {
      let savedAuthResult,
        successes = 0;
      for (let i = 0; i < tokenCookies.length; i++) {
        try {
          let result = await this.$axios.get(
            `${this.getters.env.apiUrl}/auth-api/guilds?${page && `&page=${page}`}${games && `&games=${games}`}`,
            {
              headers: {
                authorization: `Bearer ${tokenCookies[i]}`
              }
            }
          );
          const authResult = result.data;
          // console.log(6, JSON.stringify(authResult));
          if (authResult.status == "success") {
            successes++;
            savedAuthResult = authResult;
            commit("setGuilds", authResult.guilds);
            if (authResult.token != tokenCookies[i]) {
              // console.log(1, authResult.token, tokenCookies[i]);
              await authAux.setToken(this, authResult.token);
            }
          } else if (result.data.status == "error") {
            // console.log(5, tokenCookies[i]);
            throw new Error(authResult.message);
          }
        } catch (err) {
          // console.log(3, err);
        }
      }
      if (successes > 0) resolve(savedAuthResult);
      else {
        signOut(commit, this);
        reject();
      }
    });
  }
};

export const getters = {
  sessionToken(state) {
    return state.sessionToken;
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
  }
};
