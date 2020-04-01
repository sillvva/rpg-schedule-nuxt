<template>
  <v-app>
    <v-card v-for="(guild, g) in guilds" v-bind:key="g" max-width="100%">
      <v-toolbar color="discord">
        <v-toolbar-title>{{guild.name}}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <v-container fluid>
        <v-row dense>
          <v-col v-for="(game, i) in guild.games" v-bind:key="i" cols="12" sm="6" md="4" xl="3">
            <v-card color="grey darken-3" max-width="100%">
              <v-card-title class="subtitle-1">{{game.adventure}}</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <p class="my-0">
                  <strong>{{lang.game.GM}}:</strong>
                  {{game.dm.split("#")[0]}}
                </p>
                <p class="my-0">
                  <strong>{{lang.game.WHEN}}:</strong>
                  <span
                    :class="game.moment.state"
                  >{{game.moment.calendar}} ({{game.moment.from}})</span>
                </p>
                <p class="my-0">
                  <a
                    :href="`http://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURI(game.adventure)}&dates=${game.moment.isoutc}/${game.moment.isoutc}&location=${encodeURI(`${guild.name} - ${game.where}`)}&trp=false&sprop=&details=${encodeURI(game.description)}`"
                    class="discord--text"
                    target="_blank"
                    rel="nofollow"
                    onclick="event.stopPropagation();`"
                  >Add to Google Calendar</a>
                </p>
                <p class="my-0">
                  <strong>{{lang.game.WHERE}}:</strong>
                  <span v-html="parseURL(game.where)"></span>
                </p>
                <p class="my-0">
                  <strong>{{lang.game.RESERVED}}:</strong>
                  {{game.reserved.split("\n")[0].length == 0 ? 0 : Math.min(game.reserved.split("\n").length, parseInt(game.players))}}/{{game.players}}
                </p>
                <p class="my-0">
                  <strong>{{lang.game.WAITLISTED}}:</strong>
                  {{game.reserved.split("\n").length - Math.min(game.reserved.split("\n").length, parseInt(game.players))}}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-app>
</template>

<script>
import { updateToken } from "../../../components/auth";
import { cloneDeep } from "lodash";

let parseDateInterval;

export default {
  middleware: ["check-auth", "authenticated"],
  head: {
    title: "Upcoming Games"
  },
  data() {
    return {
      guilds: [],
      lang: {}
    };
  },
  computed: {
    storeGuilds() {
      return this.$store.getters.account.guilds;
    },
    storeLang() {
      return this.$store.getters.lang;
    }
  },
  watch: {
    storeGuilds: {
      handler: function(newVal) {
        this.guilds = cloneDeep(newVal);
        this.parseDates();
        if (newVal[0]) console.log(newVal[0].games[0]);
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
        page: "upcoming",
        games: true
      })
      .then(result => {
        parseDateInterval = setInterval(() => {
          this.parseDates();
        }, 30 * 1000);
      });
  },
  onDestroy() {
    clearInterval(parseDateInterval);
  },
  methods: {
    parseURL(string) {
      const exp = /((https?:\/\/)((www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b)([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
      const regex = new RegExp(exp);
      return string.replace(
        regex,
        `<a href="$1" target="_blank" class="discord--text">$3</a>`
      );
    },
    parseDates() {
      this.guilds = cloneDeep(this.guilds).map(guild => {
        guild.games = guild.games.map(game => {
          const date = game.moment.raw;
          const iso = game.moment.iso;
          const parsed = {
            calendar: moment(iso).calendar(),
            from: moment(iso).fromNow()
          };
          game.moment.calendar = parsed.calendar;
          game.moment.from = parsed.from;
          if (new Date().getTime() >= new Date(date).getTime()) {
            game.moment.state = 'red--text';
          }
          return game;
        })
        return guild;
      })
    }
  }
};
</script>