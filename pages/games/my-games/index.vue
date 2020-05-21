<template>
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
      v-for="(guild, g) in guilds.filter(g => !g.filtered)"
      v-bind:key="g"
      max-width="100%"
      class="mb-3"
    >
      <v-toolbar color="discord" dense>
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
          :to="`${config.urls.game.create.path}?s=${guild.id}`"
          :title="lang.buttons.NEW_GAME"
          icon
          class="hidden-xs-only"
          v-if="(guild.permission || guild.isAdmin) && guild.announcementChannels.length > 0"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn icon @click="guild.collapsed = !guild.collapsed">
          <v-icon v-if="!guild.collapsed">mdi-chevron-down</v-icon>
          <v-icon v-if="guild.collapsed">mdi-chevron-up</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container fluid v-if="!guild.collapsed">
        <v-row dense>
          <v-col
            v-for="(game, i) in guild.games.filter(game => game && !game.filtered)"
            v-bind:key="i"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="2"
          >
            <GameCard
              v-if="checkRSVP(game.dm, account.user) || (game.author && checkRSVP(game.author, account.user))"
              :gameData="game"
              :numColumns="1"
              :exclude="['gm', 'server']"
              :edit="checkRSVP(game.dm, account.user)"
            ></GameCard>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <v-btn
      fab
      :to="config.urls.game.create.path"
      fixed
      right
      bottom
      color="discord"
      :title="lang.buttons && lang.buttons.NEW_GAME"
      style="bottom: 15px;"
      class="hidden-lg-and-up"
      v-if="guilds.find(guild => (guild.permission || guild.isAdmin) && guild.announcementChannels.length > 0)"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { updateToken } from "../../../assets/auxjs/auth";
import { checkRSVP } from "../../../assets/auxjs/appaux";
import GameCard from "../../../components/game-card";
import { cloneDeep } from "lodash";

export default {
  middleware: ["authenticated"],
  head: {
    title: "My Games"
  },
  components: {
    GameCard: GameCard
  },
  data() {
    return {
      guilds: [],
      lang: {},
      config: this.$store.getters.config,
      account: this.$store.getters.account || {},
      searchQuery: this.$route.query.s
    };
  },
  computed: {
    storeAccount() {
      return this.$store.getters.account;
    },
    storeGuilds() {
      return this.$store.getters.account
        ? this.$store.getters.account.guilds
        : [];
    },
    storeLang() {
      return this.$store.getters.lang;
    }
  },
  watch: {
    storeAccount: {
      handler: function(newVal) {
        this.account = newVal;
      },
      immediate: true
    },
    storeGuilds: {
      handler: function(newVal) {
        this.guilds = cloneDeep(newVal).map(g => ({
          ...g,
          collapsed: false
        }));
        this.searchGuild();
      },
      immediate: true
    },
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
      },
      immediate: true
    }
  },
  mounted() {
    updateToken(this);
    this.$store.dispatch("emptyGuilds");
    this.$store.dispatch("fetchGuilds", {
      page: "my-games",
      games: true,
      app: this
    });
  },
  methods: {
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
                  query: match.query,
                  regex: new RegExp(match.query, "gi")
                }))
                .filter(match => {
                  return (
                    (match.query === "new" &&
                      new Date().getTime() - game.createdTimestamp <
                        24 * 3600 * 1000) ||
                    (match.query != "new" && match.type === "any" &&
                      (match.regex.test(game.adventure) ||
                        match.regex.test(game.dm.tag || game.dm) ||
                        match.regex.test(game.author && game.author.tag) ||
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
        if (guild.games.find(game => !game.filtered)) guild.filtered = false;
        else guild.filtered = true;
        return guild;
      });
      this.expandAll();
    },
    checkRSVP(rsvp, user) {
      return checkRSVP(rsvp, user);
    }
  }
};
</script>