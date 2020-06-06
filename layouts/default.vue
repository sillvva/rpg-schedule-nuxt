<template>
  <v-app dark>
    <v-app-bar
      fixed
      app
      clipped-left
      v-if="!['/','/maintenace'].includes(this.$route.path) && !maintenanceMode"
    >
      <v-app-bar-nav-icon class="hidden-lg-and-up" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <nuxt-link :to="`/games/${lastListingPage || 'upcoming'}`">
        <v-img src="/images/logo2.png" max-width="40" max-height="40" contain />
      </nuxt-link>
      <v-spacer />
      <v-btn
        outlined
        fab
        x-small
        :href="config.urls.twitter.path"
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
        :href="config.urls.donate.path"
        target="_blank"
        class="hidden-xs-only hidden-md-and-up discord--text"
      >
        <v-icon dark>mdi-gift-outline</v-icon>
      </v-btn>
      <span class="hidden-xs-only hidden-md-and-up">&nbsp;&nbsp;</span>
      <v-btn text href="/r/donate" target="_blank" class="hidden-sm-and-down discord--text">
        <v-icon left dark>mdi-gift-outline</v-icon>
        <span>{{lang.nav.DONATE}}</span>
      </v-btn>
      <v-dialog v-model="settingsDialog" scrollable max-width="400px">
        <template v-slot:activator="{ on }">
          <v-btn outlined fab small v-on="on" class="discord">
            <v-icon dark>mdi-cog</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span>Settings</span>
            <v-spacer></v-spacer>
            <v-btn fab small text @click="settingsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text style="height: 90vh; max-height: 400px;">
            <v-row dense>
              <v-col class="pb-0" cols="12">
                <v-select
                  v-model="selectedUserSettings.lang"
                  :items="langOptions"
                  :label="lang.config.LANGUAGE"
                ></v-select>
              </v-col>
              <v-col class="pb-0" cols="12">
                <v-select
                  v-model="selectedUserSettings.notification"
                  :items="notificationOptions"
                  label="Notification"
                  @change="playSelectedNotification"
                  append-outer-icon="mdi-play"
                  @click:append-outer="playSelectedNotification"
                ></v-select>
              </v-col>
              <v-col class="py-0" cols="6" v-if="account && account.user.tag === config.author">
                <v-text-field label="Maintenance Date" type="date" v-model="settingMaintenanceDate"></v-text-field>
              </v-col>
              <v-col class="py-0" cols="3" v-if="account && account.user.tag === config.author">
                <v-text-field label="Time" type="time" v-model="settingMaintenanceTime"></v-text-field>
              </v-col>
              <v-col class="py-0" cols="3" v-if="account && account.user.tag === config.author">
                <v-text-field
                  label="Duration"
                  type="number"
                  v-model="settingMaintenanceDuration"
                  min="0"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer />
            <v-btn color="discord" text @click="saveSettings">{{lang.buttons.SAVE}}</v-btn>
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
      v-if="!['/','/maintenace'].includes(this.$route.path) && !maintenanceMode && !(['/help', '/games/edit'].includes($route.path) && !account && !loadingAccount)"
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
            :to="config.urls.game.create.path"
            :title="lang.buttons.NEW_GAME"
            class="hidden-md-and-down"
            color="discord"
            fab
            small
            absolute
            right
            v-if="account.guilds.find(guild => (guild.permission || guild.isAdmin) && guild.announcementChannels.length > 0)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-list-item>
      </template>

      <v-list nav dense v-if="!account">
        <v-list-item-group>
          <v-list-item
            :href="`${config.urls.login.path}?redirect=${encodeURIComponent($route.fullPath)}`"
          >
            <v-list-item-title>{{lang.nav.LOGIN}}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list nav dense v-if="account">
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

          <v-list-item
            :to="config.urls.game.server.path"
            v-if="account && (account.guilds.find(g => g.isAdmin) || account.user.tag === config.author)"
          >
            <v-list-item-title>{{lang.nav.MANAGE_SERVER}}</v-list-item-title>
          </v-list-item>

          <v-list-item
            :to="config.urls.game.past.path"
            v-if="account && (account.guilds.find(g => g.isAdmin) || account.user.tag === config.author)"
          >
            <v-list-item-title>{{lang.nav.PAST_EVENTS}}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list nav dense>
        <v-list-item-group v-model="selection">
          <v-list-item :href="config.urls.invite.path" target="_blank" @click="invited">
            <v-list-item-title>{{lang.nav.INVITE}}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <v-system-bar
        :color="maintenanceBarColor"
        v-if="!maintenanceMode && maintenanceBar && lang && lang.other && lang.other.MAINTENANCE && maintenanceTime && settings"
      >
        <v-spacer></v-spacer>
        <span>{{lang.other.MAINTENANCE.replace(":TIME", maintenanceTime.toLowerCase()).replace(":DURATION", `${settings.maintenanceDuration}`)}}</span>
        <v-spacer></v-spacer>
      </v-system-bar>

      <v-app v-if="/^\/games\//.test($route.path) && !account">
        <v-flex class="d-flex" justify-center align-center style="height: 100%;">
          <v-progress-circular :size="100" :width="7" color="discord" indeterminate></v-progress-circular>
        </v-flex>
      </v-app>
      <nuxt
        keep-alive
        v-else
        :key="!urlConfig || urlConfig.refreshOnParamsChange ? $route.fullPath : $route.path"
      />
    </v-content>
    <SnackBars></SnackBars>
  </v-app>
</template>

<script>
import lang from "../assets/lang/en.json";
import aux from "../assets/auxjs/appaux";
import SnackBars from "../components/snackbars";
import ws from "../store/socket";
import { cloneDeep } from "lodash";

let lastGuildRefresh = new Date().getTime();

export default {
  // middleware: ["check-auth"],
  components: {
    SnackBars: SnackBars
  },
  head() {
    return {
      link: [
        {
          rel: "alternate",
          type: "application/rss+xml",
          title:
            this.account &&
            `RPG Schedule Feed for ${this.account.user.username}`,
          href:
            this.account &&
            `${
              this.$store.getters.env.apiUrl
            }${this.$store.getters.config.urls.rss.path.replace(
              ":uid",
              this.account.user.id
            )}`
        }
      ]
    };
  },
  data() {
    return {
      account: {},
      settings: this.$store.getters.siteSettings,
      maintenanceMode: false,
      maintenanceBar: false,
      maintenanceBarColor: "discord",
      maintenanceTime: "",
      settingMaintenanceDate: "",
      settingMaintenanceTime: "",
      settingMaintenanceDuration: 0,
      drawer: false,
      config: this.$store.getters.config,
      env: this.$store.getters.env,
      settingsDialog: false,
      lang: lang,
      selectedUserSettings: cloneDeep(this.$store.getters.userSettings),
      userSettings: cloneDeep(this.$store.getters.userSettings),
      langOptions: [],
      notification: null,
      notificationOptions: [
        { text: "None", value: "" },
        { text: "Game Bubble", value: "Ambient_Game_Bubble_UI_1.wav" },
        {
          text: "Game Bell",
          value: "Vibrant_Game__Bell_Twinkle_Positive_Touch_1.wav"
        },
        { text: "Modern Button", value: "Modern Button 04.wav" }
      ],
      selection: null,
      windowWidth: 0,
      onResize: () => {
        this.windowWidth = window.innerWidth;
      },
      socket: null,
      loadingAccount: false
    };
  },
  computed: {
    lastListingPage() {
      return this.$store.getters.lastListingPage;
    },
    storeAccount() {
      return this.$store.getters.account;
    },
    storeLang() {
      return this.$store.getters.lang;
    },
    storeLangs() {
      return this.$store.getters.langs;
    },
    routePath() {
      this.maintenance();
      return this.$route.path;
    },
    storeSiteSettings() {
      return this.$store.getters.siteSettings;
    },
    storeUserSettings() {
      return this.$store.getters.userSettings;
    },
    urlConfig() {
      const parsedURLs = aux.parseConfigURLs(this.config.urls);
      return parsedURLs.find(
        path => path.session && this.$route.path === path.path
      );
    },
    storeSocketData() {
      return this.$store.getters.socketData;
    }
  },
  watch: {
    storeAccount: {
      handler: function(newVal) {
        this.account = newVal;
        this.maintenance();
      },
      immediate: true
    },
    storeSiteSettings: {
      handler: function(newVal) {
        this.settings = newVal;
        this.maintenance();
      },
      immediate: true
    },
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) {
          this.lang = newVal;
          this.setSettings();
        }
      },
      immediate: true
    },
    storeUserSettings: {
      handler: function(newVal) {
        this.selectedUserSettings = cloneDeep(newVal);
        this.userSettings = cloneDeep(newVal);
        this.setSettings();
      },
      immediate: true
    },
    selectedNotification: {
      handler: function(newVal) {
        this.selectedNotification = newVal;
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
    storeSocketData: {
      handler: function(socket) {
        if (!socket.type) return;
        const data = socket.data;
        if (socket.type === "game") {
          let guildRefresh = new Date().getTime();
          const account = cloneDeep(this.$store.getters.account);
          if (!account) return;
          let guilds = cloneDeep(account.guilds);
          if (data.guildId && !guilds.find(g => g.id === data.guildId)) return;
          const path = this.$route.path;
          const gamesPage = /^\/games\//.test(path);
          const gamesEditPage = /^\/games\/edit/.test(path);
          const gameListingsPage = /^\/games\/(upcoming|my-games|calendar|manage-server|past-events)/.test(
            path
          );

          if (["new"].includes(data.action)) {
            this.socketAddGame(
              account,
              data.gameId,
              data.guildId,
              data.authorId
            );
          } else if (
            data.action == "updated" &&
            guilds.find(g => g.id == data.guildId)
          ) {
            // An existing game has been updated, update the store if it belongs to one of current user's guilds
            let updated = false;
            // const match = !!guilds.find(g =>
            //   g.games.find(ga => ga._id == data.gameId)
            // );
            // if (!match)
            //   this.socketAddGame(account, data.gameId, data.guildId);
            guilds = guilds.map(guild => {
              const index = guild.games.findIndex(
                game => game._id == data.gameId
              );
              if (index >= 0) {
                for (const prop in data.game) {
                  updated = true;
                  guild.games[index][prop] = data.game[prop];
                }
              }
              return guild;
            });
            if (updated) this.$store.commit("setGuilds", guilds);
          } else if (
            data.action == "deleted" &&
            guilds.find(g => g.id == data.guildId)
          ) {
            // An existing game has been deleted, update the store if it belongs to one of current user's guilds
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
      }
    },
    windowWidth(newWidth, oldWidth) {
      this.drawer = newWidth >= 1264;
    },
    selection: {
      handler: function(sel) {
        setTimeout(() => {
          if (sel !== null) this.selection = null;
        }, 500);
      },
      immediate: true
    }
  },
  async mounted() {
    this.loadingAccount = true;

    window.addEventListener("resize", this.onResize);
    this.onResize();

    await this.$store.dispatch("fetchLangs");
    this.$store.commit("setSnackBars", []);
    this.setSettings();

    await this.$store.dispatch("fetchGuilds", {
      app: this,
      page: "manage-server",
      games: true
    });

    this.loadingAccount = false;

    await this.$store.dispatch("fetchSiteSettings");
    let isMobile = await this.$store.dispatch("isMobile");

    if (!isMobile) {
      this.socket = ws.socket(this.$store.getters.env.apiUrl);

      this.socket.on("game", data => {
        this.$store.commit("setSocketData", { type: "game", data: data });
      });

      this.socket.on("site", data => {
        if (data.action == "settings") {
          this.$store.commit("setSiteSettings", data);
        }
      });
    }

    this.setup();
    window.addEventListener("focus", this.setup);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("focus", this.setup);
  },
  methods: {
    setup() {
      if (localStorage.getItem("invited") && this.$store.getters.account) {
        this.$router.push("/help/setup");
        localStorage.removeItem("invited");
      }
    },
    signOut() {
      this.$store.dispatch("signOut", this).then(() => {
        this.$router.push("/");
      });
    },
    socketAddGame(account, gameId, guildId, authorId) {
      const path = this.$route.path;
      const gameListingsPageSorted = /^\/games\/(upcoming|my-games)/.test(path);
      if (account.user.id === authorId) return;
      if (
        gameId &&
        account.guilds.find(g => g.games.find(ga => ga.id === gameId))
      )
        return;
      // A new game has been created or an existing game has been rescheduled
      this.$store
        .dispatch("fetchGame", {
          param: "g",
          value: gameId,
          app: this
        })
        .then(game => {
          const guild = account.guilds.find(g => g.id === guildId);
          if (guild) {
            guild.games.push(cloneDeep(game));
            guild.games.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
            if (gameListingsPageSorted) {
              account.guilds.sort((a, b) => {
                if (a.games.length === 0 && b.games.length === 0)
                  return a.name < b.name ? -1 : 1;
                if (a.games.length === 0) return 1;
                if (b.games.length === 0) return -1;

                return a.games[0].timestamp < b.games[0].timestamp ? -1 : 1;
              });
            }
            this.$store.commit("setGuilds", account.guilds);
            if (
              game &&
              game.author.id !== account.user.id &&
              game.timestamp > new Date().getTime()
            ) {
              this.playNotification();
            }
          }
        })
        .catch(err => {
          this.$store.dispatch("addSnackBar", {
            message:"An error occured when fetching a new game",
            color: "error"
          });
        });
    },
    saveSettings() {
      if (this.account && this.account.user.tag === this.config.author) {
        let time = moment(
          `${this.settingMaintenanceDate} ${this.settingMaintenanceTime}`
        ).unix();
        if (this.settingMaintenanceDuration == 0) {
          this.settingMaintenanceDate = "";
          this.settingMaintenanceTime = "";
          time = 0;
        }
        this.$store.dispatch("saveSiteSettings", {
          settings: {
            maintenanceTime: time * 1000,
            maintenanceDuration: parseFloat(this.settingMaintenanceDuration)
          },
          app: this,
          route: this.$route
        });
      }
      this.$store
        .dispatch("saveUserSettings", {
          settings: {
            lang: this.selectedUserSettings.lang,
            notification: this.selectedUserSettings.notification
          },
          app: this,
          route: this.$route
        })
        .then(result => {
          if (result.status == "success") {
            this.userSettings = cloneDeep(this.selectedUserSettings);
            this.setSettings();
            this.settingsDialog = false;
            this.$store.dispatch(
              "setSelectedLang",
              this.selectedUserSettings.lang
            );
            this.$store.dispatch("addSnackBar", {
              message: "Settings saved successfully!",
              color: "success",
              timeout: 5
            });
          } else {
            throw new Error(result.message);
          }
        })
        .catch(err => {
          this.$store.dispatch("addSnackBar", {
            message: (err && err.message) || err || "An error occured!",
            color: "error"
          });
        });
    },
    setSettings() {
      if (process.server) return;
      if (!this.userSettings) return;
      const locales = moment.locales();
      if (
        this.lang.code &&
        this.userSettings.lang &&
        !locales.includes(this.userSettings.lang)
      ) {
        if (document.getElementById("moment-lang"))
          document.getElementById("moment-lang").remove();
        if (document.getElementById("moment-lang-load"))
          document.getElementById("moment-lang-load").remove();
        const el = document.createElement("script");
        el.id = "moment-lang";
        el.type = "text/javascript";
        el.src = `/locale/${this.userSettings.lang}.js`;
        document.body.appendChild(el);
      }
      if (this.userSettings.notification) {
        this.notification = new Audio(
          `/sounds/${this.userSettings.notification}`
        );
      }
    },
    maintenance() {
      try {
        const prevM = this.maintenanceBar || this.maintenanceMode;
        this.maintenanceBar = false;
        this.maintenanceTime = "";
        this.maintenanceMode = false;
        this.settingMaintenanceDate = "";
        this.settingMaintenanceTime = "";
        this.settingMaintenanceDuration = 0;
        this.maintenanceBarColor = "discord";
        if (prevM && this.settings.maintenanceDuration === 0) {
          this.signOut();
          return window.location.reload();
        }
        if (this.settings && this.settings.maintenanceTime > 0) {
          if (
            this.settings.maintenanceTime / 1000 <= moment().unix() &&
            !(
              this.account &&
              this.account.user &&
              this.account.user.tag == this.config.author
            )
          ) {
            this.maintenanceMode = true;
            this.$router.replace(this.config.urls.maintenance.path);
          } else {
            if (this.settings.maintenanceTime / 1000 <= moment().unix())
              this.maintenanceBarColor = "red";
            this.maintenanceBar = true;
            this.maintenanceTime = moment(
              this.settings.maintenanceTime
            ).calendar();
            this.settingMaintenanceDate = moment(
              this.settings.maintenanceTime
            ).format("YYYY-MM-DD");
            this.settingMaintenanceTime = moment(
              this.settings.maintenanceTime
            ).format("HH:mm");
            this.settingMaintenanceDuration = this.settings.maintenanceDuration;
          }
        }
      } catch (err) {
        console.log((err && err.message) || err);
      }
    },
    playNotification() {
      if (
        this.notification &&
        /^\/games\/(upcoming|my-games|calendar|manage-server|past-events)/.test(
          this.$route.path
        )
      ) {
        this.notification.play();
      }
    },
    playSelectedNotification() {
      if (this.selectedUserSettings.notification) {
        const audio = new Audio(
          `/sounds/${this.selectedUserSettings.notification}`
        );
        audio.play();
      }
    },
    invited() {
      localStorage.setItem("invited", 1);
    }
  }
};
</script>

<style>
.v-card .v-card__title > span {
  max-width: calc(100% - 50px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.v-time-picker-title__time .v-picker__title__btn,
.v-time-picker-title__time span {
  height: 100%;
  font-size: 4em;
  padding-left: 6px;
}

.v-time-picker-title__ampm > .v-picker__title__btn {
  font-size: 1.7em !important;
}
</style>