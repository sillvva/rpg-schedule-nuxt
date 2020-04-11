<template>
  <v-container fluid>
    <v-card>
      <v-toolbar color="discord" v-if="lang.game && baseDate && moment">
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
                    :class="`cal-games-count ${date.games.find(g => g.dm === account.user.tag || g.reserved.indexOf(account.user.tag) >= 0 || (Array.isArray(g.reserved) && g.reserved.find(r => r.tag === account.user.tag || r.id === account.user.id))) ? 'selected' : ''}`"
                  >{{date.games.length}}</span>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" class="col-sm py-0">
            <div
              v-for="(game, i) in (dates.find(d => d.md === selDate) || { games: [] }).games"
              :key="i"
              class="mb-2"
            >
              <GameCard v-if="game" :gameData="game" :numColumns="2"></GameCard>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import { updateToken } from "../../../components/auth";
import GameCard from "../../../components/game-card";
import { cloneDeep } from "lodash";
import moment from "moment";

export default {
  middleware: ["check-auth", "authenticated"],
  head: {
    title: "Calendar"
  },
  components: {
    GameCard: GameCard
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
      console.log(this.games);
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
