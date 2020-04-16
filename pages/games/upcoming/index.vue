<template>
  <v-container fluid>
    <v-app-bar dense class="mb-3">
      <v-text-field
        v-model="searchQuery"
        @keyup="searchGuild"
        dense
        prepend-inner-icon="mdi-magnify"
        style="margin-bottom: -10px;"
      ></v-text-field>
      <v-btn
        text
        small
        v-if="guilds.filter(g => g.collapsed).length > 0"
        @click="expandAll"
        class="hidden-xs-only ml-3"
      >Expand All</v-btn>
      <v-btn
        text
        small
        v-if="guilds.filter(g => !g.collapsed).length > 0"
        @click="collapseAll"
        class="hidden-xs-only ml-3"
      >Collapse All</v-btn>
    </v-app-bar>
    <v-card
      v-for="(guild, g) in guilds.filter(g => !g.filtered).filter(g => g.games.length > 0)"
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
            lg="3"
            xl="2"
          >
            <GameCard :gameData="game" :numColumns="1" :exclude="['server']"></GameCard>
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
      color="green"
      :title="lang.buttons && lang.buttons.NEW_GAME"
      style="bottom: 15px;"
      class="hidden-lg-and-up"
      v-if="guilds.find(guild => guild.permission || guild.isAdmin)"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import { updateToken } from "../../../components/auth";
import GameCard from "../../../components/game-card";
import { cloneDeep } from "lodash";

export default {
  middleware: ["authenticated"],
  head: {
    title: "Upcoming Games"
  },
  components: {
    GameCard: GameCard
  },
  data() {
    return {
      guilds: [],
      lang: {},
      rsvpGameId: 0,
      config: this.$store.getters.config,
      searchQuery: ""
    };
  },
  computed: {
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
    storeGuilds: {
      handler: function(newVal) {
        this.guilds = cloneDeep(newVal).map(g => ({
          ...g,
          collapsed: false
        }));
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
    this.$store.dispatch("fetchGuilds", {
      page: "upcoming",
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
    searchGuild($event) {
      if ($event.key != "Enter") return;
      const regex = /((\w+):)?"([^"]+)"|((\w+):)?([^ ]+)/gm,
        matches = [];
      let m;
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
      this.guilds = this.guilds.map(guild => {
        guild.games = guild.games.map(game => {
          if (matches.length > 0) {
            if (
              !matches
                .map(match => ({
                  type: match.type,
                  regex: new RegExp(match.query, "gi")
                }))
                .find(match => {
                  return (
                    (match.type === "any" &&
                      (match.regex.test(game.adventure) ||
                        match.regex.test(game.dm.tag) ||
                        match.regex.test(guild.name))) ||
                    match.regex.test(
                      (match.type === "gm" && game.dm.tag) ||
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
                })
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
    }
  }
};
</script>