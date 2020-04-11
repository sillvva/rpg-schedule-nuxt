<template>
  <v-container fluid>
    <v-card v-for="(guild, g) in guilds" v-bind:key="g" max-width="100%" class="mb-3">
      <v-toolbar color="discord">
        <v-img :src="guild.icon" max-width="40" class="mr-3"></v-img>
        <v-toolbar-title>{{guild.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          :to="`${config.urls.game.create.path}?s=${guild.id}`"
          :title="lang.buttons.NEW_GAME"
          color="green"
          fab
          small
          class="hidden-xs-only"
          v-if="guild.permission || guild.isAdmin"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container fluid>
        <v-row dense>
          <v-col
            v-for="(game, i) in guild.games"
            v-bind:key="i"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="2"
          >
            <GameCard v-if="game.dm === account.user.tag" :gameData="game" :numColumns="1" :exclude="['gm', 'server']" :edit="true"></GameCard>
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
  middleware: ["check-auth", "authenticated"],
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
        this.guilds = cloneDeep(newVal);
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
    this.$store
      .dispatch("fetchGuilds", {
        page: "my-games",
        games: true,
        app: this
      });
  }
};
</script>