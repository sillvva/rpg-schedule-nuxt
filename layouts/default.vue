<template>
  <v-app dark>
    <v-app-bar
      fixed
      app
      clipped-left
      v-if="!['/','/maintenace'].includes(this.$route.path) && !maintenanceMode"
    >
      <v-app-bar-nav-icon class="hidden-lg-and-up" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-img src="/images/logo2.png" max-width="40" max-height="40" contain />
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
                <v-select v-model="selectedLang" :items="langOptions" label="Language"></v-select>
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
      v-if="!['/','/maintenace'].includes(this.$route.path) && !maintenanceMode"
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

          <v-list-item
            :to="config.urls.game.server.path"
            v-if="account && account.guilds.find(g => g.isAdmin)"
          >
            <v-list-item-title>{{lang.nav.MANAGE_SERVER}}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>

      <v-divider></v-divider>

      <v-list nav dense>
        <v-list-item-group v-model="selection">
          <v-list-item :href="config.urls.invite.path" target="_blank">
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
      <nuxt :key="!urlConfig || urlConfig.refreshOnParamsChange ? $route.fullPath : $route.path" />
    </v-content>
    <SnackBars></SnackBars>
  </v-app>
</template>

<script>
import lang from "../components/lang/en.json";
import aux from "../components/auxjs/appaux";
import SnackBars from "../components/snackbars";
import ws from "../store/socket";
import { cloneDeep } from "lodash";

let lastGuildRefresh = new Date().getTime();

export default {
  middleware: ["check-auth"],
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
      selectedLang: this.$store.getters.selectedLang,
      langOptions: [],
      selection: null,
      windowWidth: 0,
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
      this.maintenance();
      return this.$route.path;
    },
    storeSiteSettings() {
      return this.$store.getters.siteSettings;
    },
    urlConfig() {
      const parsedURLs = aux.parseConfigURLs(this.config.urls);
      return parsedURLs.find(
        path => path.session && this.$route.path === path.path
      );
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
          this.setSelectedLang();
        }
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
  methods: {
    signOut() {
      this.$store.dispatch("signOut").then(() => {
        this.$cookies.remove("token", { path: "/" });
        this.$cookies.remove("token", { path: "/games" });
        this.$router.push("/", () => {
          // window.location.reload(true);
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
            lang: this.selectedLang
          },
          app: this,
          route: this.$route
        })
        .then(result => {
          if (result.status == "success") {
            this.setSelectedLang();
            this.settingsDialog = false;
          } else {
            throw new Error(result.message);
          }
        })
        .catch(err => {
          this.$store.dispatch("addSnackBar", {
            message: (err && err.message) || err || "An error occured!",
            color: "error darken-1"
          });
        });
    },
    setSelectedLang() {
      if (process.server) return;
      if (!this.lang.code) return;
      if (document.getElementById("moment-lang"))
        document.getElementById("moment-lang").remove();
      if (document.getElementById("moment-lang-load"))
        document.getElementById("moment-lang-load").remove();
      const el = document.createElement("script");
      el.id = "moment-lang";
      el.type = "text/javascript";
      el.src = `/locale/${this.selectedLang}.js`;
      el.onload = () => {
        this.$store.dispatch("setSelectedLang", this.selectedLang);
      };
      document.body.appendChild(el);
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
          return this.signOut();
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
    }
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();

    this.$store.commit("setSnackBars", []);

    await this.$store.dispatch("fetchLangs");
    this.setSelectedLang();

    let isMobile = await this.$store.dispatch("isMobile");

    if (!isMobile) {
      this.socket = ws.socket(this.$store.getters.env.apiUrl);

      this.socket.on("game", data => {
        let guildRefresh = new Date().getTime();
        const account = this.$store.getters.account;
        if (!account) return;
        let guilds = cloneDeep(account.guilds);
        const path = this.$route.path;
        const gamesPage = /^\/games\//.test(path);
        const gameListingsPage = /^\/games\/(upcoming|my-games|calendar|manage-server)/.test(
          path
        );

        if (gameListingsPage) {
          if (
            ["new", "rescheduled"].includes(data.action) &&
            guildRefresh - lastGuildRefresh >= 10 * 1000
          ) {
            // A new game has been created or an existing game has been rescheduled
            lastGuildRefresh = guildRefresh;
            const pages = {};
            pages[this.config.urls.game.games] = "upcoming";
            pages[this.config.urls.game.dashboard] = "my-games";
            pages[this.config.urls.game.calendar] = "calendar";
            pages[this.config.urls.game.server] = "server";
            this.$store.dispatch("fetchGuilds", {
              page: pages[path],
              games: true,
              app: this
            });
          }
        }
        if (gamesPage) {
          if (
            data.action == "updated" &&
            guilds.find(g => g.id == data.guildId)
          ) {
            // An existing game has been updated, update the store if it belongs to one of current user's guilds
            let updated = false;
            guilds = guilds.map(guild => {
              const index = guild.games.findIndex(
                game => game._id == data.gameId
              );
              if (index < 0) {
                lastGuildRefresh = guildRefresh;
                this.$store.dispatch("fetchGuilds", {
                  page: path.replace("/games/", ""),
                  games: true,
                  app: this
                });
              } else {
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
            if (gameListingsPage) {
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
      });

      this.socket.on("site", data => {
        if (data.action == "settings") {
          this.$store.commit("setSiteSettings", data);
        }
      });
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
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
</style>