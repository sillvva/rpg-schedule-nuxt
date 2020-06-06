<template>
  <!-- <v-app v-if="$fetchState.pending">
    <v-flex class="d-flex" justify-center align-center style="height: 100%;">
      <v-progress-circular :size="100" :width="7" color="discord" indeterminate></v-progress-circular>
    </v-flex>
  </v-app> -->
  <v-container fluid>
    <v-text-field
      v-model="searchQuery"
      @keyup="search"
      flat
      solo
      prepend-inner-icon="mdi-magnify"
      class="hidden-sm-and-up mb-n4"
    ></v-text-field>
    <v-app-bar dense class="mb-3 hidden-xs-only">
      <v-text-field
        v-model="searchQuery"
        @keyup="search"
        flat
        solo
        prepend-inner-icon="mdi-magnify"
        style="height: 48px; margin-left: -16px;"
      ></v-text-field>
      <v-btn
        text
        small
        v-if="guilds.filter(g => g.collapsed).length > 0"
        @click="expandAll"
        class="ml-4"
      >Expand All</v-btn>
      <v-btn
        text
        small
        v-if="guilds.filter(g => !g.collapsed).length > 0"
        @click="collapseAll"
        class="ml-4"
      >Collapse All</v-btn>
    </v-app-bar>
    <v-card
      v-for="(guild, g) in guilds.filter(gld => !gld.filtered)"
      v-bind:key="g"
      max-width="100%"
      class="mb-3"
    >
      <v-toolbar dense color="discord">
        <v-img
          v-if="guild.icon"
          :src="guild.icon"
          max-width="30"
          class="mr-3 hidden-xs-only"
          style="border-radius: 50%;"
        ></v-img>
        <v-toolbar-title>{{guild.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          :href="guild.csv"
          :download="`past-events-${new Date().getFullYear()}-${new Date().getMonth()+1 < 10 ? '0' : ''}${new Date().getMonth()+1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}.csv`"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon @click="guild.collapsed = !guild.collapsed">
          <v-icon v-if="!guild.collapsed">mdi-chevron-down</v-icon>
          <v-icon v-if="guild.collapsed">mdi-chevron-up</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container fluid v-if="!guild.collapsed">
        <v-row dense>
          <v-col
            v-for="(game, i) in guild.games.filter(game => !game.filtered)"
            v-bind:key="i"
            cols="12"
            sm="6"
            md="4"
            lg="4"
            xl="2"
          >
            <GameCard :gameData="game" :numColumns="1" :exclude="['server']" :edit="true"></GameCard>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import { gamesCSV } from "../../../assets/auxjs/appaux";
import GameCard from "../../../components/game-card";
import { cloneDeep } from "lodash";
import GraphemeSplitter from "grapheme-splitter";

export default {
  middleware: ["authenticated"],
  head: {
    title: "Past Events"
  },
  components: {
    GameCard: GameCard
  },
  data() {
    return {
      guilds: [],
      lang: {},
      langs: {},
      config: this.$store.getters.config,
      searchQuery: this.$route.query.s,
      colorMenu: false,
      colorMenus: {},
      selectedChannel: "",
      tab: null,
      emojiRule: value => {
        const splitter = new GraphemeSplitter();
        const rgx = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        return (
          (splitter.splitGraphemes(value).length === 1 && rgx.test(value)) ||
          "Must be 1 emoji character"
        );
      }
    };
  },
  computed: {
    storeGuilds() {
      return this.$store.getters.account
        ? cloneDeep(this.$store.getters.account.guilds).map(g => {
            g.currentConfig = cloneDeep(g.config);
            return g;
          })
        : [];
    },
    storeLang() {
      return this.$store.getters.lang;
    },
    storeLangs() {
      return this.$store.getters.langs;
    }
  },
  watch: {
    storeGuilds: {
      handler: function(newVal) {
        this.guilds = cloneDeep(newVal).map(g => {
          g.roleValues = g.roles
            .filter(r => !r.managed && r.name !== "@everyone")
            .map(r => {
              return { text: r.name, value: r.name };
            });
          g.channelRoleValues = cloneDeep(g.roleValues);
          g.roleValues.splice(0, 0, {
            text: (this.lang.config || {}).NO_ROLE,
            value: null
          });
          g.channelRoleValues.splice(0, 0, {
            text: (this.lang.config || {}).DEFAULT_SERVER,
            value: null
          });
          g.config.escape = g.config.escape || "!";
          g.config.channel = g.config.channel.map(c => {
            c.embedColor = c.embedColor || "";
            c.role = c.role || "";
            return c;
          });
          g.config.channel.forEach(c => {
            this.colorMenus[c.id] = false;
          });
          g.csv = gamesCSV(g);
          return {
            ...g,
            games: g.games.filter(game => {
              return game.timestamp < new Date().getTime();
            }),
            collapsed: false,
            filtered: false
          };
        });
        if (
          !(
            this.$store.getters.account &&
            this.$store.getters.account.user.tag === this.config.author
          )
        ) {
          this.searchGuild();
          if (this.guilds) {
            this.guilds.forEach(guild => {
              guild.channels.forEach(channel => {
                console.log(channel.name, channel.type);
                if (channel.type == "category") {
                  console.log(channel.name);
                }
              });
            });
          }
        }
      },
      immediate: true
    },
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
      },
      immediate: true
    },
    storeLangs: {
      handler: function(newVal) {
        this.langs = newVal;
      },
      immediate: true
    }
  },
  methods: {
    saveGuildConfiguration() {
      const guild = this.guilds.find(g => g.editing);
      if (guild && guild.config) {
        const form = this.$refs[`config${guild.id}`][0];
        if (form && form.validate()) {
          if (guild.config.pruneIntEvents < 2) guild.config.pruneIntEvents = 2;
          if (guild.config.pruneIntEvents > 14)
            guild.config.pruneIntEvents = 14;
          if (guild.config.pruneIntDiscord < 2)
            guild.config.pruneIntDiscord = 2;
          if (guild.config.pruneIntDiscord > 14)
            guild.config.pruneIntDiscord = 14;
          if (guild.config.pruneIntEvents < guild.config.pruneIntDiscord) {
            guild.config.pruneIntEvents = guild.config.pruneIntDiscord;
          }
          guild.config.channel = guild.config.channel
            .filter(c => guild.channels.find(ch => ch.id === c.channelId))
            .map(c => {
              c.gameDefaults.minPlayers = isNaN(c.gameDefaults.minPlayers)
                ? 1
                : parseInt(c.gameDefaults.minPlayers);
              c.gameDefaults.maxPlayers = isNaN(c.gameDefaults.maxPlayers)
                ? 7
                : parseInt(c.gameDefaults.maxPlayers);
              return c;
            });
          this.$store
            .dispatch("saveGuildConfig", {
              config: guild.config,
              app: this,
              route: this.$route
            })
            .then(result => {
              this.$store.dispatch("addSnackBar", {
                message: "Configuration saved successfully" || err,
                color: "success",
                timeout: 10
              });
              guild.editing = false;
            })
            .catch(err => {
              this.$store.dispatch("addSnackBar", {
                message: (err && err.message) || err || "An error occured!",
                color: "error",
                timeout: 10
              });
            });
        }
      }
    },
    cloneDeep(val) {
      return cloneDeep(val);
    },
    search($event) {
      if (!$event || $event.key != "Enter") return;
      if (this.searchQuery.trim().length == 0) {
        this.$router.push(this.$route.path);
      } else {
        this.$router.push(
          `${this.$route.path}?s=${encodeURIComponent(this.searchQuery.trim())}`
        );
      }
      this.searchGuild();
    },
    searchGuild() {
      if (
        this.$store.getters.account &&
        this.$store.getters.account.user.tag === this.config.author
      ) {
        this.guilds = [];
        this.$store.dispatch("fetchGuilds", {
          page: "server",
          games: true,
          app: this,
          search: this.searchQuery.trim().length > 0 ? this.searchQuery : null
        });
      } else {
        // Regex Example: https://regex101.com/r/LFEUgY/2
        // Removed lookback for lack of Firefox support
        const regex = /((\w+):)?"([^"]+)"|((\w+):)?([^ ]+)/gm,
          matches = [];
        let m;
        if (this.searchQuery) {
          while ((m = regex.exec(this.searchQuery)) !== null) {
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }
            if (m[3] && m[3].length > 0) {
              matches.push({ type: m[2] || "any", query: m[3] });
            }
            if (m[6] && m[6].length > 0) {
              matches.push({ type: m[5] || "any", query: m[6] });
            }
          }
        }
        this.guilds = this.guilds.map(guild => {
          guild.games = guild.games.map(game => {
            if (matches.length > 0) {
              if (
                matches
                  .map(match => ({
                    type: match.type,
                    regex: new RegExp(match.query, "gi")
                  }))
                  .filter(match => {
                    return (
                      (match.type === "any" &&
                        (match.regex.test(game.adventure) ||
                          match.regex.test(game.dm.tag || game.dm) ||
                          match.regex.test(game.author.tag) ||
                          match.regex.test(guild.name))) ||
                      match.regex.test(
                        (match.type === "gm" && (game.dm.tag || game.dm)) ||
                          (match.type === "author" &&
                            game.author &&
                            game.author.tag) ||
                          (match.type === "name" && game.adventure) ||
                          (match.type === "server" && guild.name) ||
                          (match.type === "reserved" &&
                            game.reserved.reduce(
                              (i, r) => `${i}\n${r.tag}`,
                              ""
                            )) ||
                          game[match.type]
                      )
                    );
                  }).length != matches.length
              ) {
                game.filtered = true;
              } else {
                game.filtered = false;
              }
            } else {
              game.filtered = false;
            }
            return game;
          });
          if (
            !this.searchQuery ||
            this.searchQuery.trim().length === 0 ||
            guild.games.find(game => !game.filtered)
          )
            guild.filtered = false;
          return guild;
        });
        this.expandAll();
      }
    },
    collapseAll() {
      this.guilds = this.guilds.map(g => {
        g.collapsed = true;
        return g;
      });
    },
    expandAll() {
      this.guilds = this.guilds.map(g => {
        g.collapsed = false;
        return g;
      });
    },
    addChannel() {
      const guild = this.guilds.find(g =>
        g.channels.find(c => c.id === this.selectedChannel)
      );
      if (guild) {
        guild.config.channel.push({
          channelId: this.selectedChannel,
          gameDefaults: {
            minPlayers: 1,
            maxPlayers: 7,
            reminder: "0"
          }
        });
      }
      this.selectedChannel = "";
    },
    removeChannel(config, c) {
      config.channel.splice(c, 1);
      this.selectedChannel = "";
    },
    updateColors(color) {
      const g = this.guilds.find(g => g.editing);
      if (!g) return;
      if (g.config.embedColor)
        g.config.embedColor = g.config.embedColor.slice(0, 7);
      g.config.channel = g.config.channel.map(c => {
        if (c.embedColor)
          c.embedColor = (typeof c.embedColor === "string"
            ? c.embedColor
            : c.embedColor.hex
          ).slice(0, 7);
        return c;
      });
    }
  }
};
</script>

<style>
input[type="color"] {
  padding: 0;
  width: 20px;
}

@media (min-width: 1400px) {
  .col-lg-4 {
    flex: 0 0 calc(100% / 4);
    max-width: calc(100% / 4);
  }
}

@media (min-width: 1800px) {
  .col-xl-2 {
    flex: 0 0 calc(100% / 5);
    max-width: calc(100% / 5);
  }
}
</style>