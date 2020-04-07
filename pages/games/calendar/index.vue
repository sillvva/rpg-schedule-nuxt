<template>
  <v-container fluid>
    <v-card>
      <v-toolbar color="discord" v-if="lang.game && baseDate">
        <v-toolbar-title class="d-none d-md-flex mb-0 align-center">
          <span>{{moment(`${selYear}-${selMonth+1 < 10 ? '0' : ''}${selMonth+1}-${selDate < 10 ? '0' : ''}${selDate}T00:00:00`).format('LL')}}</span>
        </v-toolbar-title>
        <v-btn
          text
          fab
          small
          exact
          class="hidden-xs-only ml-2"
          :to="`${config.urls.game.calendar.path}?y=${selYear}&m=${selMonth+1}&d=${selDate}`"
        >
          <v-icon>mdi-link</v-icon>
        </v-btn>
        <v-btn
          text
          fab
          small
          class="hidden-xs-only ml-2"
          :href="`${env.apiUrl.replace(/https?/,'webcal')}${config.urls.ics.path.replace(':uid', account.user.id)}`"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          light
          :disabled="selMonth === baseDate.month() && selYear === baseDate.year() && selDate === baseDate.date()"
          @click="selectToday"
        >{{lang.game.TODAY}}</v-btn>
        <v-btn
          color="white"
          light
          class="ml-3"
          min-width="48px"
          :disabled="selMonth === baseDate.month() && selYear === baseDate.year()"
          @click="decrementMonth"
        >&#9668;</v-btn>
        <v-btn color="white" light class="ml-3" min-width="48px" @click="incrementMonth">&#9658;</v-btn>
        <v-spacer class="d-md-none"></v-spacer>
      </v-toolbar>
      <v-container fluid class="pa-0 pa-md-2">
        <v-row dense>
          <v-col cols="12" class="col-sm py-0">
            <div class="calendar">
              <div class="col cal-header grey darken-3" v-for="(wd, i) in [0,1,2,3,4,5,6]" :key="i">
                <span class="wd">{{moment().day(wd).format('dddd').slice(0,1).toUpperCase()}}</span>
              </div>
            </div>
            <div id="game-calendar" class="calendar mb-2 d-block">
              <div class="d-flex" v-for="(week, w) in Array(dates.length / 7).fill(0)" :key="w">
                <div
                  v-for="(date, d) in dates.slice(w * 7, (w + 1) * 7)"
                  :key="d"
                  :class="`col cal-day ${date.curMonth ? `cal-day-curmonth ${date.md === selDate ? 'bg-discord' : ''}` : ''}`"
                  :date="date.dx"
                  @click="selectDate(date)"
                >
                  <span
                    v-if="date.curMonth"
                    class="cal-date"
                  >{{moment(`${date.dx}T00:00:00`).format('D')}}</span>
                  <br />
                  <span
                    v-if="date.games.length > 0"
                    :class="`cal-games-count ${date.games.find(g => g.dm === account.user.tag || g.reserved.indexOf(account.user.tag) >= 0) ? 'selected' : ''}`"
                  >{{date.games.length}}</span>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" class="col-sm py-0">
            <v-card
              color="grey darken-3 mb-2"
              max-width="100%"
              v-for="(game, i) in (dates.find(d => d.md === selDate) || []).games"
              v-bind:key="i"
            >
              <v-card-title class="subtitle-1" style="position: relative;">
                {{game.adventure}}
                <v-btn
                  @click.stop="rsvpGameId = game._id; rsvp();"
                  v-if="game.method === 'automated' && game.slot === 0"
                  :title="lang.buttons.SIGN_UP"
                  color="green"
                  fab
                  small
                  absolute
                  bottom
                  right
                >
                  <v-icon>mdi-thumb-up</v-icon>
                </v-btn>
                <v-btn
                  @click.stop="rsvpGameId = game._id; rsvp();"
                  v-if="game.method === 'automated' && game.slot > 0"
                  :title="lang.buttons.DROP_OUT"
                  color="red"
                  fab
                  small
                  absolute
                  bottom
                  right
                >
                  <v-icon>mdi-thumb-down</v-icon>
                </v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <p class="my-0">
                      <strong>{{lang.game.WHEN}}:</strong>
                      <span
                        :class="game.moment.state"
                      >{{game.moment.calendar}} ({{game.moment.from}})</span>
                    </p>
                    <p class="my-0">
                      <a
                        :href="`http://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURI(game.adventure)}&dates=${game.moment.isoutc}/${game.moment.isoutc}&location=${encodeURI(`${game.guild.name} - ${game.where}`)}&trp=false&sprop=&details=${encodeURI(game.description)}`"
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
                      <strong>{{lang.game.SERVER}}:</strong>
                      <span v-html="parseURL(game.guild.name)"></span>
                    </p>
                  </v-col>
                  <v-col cols="12" md="6">
                    <p class="my-0">
                      <strong>{{lang.game.GM}}:</strong>
                      {{game.dm.split("#")[0]}}
                    </p>
                    <p class="my-0">
                      <strong>{{lang.game.RESERVED}}:</strong>
                      {{game.reserved.split("\n")[0].length == 0 ? 0 : Math.min(game.reserved.split("\n").length, parseInt(game.players))}}/{{game.players}}
                      <span
                        v-if="game.signedUp"
                      >(Slot #{{game.slot}})</span>
                    </p>
                    <p class="my-0">
                      <strong>{{lang.game.WAITLISTED}}:</strong>
                      {{game.reserved.split("\n").length - Math.min(game.reserved.split("\n").length, parseInt(game.players))}}
                      <span
                        v-if="game.waitlisted"
                      >(Slot #{{game.slot}})</span>
                    </p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import { updateToken } from "../../../components/auth";
import { cloneDeep } from "lodash";
import moment from "moment";

export default {
  middleware: ["check-auth", "authenticated"],
  head: {
    title: "Calendar"
  },
  data() {
    return {
      config: this.$store.getters.config,
      env: this.$store.getters.env,
      lang: {},
      account: {},
      games: [],
      rsvpGameId: "",
      weekdays: [0, 1, 2, 3, 4, 5, 6].map(d => {
        return moment()
          .day(d)
          .format("dddd");
      }),
      dates: [],
      baseDate: moment(),
      selYear:
        (this.$route.query.y && parseInt(this.$route.query.y)) ||
        moment().year(),
      selMonth:
        (this.$route.query.m && parseInt(this.$route.query.m) - 1) ||
        moment().month(),
      selDate:
        (this.$route.query.d && parseInt(this.$route.query.d)) ||
        moment().date()
    };
  },
  computed: {
    storeGuilds() {
      return this.$store.getters.account
        ? cloneDeep(this.$store.getters.account)
        : [];
    },
    storeLang() {
      return this.$store.getters.lang;
    }
  },
  watch: {
    storeGuilds: {
      handler: function(newVal) {
        this.account = newVal;
        this.allGames();
        this.renderCalendarMonth();
        // this.parseDates();
      },
      immediate: true
    },
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
        // this.parseDates();
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
      })
      .then(result => {
        // parseDateInterval = setInterval(() => {
        //   this.parseDates();
        // }, 30 * 1000);
      });
  },
  methods: {
    allGames() {
      this.games = this.account.guilds
        .filter(guild => guild.games.length > 0)
        .reduce((acc, guild) => {
          return acc.concat(
            guild.games.map(g => {
              delete g._guild;
              delete g._channel;
              g.guild = {
                id: guild.id,
                name: guild.name,
                icon: guild.icon
              };
              return g;
            })
          );
        }, [])
        .filter(function(g) {
          return g.date >= moment().format("YYYY-MM-DD") && !g.hideDate;
        });
    },
    daysInMonth(month, year) {
      return new Date(year, month, 0).getDate();
    },
    renderCalendarMonth() {
      let md = 1;
      let curmonth = false;
      let out = "";
      let i = 1;
      const fd = new Date(this.selYear, this.selMonth, md).toString();
      const fwdi = this.weekdays.findIndex(function(d) {
        return d.slice(0, 3) === fd.slice(0, 3);
      });
      this.dates = [];
      do {
        this.weekdays.forEach((d, di) => {
          if (di === fwdi) curmonth = true;
          const dx = `${this.selYear}-${this.selMonth + 1 < 10 ? "0" : ""}${this
            .selMonth + 1}-${md < 10 ? "0" : ""}${md}`;
          this.dates.push({
            curMonth: curmonth,
            md: md,
            dx: dx,
            games: curmonth ? this.games.filter(g => g.date === dx) : [],
            reserved: this.games
              .filter(g => g.date === dx)
              .find(
                g =>
                  g.dm === this.account.user.tag ||
                  g.reserved.indexOf(this.account.user.tag) >= 0
              )
          });
          if (md === this.daysInMonth(this.selMonth + 1, this.selYear))
            curmonth = false;
          if (curmonth) md++;
          i++;
        });
      } while (i < this.daysInMonth(this.selMonth + 1, this.selYear) + fwdi);
    },
    moment(val) {
      return moment(val);
    },
    parseURL(string) {
      const exp = /((https?:\/\/)((www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b)([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
      const regex = new RegExp(exp);
      return string.replace(
        regex,
        `<a href="$1" target="_blank" class="discord--text">$3</a>`
      );
    },
    selectDate(date) {
      if (!date.curMonth) return;
      this.selDate = moment(`${date.dx}T00:00:00`).date();
      this.renderCalendarMonth();
    },
    selectToday() {
      this.selYear = moment().year();
      this.selMonth = moment().month();
      this.selDate = moment().date();
      this.renderCalendarMonth();
    },
    incrementMonth() {
      this.selMonth += 1;
      if (this.selMonth > 12) {
        this.selMonth = 1;
        this.selYear += 1;
      }
      this.renderCalendarMonth();
    },
    decrementMonth() {
      this.selMonth -= 1;
      if (this.selMonth < 1) {
        this.selMonth = 12;
        this.selYear -= 1;
      }
      this.renderCalendarMonth();
    },
    rsvp() {
      this.$store.dispatch("rsvpGame", {
        gameId: this.rsvpGameId,
        route: this.$route,
        app: this
      });
    }
  }
};
</script>

<style scoped>
.calendar {
  display: flex;
  flex-wrap: wrap;
}

.cal-header {
  text-align: center;
  padding: 6px 6px !important;
}

.cal-day {
  text-align: center;
  padding: 6px 3px !important;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 60px;
}

.cal-day-curmonth {
  text-align: center;
  background-color: rgba(255, 255, 255, 0.35);
}

.cal-day-curmonth:hover,
.cal-day-curmonth.selected {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.cal-games-count {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #202225;
  font-weight: bold;
  overflow: hidden;
}

.cal-games-count.selected {
  background: #28a745;
}

@media (max-width: 500px) {
  #calendar-name-2 {
    font-size: 1.4em;
  }
}

.add-games-menu::after {
  display: none !important;
}

@media (min-width: 960px) {
  .pa-md-2 {
    padding: 8px !important;
  }
}
</style>
