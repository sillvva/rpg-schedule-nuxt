<template>
  <v-container fluid>
    <v-row dense>
      <v-spacer></v-spacer>
      <v-col cols="12" xl="8" class="py-0">
        <v-form v-if="game" ref="game">
          <v-card>
            <v-toolbar color="discord">
              <v-toolbar-title v-if="guildId || !gameId">{{lang.buttons.NEW_GAME}}</v-toolbar-title>
              <v-toolbar-title v-if="gameId">{{lang.buttons.EDIT_GAME}}</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" lg="7" class="py-0">
                  <v-row dense>
                    <v-col cols="12" sm="6" class="py-0">
                      <v-text-field
                        id="guild"
                        :label="lang.game.SERVER"
                        readonly
                        :value="game.guild"
                        v-if="guildId || gameId"
                      ></v-text-field>
                      <v-select
                        id="guild"
                        :label="lang.game.SERVER"
                        v-model="game.s"
                        :items="guilds"
                        @change="selectGuild"
                        v-if="!(guildId || gameId)"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" class="py-0">
                      <v-text-field
                        :label="lang.game.CHANNEL"
                        readonly
                        id="channel"
                        :value="game.channel"
                        v-if="game.channels && game.channels.length === 1"
                      ></v-text-field>
                      <v-select
                        :label="lang.game.CHANNEL"
                        id="channel"
                        v-model="game.channel"
                        :items="game.channels ? game.channels.map(c => ({ text: c.name, value: c.name })) : []"
                        v-if="game.channels && game.channels.length > 1"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="5" md="4" lg="6" class="py-0">
                      <v-text-field
                        id="adventure"
                        :label="lang.game.GAME_NAME"
                        v-model="game.adventure"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="7" md="8" lg="6" class="py-0">
                      <v-text-field
                        id="gameImage"
                        :label="lang.game.GAME_IMAGE"
                        v-model="game.gameImage"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" class="py-0">
                      <v-text-field id="dm" :label="lang.game.GM" v-model="game.dm"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" class="py-0">
                      <v-text-field
                        id="runtime"
                        :label="lang.game.RUN_TIME"
                        v-model="game.runtime"
                        type="number"
                        :suffix="lang.game.labels.HOURS"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3" class="py-0">
                      <v-text-field
                        id="minPlayers"
                        :label="lang.game.MIN_PLAYERS"
                        v-model="game.minPlayers"
                        type="number"
                        min="1"
                        :max="game.players"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3" class="py-0">
                      <v-text-field
                        id="players"
                        :label="lang.game.MAX_PLAYERS"
                        v-model="game.players"
                        type="number"
                        :min="game.minPlayers"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" :sm="guildId || !gameId ? 6 : 12" class="py-0">
                      <v-text-field id="where" :label="lang.game.WHERE" v-model="game.where"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" v-if="guildId || !gameId" class="py-0">
                      <v-select
                        id="when"
                        :label="lang.game.WHEN"
                        v-model="game.when"
                        :items="whenItems"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="3" v-if="guildId || !gameId" class="py-0">
                      <v-select
                        id="method"
                        :label="lang.game.SIGN_UP_METHOD"
                        v-model="game.method"
                        :items="methodItems"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="12" class="py-0">
                      <v-textarea
                        rows="2"
                        id="customSignup"
                        :label="lang.game.CUSTOM_SIGNUP_INSTRUCTIONS"
                        v-model="game.customSignup"
                        :hint="game.method === enums.GameMethod.CUSTOM ? '' : lang.game.SIGNUP_INSTRUCTIONS_DESC"
                        persistent-hint
                        auto-grow
                        no-resize
                        maxlength="1500"
                        counter="1500"
                      ></v-textarea>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                    >
                      <v-text-field
                        id="date"
                        type="date"
                        :label="lang.game.DATE"
                        v-model="game.date"
                        @change="dateTimeLinks"
                        @keyup="dateTimeLinks"
                        :hint="nextDate && `Next: ${nextDate}`"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                    >
                      <v-text-field
                        id="time"
                        type="time"
                        :label="lang.game.TIME"
                        v-model="game.time"
                        @change="dateTimeLinks"
                        @keyup="dateTimeLinks"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                      style="position: relative;"
                    >
                      <v-text-field
                        id="timezone"
                        type="number"
                        :label="lang.game.TIMEZONE"
                        v-model="game.timezone"
                        min="-12"
                        max="14"
                        step="0.25"
                        prefix="UTC"
                        @change="dateTimeLinks"
                        @keyup="dateTimeLinks"
                      ></v-text-field>
                      <small :style="hintStyle">
                        <a
                          :href="convertLink"
                          class="discord--text"
                          target="_blank"
                        >{{convertLink.replace('https://','')}}</a>
                      </small>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                    >
                      <v-select
                        id="reminder"
                        :label="lang.game.REMINDER"
                        v-model="game.reminder"
                        :items="reminderItems"
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      :sm="['2','3','4'].includes(game.frequency) ? 6 : 12"
                      class="py-0"
                    >
                      <v-select
                        id="frequency"
                        :label="lang.game.FREQUENCY"
                        v-model="game.frequency"
                        :items="frequencyItems"
                        @change="dateTimeLinks"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" v-if="['2','3'].includes(game.frequency)" class="py-0">
                      <v-select
                        v-model="weekdays"
                        :items="weekdayItems"
                        attach
                        chips
                        :label="lang.game.WEEKDAYS"
                        multiple
                        @change="dateTimeLinks"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" v-if="['4'].includes(game.frequency)" class="py-0">
                      <v-select
                        id="monthlyType"
                        v-model="game.monthlyType"
                        :items="monthlyTypeItems"
                        :label="lang.game.MONTHLY_TYPE"
                        @change="dateTimeLinks"
                        :hint="monthlyWeekdayDesc"
                        persistent-hint
                      ></v-select>
                    </v-col>
                    <v-col cols="12" v-if="game.frequency != 0" class="py-0">
                      <v-select
                        v-model="repeatOptions"
                        :items="repeatOptionItems"
                        attach
                        chips
                        :label="lang.game.WHEN_REPEAT"
                        multiple
                        @change="dateTimeLinks"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" lg="5" class="py-0">
                  <v-row dense>
                    <v-col cols="5" lg="12" class="py-0">
                      <v-textarea
                        rows="7"
                        :label="lang.game.RESERVED"
                        v-model="game.reservedList"
                        no-resize
                      ></v-textarea>
                    </v-col>
                    <v-col cols="7" lg="12" class="py-0">
                      <v-textarea
                        rows="7"
                        :label="lang.game.DESCRIPTION"
                        v-model="game.description"
                        :maxlength="1500 - (game.method === enums.GameMethod.CUSTOM ? game.customSignup.length : 0)"
                        auto-grow
                        :counter="1500 - (game.method === enums.GameMethod.CUSTOM ? game.customSignup.length : 0)"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-row>
                <v-col cols="12" class="py-0">
                  <v-row v-if="guildId || !gameId">
                    <v-spacer></v-spacer>
                    <v-col cols="12" md="6" lg="4" xl="3" class="py-0">
                      <v-btn
                        @click="save"
                        width="100%"
                        :color="saveResult && saveResult != 'saving' ? saveResult : 'discord'"
                        :disabled="saveResult == 'saving' || saveResult == 'success'"
                      >
                        <v-progress-circular indeterminate color="white" v-if="saveResult == 'saving'"></v-progress-circular>
                        <span v-if="saveResult != 'saving'">{{lang.buttons.SAVE}}</span>
                      </v-btn>
                    </v-col>
                    <v-spacer></v-spacer>
                  </v-row>
                  <v-row v-if="gameId">
                    <v-col cols="12" md="6" class="py-md-0">
                      <v-btn
                        @click="save"
                        width="100%"
                        :color="saveResult && saveResult != 'saving' ? saveResult : 'discord'"
                        :disabled="saveResult == 'saving'"
                      >
                        <v-progress-circular indeterminate color="white" v-if="saveResult == 'saving'"></v-progress-circular>
                        <span v-if="saveResult != 'saving'">{{lang.buttons.SAVE}}</span>
                      </v-btn>
                    </v-col>
                    <v-col cols="12" class="py-md-0 col-md">
                      <v-btn
                        @click="saveCopy"
                        width="100%"
                        color="white"
                        light
                      >{{lang.buttons.SAVE_COPY}}</v-btn>
                    </v-col>
                    <v-col cols="12" class="py-md-0 col-md">
                      <v-btn
                        @click="deleteGame"
                        width="100%"
                        color="red"
                      >{{lang.buttons.DELETE_GAME}}</v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>
import lang from "../../../components/lang/en.json";
import { cloneDeep } from "lodash";

export default {
  middleware: ["free-auth"],
  head: {
    title: "Edit Game"
  },
  data() {
    return {
      componentKey: this.$route.query.g || this.$route.query.s,
      config: this.$store.getters.config,
      enums: this.$store.getters.enums,
      gameId: this.$route.query.g,
      guildId: this.$route.query.s,
      guilds: [],
      game: {},
      copy: false,
      convertLink: "",
      monthlyWeekdayDesc: "",
      nextDate: "",
      weekdays: [],
      repeatOptions: [],
      lang: lang,
      whenItems: [],
      methodItems: [],
      reminderItems: [],
      frequencyItems: [],
      repeatOptionItems: [],
      monthlyTypeItems: [],
      weekdayItems: [],
      hintStyle:
        "color: rgba(255,255,255,0.7); font-size: 12px; min-height: 14px; position: absolute; bottom: 0;",
      socket: null,
      saveResult: null,
      prevSave: null
    };
  },
  computed: {
    storeLang() {
      return this.$store.getters.lang;
    }
  },
  watch: {
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
        this.whenItems = [
          {
            text: this.lang.game.options.DATE_TIME,
            value: this.enums.GameWhen.DATETIME
          },
          { text: this.lang.game.options.NOW, value: this.enums.GameWhen.NOW }
        ];
        this.methodItems = [
          {
            text: this.lang.game.options.AUTOMATED_SIGNUP,
            value: this.enums.GameMethod.AUTOMATED
          },
          {
            text: this.lang.game.options.CUSTOM_SIGNUP_INSTRUCTIONS,
            value: this.enums.GameMethod.CUSTOM
          }
        ];
      },
      immediate: true
    }
  },
  mounted() {
    if (!this.gameId && !this.guildId && !this.$store.getters.account) {
      return this.$router.replace(this.config.urls.game.dashboard.path);
    }
    if (this.gameId) this.fetchGame("g", this.gameId);
    else if (this.guildId) this.fetchGame("s", this.guildId);
    else if (this.$store.getters.account) {
      const fetchGuilds = async () => {
        await this.$store.dispatch("fetchGuilds", {
          page: "my-games",
          games: true,
          app: this
        });
        const account = cloneDeep(this.$store.getters.account);
        this.guilds = account.guilds
          .filter(guild => guild.permission || guild.isAdmin)
          .map(g => ({ text: g.name, value: g.id }));
        if (this.guilds.length > 0) {
          this.game.s = this.guilds[0].value;
          await this.selectGuild();
        }
        this.game.dm = account.user.tag;
      };

      fetchGuilds();
    }

    this.reminderItems = [
      {
        text: this.lang.game.options.NO_REMINDER,
        value: "0"
      },
      {
        text: this.lang.game.options.MINUTES_15,
        value: "15"
      },
      {
        text: this.lang.game.options.MINUTES_30,
        value: "30"
      },
      {
        text: this.lang.game.options.MINUTES_60,
        value: "60"
      },
      {
        text: this.lang.game.options.HOURS_6,
        value: "360"
      },
      {
        text: this.lang.game.options.HOURS_12,
        value: "720"
      },
      {
        text: this.lang.game.options.HOURS_24,
        value: "1440"
      }
    ];
    this.weekdayItems = [
      {
        text: moment()
          .day(0)
          .format("ddd"),
        value: 0
      },
      {
        text: moment()
          .day(1)
          .format("ddd"),
        value: 1
      },
      {
        text: moment()
          .day(2)
          .format("ddd"),
        value: 2
      },
      {
        text: moment()
          .day(3)
          .format("ddd"),
        value: 3
      },
      {
        text: moment()
          .day(4)
          .format("ddd"),
        value: 4
      },
      {
        text: moment()
          .day(5)
          .format("ddd"),
        value: 5
      },
      {
        text: moment()
          .day(6)
          .format("ddd"),
        value: 6
      }
    ];
    this.frequencyItems = [
      {
        text: this.lang.game.options.NO_REPEAT,
        value: this.enums.FrequencyType.NO_REPEAT
      },
      {
        text: this.lang.game.options.DAILY,
        value: this.enums.FrequencyType.DAILY
      },
      {
        text: this.lang.game.options.WEEKLY,
        value: this.enums.FrequencyType.WEEKLY
      },
      {
        text: this.lang.game.options.BIWEEKLY,
        value: this.enums.FrequencyType.BIWEEKLY
      },
      {
        text: this.lang.game.options.MONTHLY,
        value: this.enums.FrequencyType.MONTHLY
      }
    ];
    this.repeatOptionItems = [
      {
        text: this.lang.game.CLEAR_RESERVED,
        value: "clearReservedOnRepeat"
      }
    ];
    this.monthlyTypeItems = [
      {
        text: this.lang.game.options.WEEKDAY,
        value: this.enums.MonthlyType.WEEKDAY
      },
      {
        text: this.lang.game.options.DATE,
        value: this.enums.MonthlyType.DATE
      }
    ];

    setTimeout(() => {
      localStorage.removeItem("rescheduled");
    }, 5000);

    this.socket = io(this.$store.getters.env.apiUrl);
    this.socket.on("game", data => {
      if (data.gameId != this.gameId) return;
      if (data.action === "rescheduled") {
        localStorage.setItem("rescheduled", 1);
        this.$router.replace(
          `${this.$store.getters.config.urls.game.create.path}?g=${response.newGameId}`
        );
      } else if (
        data.action === "deleted" &&
        !localStorage.getItem("rescheduled")
      ) {
        alert("This game has been deleted");
        this.$router.replace(
          this.$store.getters.config.urls.game.dashboard.path
        );
      } else if (data.action === "updated") {
        for (const prop in data.game) {
          this.game[prop] = data.game[prop];
        }
      }
    });
  },
  beforeDestroy() {
    if (this.socket) this.socket.close();
  },
  methods: {
    async selectGuild() {
      if (this.guilds.length > 0) {
        if (this.game.c) {
          await this.fetchGameChannels("s", this.game.s);
        } else {
          await this.fetchGame("s", this.game.s);
        }
      }
    },
    fetchGameChannels(param, value) {
      return this.$store
        .dispatch("fetchGame", {
          param: param,
          value: value
        })
        .then(game => {
          this.game.c = game.channels[0].id;
          this.game.channel = game.channels[0].name;
        });
    },
    fetchGame(param, value) {
      return this.$store
        .dispatch("fetchGame", {
          param: param,
          value: value
        })
        .then(game => {
          const g = cloneDeep(this.game);
          this.game = cloneDeep(game);
          if (!g.c) {
            this.game.c = game.channels[0].id;
            this.game.channel = game.channels[0].name;
          }
          this.game.reservedList = this.game.reserved
            .map(r => r.tag)
            .join(`\n`);
          if (!this.gameId) {
            this.setDefaultDates();
          }
          this.dateTimeLinks();
        });
    },
    setDefaultDates() {
      this.game.date = moment().format("YYYY-MM-DD");
      this.game.time = moment().format("HH:mm");
      this.game.timezone = parseInt(moment().format("ZZ")) / 100;
    },
    deleteGame() {
      if (
        confirm(
          "Are you sure you want to delete the game? This cannot be undone."
        )
      ) {
        this.$store.dispatch("deleteGame", this.gameId).then(result => {
          if (this.$store.getters.account) {
            this.$router.replace(
              this.$store.getters.config.urls.game.dashboard.path
            );
          } else {
            this.$router.replace(
              `${this.$store.getters.config.urls.game.create.path}?s=${this.game.guildConfig.guild}`
            );
          }
        });
      }
    },
    saveCopy() {
      this.copy = true;
      this.saveGame();
    },
    save() {
      this.saveResult = 'saving';
      this.copy = false;
      this.saveGame();
    },
    saveGame() {
      const data = this.$refs.game.$data.inputs;
      const updatedGame = cloneDeep(this.game);
      data.forEach(d => {
        if (updatedGame[d.id]) updatedGame[d.id] = d.value;
      });
      if (this.copy) updatedGame.copy = true;
      updatedGame.c = updatedGame.channels.find(
        c => c.name === updatedGame.channel
      ).id;
      let reservedList = this.game.reserved.map(r => r.tag).join(`\n`);
      if (reservedList !== updatedGame.reservedList) {
        updatedGame.reserved = updatedGame.reservedList
          .split(/\r?\n/)
          .filter(r => r.trim().length > 0)
          .map(r => ({ tag: r.trim() }));
      }
      delete updatedGame.title;
      delete updatedGame.guildConfig;
      delete updatedGame.reservedList;
      delete updatedGame.errors;
      delete updatedGame.is;
      delete updatedGame.enums;
      delete updatedGame._guild;
      delete updatedGame._channel;
      delete updatedGame.channels;
      delete updatedGame.rescheduled;
      delete updatedGame.reminded;
      delete updatedGame.timestamp;
      delete updatedGame.env;
      delete updatedGame.password;
      delete updatedGame.messageId;
      delete updatedGame.reminderMessageId;
      delete updatedGame.pm;
      delete updatedGame.sequence;
      this.prevSave = updatedGame;
      this.$store
        .dispatch("saveGame", updatedGame)
        .then(result => {
          if (!this.gameId) {
            return this.$router.replace(
              `${this.config.urls.game.create.path}?g=${result._id}`
            );
          }
          this.game = cloneDeep(result.game);
          this.game.reservedList = this.game.reserved
            .map(r => r.tag)
            .join(`\n`);
          this.dateTimeLinks();
          this.saveResult = 'success';
        })
        .catch(err => {
          this.saveResult = 'error';
          console.log(err.message || err);
          alert(err.message || err);
        });
    },
    getTZUrls() {
      if (!this.game) return {};
      const date = this.game.date || "";
      const time = this.game.time || "";
      const gmtOffset = this.game.timezone || 0;
      const d = new Date(
        `${date.replace(/-/g, "/").replace(/UTC\//, "UTC-")} ${time} UTC${
          gmtOffset < 0 ? "-" : "+"
        }${Math.abs(gmtOffset)}`
      )
        .toISOString()
        .replace(/[^0-9T]/gi, "")
        .slice(0, 13);
      const name = this.game.adventure;
      const server = this.game.guild;
      const where = this.game.where;
      const description = this.game.description;

      return {
        convert: `https://timee.io/${d}`,
        gcal: `http://www.google.com/calendar/render?action=TEMPLATE&text=${escape(
          name
        )}&dates=${d}00Z/${d}00Z&location=${escape(server)}%20-%20${escape(
          where
        )}&trp=false&sprop=&details=${escape(description)}`
      };
    },
    dateTimeLinks() {
      const link = this.getTZUrls();
      this.convertLink = link.convert;
      // $("#gcalLink").html(
      //   `<a href="${link.gcal}" target="_blank" rel="nofollow"><%= lang.game.ADD_TO_CALENDAR %></a>`
      // );
      this.getRecurrenceDate();
    },
    getRecurrenceDate() {
      if (!this.game) return "";
      const baseDate = this.game.date || "";
      const frequency = this.game.frequency || 0;
      const monthlyType = this.game.monthlyType || this.enums.MonthlyType.DATE;
      if (frequency == 0) return moment(baseDate).format("YYYY-MM-DD");

      const repeatOptions = cloneDeep(this.repeatOptions);
      this.game.clearReservedOnRepeat = repeatOptions.includes(
        "clearReservedOnRepeat"
      );

      const weekdays = cloneDeep(this.weekdays);
      this.game.weekdays = Array(7).fill(false);
      const validDays = weekdays.map((day, i) => {
        this.game.weekdays[i + 1] = true;
        return moment()
          .day(day)
          .format("dddd")
          .toLowerCase();
      });
      var dateGenerator;
      var nextDate = baseDate;

      switch (frequency) {
        case "1": // daily
          nextDate = moment(baseDate).add(1, "days");
          break;
        case "2": // weekly
          if (validDays.length === 0) break;
          console.log(validDays);
          dateGenerator = moment(baseDate)
            .recur()
            .every(validDays)
            .daysOfWeek();
          nextDate = dateGenerator.next(1)[0];
          break;
        case "3": // biweekly
          if (validDays.length === 0) break;
          // this is a compound interval...
          dateGenerator = moment(baseDate)
            .recur()
            .every(validDays)
            .daysOfWeek();
          nextDate = dateGenerator.next(1)[0];
          while (nextDate.week() - moment(baseDate).week() == 1) {
            // if the next date is in the same week, diff = 0. if it is just next week, diff = 1, so keep going forward.
            dateGenerator = moment(nextDate)
              .recur()
              .every(validDays)
              .daysOfWeek();
            nextDate = dateGenerator.next(1)[0];
          }
          break;
        case "4": // monthly
          if (monthlyType == this.enums.MonthlyType.DATE) {
            nextDate = moment(baseDate).add(1, "month");

            // describe date option
            this.monthlyWeekdayDesc = this.lang.game.labels.MONTHLY_DATE;
          } else if (monthlyType == this.enums.MonthlyType.WEEKDAY) {
            const weekOfMonth = moment(baseDate).monthWeekByDay();
            const validDay = moment(baseDate).day();
            dateGenerator = moment(baseDate)
              .recur()
              .every(validDay)
              .daysOfWeek()
              .every(weekOfMonth)
              .weeksOfMonthByDay();
            nextDate = dateGenerator.next(1)[0];

            // describe weekday option
            const description = this.lang.game.labels.MONTHLY_WEEKDAY;
            const weekday = moment(baseDate).format("dddd");
            let wom = weekOfMonth + 1;
            if (wom == 1) wom += "st";
            else if (wom == 2) wom += "nd";
            else if (wom == 3) wom += "rd";
            else wom += "th";
            this.monthlyWeekdayDesc = description
              .replace(":XTH", wom)
              .replace(":WEEKDAY", weekday);
          }
      }

      this.nextDate = moment(nextDate).format("ll");
    }
  }
};
</script>

<style>
.v-select.v-select--chips .v-input__slot {
  height: 32px !important;
}
.v-chip.v-size--default {
  height: 24px !important;
}
</style>