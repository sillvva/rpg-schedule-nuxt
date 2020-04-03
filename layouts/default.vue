<template>
  <v-app dark>
    <v-app-bar
      fixed
      app
      clipped-left
      v-if="account || routePath.startsWith(config.urls.game.create.path)"
    >
      <v-app-bar-nav-icon class="hidden-lg-and-up" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-img src="/images/logo2.png" max-width="40" max-height="40" contain />
      <v-spacer />
      <v-btn
        outlined
        fab
        x-small
        href="/r/twitter"
        target="_blank"
        class="hidden-sm-and-down discord--text"
      >
        <v-icon dark>mdi-twitter</v-icon>
      </v-btn>
      <span class="hidden-sm-and-down" v-if="account">&nbsp;&nbsp;</span>
      <v-btn
        outlined
        fab
        x-small
        v-if="account"
        :href="`${env && env.apiUrl}/rss/${account.user.id}`"
        target="_blank"
        class="hidden-sm-and-down discord--text"
      >
        <v-icon dark>mdi-rss</v-icon>
      </v-btn>
      <span class="hidden-sm-and-down">&nbsp;&nbsp;</span>
      <v-btn
        outlined
        fab
        small
        href="/r/donate"
        target="_blank"
        class="hidden-md-and-up discord--text"
      >
        <v-icon dark>mdi-gift-outline</v-icon>
      </v-btn>
      <span class="hidden-md-and-up">&nbsp;&nbsp;</span>
      <v-btn text href="/r/donate" target="_blank" class="hidden-sm-and-down discord--text">
        <v-icon left dark>mdi-gift-outline</v-icon>
        <span>{{lang.nav.DONATE}}</span>
      </v-btn>
      <v-dialog v-model="settingsDialog" scrollable max-width="300px">
        <template v-slot:activator="{ on }">
          <v-btn outlined fab small v-on="on" class="discord">
            <v-icon dark>mdi-cog</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>Settings</v-card-title>
          <v-divider></v-divider>
          <v-card-text style="height: 300px;">
            <v-row>
              <v-col class="d-flex" cols="12">
                <v-select v-model="selectedLang" :items="langOptions" label="Language"></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer />
            <v-btn color="white" text @click="settingsDialog = false">Close</v-btn>
            <v-btn color="discord" text @click="saveSettings">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <span>&nbsp;&nbsp;</span>
      <v-btn outlined fab small :to="config.urls.about.path" class="hidden-md-and-up discord">
        <v-icon dark>mdi-help</v-icon>
      </v-btn>
      <v-btn text :to="config.urls.about.path" class="hidden-sm-and-down discord">
        <v-icon left dark>mdi-help-circle-outline</v-icon>
        <span>{{lang.nav.HELP}}</span>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      v-if="account || routePath.startsWith(config.urls.game.create.path)"
      fixed
      clipped
      app
    >
      <template v-slot:prepend v-if="account">
        <v-list-item two-line style="position: relative;">
          <v-list-item-avatar>
            <img :src="account.user.avatarURL" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{account.user.username}}</v-list-item-title>
            <v-list-item-subtitle>
              <a @click="signOut" class="discord--text">{{lang.nav.LOGOUT}}</a>
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-btn
            fab
            small
            :to="config.urls.game.create.path"
            absolute
            right
            color="green"
            :title="lang.buttons.NEW_GAME"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-list-item>
      </template>

      <v-list nav dense v-if="!account && routePath.startsWith(config.urls.game.create.path)">
        <v-list-item-group>
          <v-list-item
            :href="`${config.urls.login.path}?redirect=${encodeURIComponent($route.fullPath)}`"
          >
            <v-list-item-title>{{lang.nav.LOGIN}}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list nav dense>
        <v-list-item-group>
          <v-list-item :to="config.urls.game.games.path">
            <v-list-item-title>{{lang.nav.UPCOMING_GAMES}}</v-list-item-title>
          </v-list-item>

          <v-list-item :to="config.urls.game.dashboard.path">
            <v-list-item-title>{{lang.nav.MY_GAMES}}</v-list-item-title>
          </v-list-item>

          <v-list-item :to="config.urls.game.calendar.path">
            <v-list-item-title>{{lang.nav.CALENDAR}}</v-list-item-title>
          </v-list-item>

          <v-list-item :to="config.urls.game.server.path">
            <v-list-item-title>{{lang.nav.MANAGE_SERVER}}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>
    </v-navigation-drawer>

    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
import lang from "../components/lang/en.json";
import { cloneDeep } from "lodash";

let lastGuildRefresh = new Date().getTime();

export default {
  data() {
    return {
      account: {},
      windowWidth: 0,
      drawer: false,
      config: this.$store.getters.config,
      env: this.$store.getters.env,
      settingsDialog: false,
      lang: lang,
      selectedLang: this.$store.getters.selectedLang,
      langOptions: [],
      onResize: () => {
        this.windowWidth = window.innerWidth;
      },
      socket: null
    };
  },
  computed: {
    storeAccount() {
      return this.$store.getters.account;
    },
    storeLang() {
      return this.$store.getters.lang;
    },
    storeLangs() {
      return this.$store.getters.langs;
    },
    storeSelectedLang() {
      return this.$store.getters.selectedLang;
    },
    routePath() {
      return this.$route.path;
    }
  },
  watch: {
    storeAccount: {
      handler: function(newVal) {
        this.account = newVal;
      },
      immediate: true
    },
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
      },
      immediate: true
    },
    storeSelectedLang: {
      handler: function(newVal) {
        this.selectedLang = newVal;
      },
      immediate: true
    },
    storeLangs: {
      handler: function(langs) {
        this.langOptions = langs.map(lang => ({
          text: lang.name,
          value: lang.code
        }));
      }
    },
    windowWidth(newWidth, oldWidth) {
      this.drawer = newWidth >= 1264;
    }
  },
  methods: {
    signOut() {
      this.$store.dispatch("signOut");
    },
    saveSettings() {
      this.$store.dispatch("setSelectedLang", this.selectedLang);
      this.settingsDialog = false;
    }
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();

    this.$store.dispatch("fetchLangs");

    this.socket = io(this.$store.getters.env.apiUrl);
    this.socket.on("game", data => {
      let guildRefresh = new Date().getTime();
      const account = this.$store.getters.account;
      if (!account) return;
      let guilds = cloneDeep(account.guilds);
      const path = this.$route.path;
      const gamesPage = /^\/games\//.test(path);
      const gamesEditPage = /^\/games\/edit/.test(path);
      const gameListingsPage = /^\/games\/(upcoming|my-games|calendar|server)/.test(
        path
      );

      if (
        guildRefresh - lastGuildRefresh >= 10 * 1000 &&
        gameListingsPage &&
        ["new", "rescheduled"].includes(data.action)
      ) {
        // A new game has been created or an existing game has been rescheduled
        lastGuildRefresh = guildRefresh;
        this.$store.dispatch("fetchGuilds", {
          page: path.replace("/games/", ""),
          games: true,
          app: this
        });
      } else if (
        data.action == "updated" &&
        gamesPage &&
        guilds.find(g => g.id == data.guildId)
      ) {
        // An existing game has been updated, update the store if it belongs to one of current user's guilds
        guilds = guilds.map(guild => {
          const index = guild.games.findIndex(game => game._id == data.gameId);
          if (index < 0) {
            lastGuildRefresh = guildRefresh;
            this.$store.dispatch("fetchGuilds", {
              page: path.replace("/games/", ""),
              games: true,
              app: this
            });
          } else {
            for (const prop in data.game) {
              guild.games[index][prop] = data.game[prop];
            }
          }
          return guild;
        });
        this.$store.commit("setGuilds", guilds);
      } else if (
        data.action == "deleted" &&
        gamesPage &&
        guilds.find(g => g.id == data.guildId)
      ) {
        // An existing game has been deleted, update the store if it belongs to one of current user's guilds
        if (
          gamesEditPage &&
          this.$route.query &&
          this.$route.query.g == data.gameId
        ) {
          alert("This game has been deleted");
          this.$router.replace(this.$store.getters.config.urls.game.games.path);
        } else if (gameListingsPage) {
          guilds = guilds.map(guild => {
            if (guild.games.find(game => game._id == data.gameId)) {
              guild.games.splice(
                guild.games.findIndex(game => game._id == data.gameId),
                1
              );
            }
            return guild;
          });
          this.$store.commit("setGuilds", guilds);
        }
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    if (this.socket) this.socket.close();
  }
};
</script>