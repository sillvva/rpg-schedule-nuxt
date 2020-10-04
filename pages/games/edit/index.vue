<template>
  <v-app v-if="!gameLoaded">
    <v-flex class="d-flex" justify-center align-center style="height: 100%;">
      <v-progress-circular :size="100" :width="7" color="discord" indeterminate></v-progress-circular>
    </v-flex>
  </v-app>
  <v-container fluid v-else>
    <v-row dense>
      <v-spacer></v-spacer>
      <v-col cols="12" xl="8" class="py-0">
        <v-form v-if="game" ref="game" v-model="valid">
          <v-card>
            <v-toolbar color="discord">
              <v-toolbar-title v-if="guildId || !gameId">{{lang.buttons.NEW_GAME}}</v-toolbar-title>
              <v-toolbar-title v-if="gameId">{{lang.buttons.EDIT_GAME}}</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              * Required
              <v-row dense>
                <v-col cols="12" lg="7" class="py-0">
                  <v-row dense>
                    <v-col cols="12" sm="4" class="py-0">
                      <v-select
                        id="guild"
                        :label="`${lang.game.SERVER}*`"
                        v-model="game.s"
                        :rules="[v => !!v]"
                        :items="guilds.filter(c => !gameId || c.value === game.s)"
                        @change="selectGuild"
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="4"
                      class="py-0"
                      v-if="channels && channels.length > 0 && guilds.filter(c => !gameId || c.value === game.s).length > 0"
                    >
                      <v-select
                        :label="`${lang.game.CHANNEL}*`"
                        id="channel"
                        v-model="game.c"
                        :rules="[v => !!v]"
                        :items="channels.map(c => ({ text: c.name, value: c.id })).filter(c => !gameId || c.value === game.c)"
                        @change="selectChannel"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4" class="py-0" v-if="guild">
                      <v-select
                        :label="`${lang.config.TEMPLATE_CONFIGURATION}*`"
                        id="template"
                        v-model="game.template"
                        :rules="[v => !!v]"
                        :items="guild.config.gameTemplates.filter(gt => gt && ($route.query.g || guild.isAdmin || !gt.role || guild.userRoles.includes(isObject(gt.role) ? gt.role.name : gt.role)) && guild.config.channel.find(c => c.channelId === game.c) && guild.config.channel.find(c => c.channelId === game.c).gameTemplates.includes(gt.id)).map(gt => ({ text: gt.name, value: gt.id }))"
                        @change="selectTemplate"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" class="py-0">
                      <v-text-field
                        id="adventure"
                        :label="`${lang.game.GAME_NAME}*`"
                        v-model="game.adventure"
                        :rules="[v => !!v]"
                        @change="changed"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" class="py-0">
                      <v-text-field
                        id="dm"
                        :label="`${lang.game.GM}*`"
                        v-model="game.dmTag"
                        :rules="[v => !!v]"
                        @change="changed"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3" class="py-0">
                      <v-text-field
                        id="runtime"
                        :label="lang.game.RUN_TIME"
                        v-model="game.runtime"
                        type="text"
                        :suffix="lang.game.labels.HOURS"
                        @change="changed"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3" class="py-0">
                      <v-text-field
                        id="minPlayers"
                        :label="`${lang.game.MIN_PLAYERS}*`"
                        v-model="game.minPlayers"
                        type="number"
                        min="1"
                        :max="game.players"
                        :rules="[v => parseInt(v) >= 1 && parseInt(v) <= game.players]"
                        @change="changed"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3" class="py-0">
                      <v-text-field
                        id="players"
                        :label="`${lang.game.MAX_PLAYERS}*`"
                        v-model="game.players"
                        type="number"
                        :min="game.minPlayers"
                        :rules="[v => parseInt(v) >= game.minPlayers]"
                        @change="changed"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" class="py-0">
                      <v-text-field
                        id="where"
                        :label="`${lang.game.WHERE}*`"
                        v-model="game.where"
                        :rules="[v => !!v]"
                        @change="changed"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" :sm="guildId || !gameId ? 3 : 6" class="py-0">
                      <v-select
                        id="when"
                        :label="lang.game.WHEN"
                        v-model="game.when"
                        :items="whenItems"
                        @change="whenSelected"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="3" v-if="guildId || !gameId" class="py-0">
                      <v-select
                        id="method"
                        :label="lang.game.SIGN_UP_METHOD"
                        v-model="game.method"
                        :items="methodItems"
                        @change="changed"
                      ></v-select>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                    >
                      <v-dialog
                        ref="dateDialog"
                        v-model="dateMenu"
                        :return-value.sync="game.date"
                        persistent
                        width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            id="date"
                            type="date"
                            :label="`${lang.game.DATE}*`"
                            v-model="game.date"
                            @change="dateTimeLinks"
                            :hint="nextDate && `Next: ${nextDate}`"
                            ref="gameDate"
                            prepend-inner-icon="mdi-calendar"
                            persistent-hint
                            @click:prepend-inner="dateMenu = true"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="game.date" :locale="lang.code">
                          <v-spacer></v-spacer>
                          <v-btn text color="primary" @click="dateMenu = false">Cancel</v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.dateDialog.save(game.date); isChanged = true;"
                          >OK</v-btn>
                        </v-date-picker>
                      </v-dialog>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                    >
                      <v-dialog
                        ref="timeDialog"
                        v-model="timeMenu"
                        :return-value.sync="game.time"
                        persistent
                        width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            id="time"
                            type="time"
                            :label="`${lang.game.TIME}*`"
                            v-model="game.time"
                            @change="dateTimeLinks"
                            prepend-inner-icon="mdi-clock"
                            @click:prepend-inner="timeMenu = true"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                          ampm-in-title
                          v-model="game.time"
                          scrollable
                          :format="/ (AM|PM)/i.test(new Date().toLocaleString()) ? 'ampm' : '24hr'"
                        >
                          <v-spacer></v-spacer>
                          <v-btn text color="primary" @click="timeMenu = false">Cancel</v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.timeDialog.save(game.time); isChanged = true;"
                          >OK</v-btn>
                        </v-time-picker>
                      </v-dialog>
                    </v-col>
                    <v-col
                      cols="6"
                      sm="3"
                      v-if="game.when === enums.GameWhen.DATETIME"
                      class="py-0"
                      style="position: relative;"
                    >
                      <!-- <v-text-field
                        id="timezone"
                        type="number"
                        :label="lang.game.TIME_ZONE"
                        v-model="game.timezone"
                        min="-12"
                        max="14"
                        step="0.25"
                        prefix="UTC"
                        @change="dateTimeLinks"
                        @keyup="dateTimeLinks"
                      ></v-text-field>-->
                      <v-autocomplete
                        ref="timezone"
                        id="timezone"
                        :label="`${lang.game.TIME_ZONE}*`"
                        :rules="[() => game.tz !== '' && game.tz !== null]"
                        v-model="game.tz"
                        :items="tzItems"
                        @change="dateTimeLinks"
                        @keyup="dateTimeLinks"
                        style="font-size: smaller;"
                      ></v-autocomplete>
                      <small :style="`${hintStyle}; white-space: nowrap;`">
                        {{moment(`${game.date} ${game.time}`).tz(game.tz) ? moment(`${game.date} ${game.time}`).tz(game.tz).format('z (Z)') : ""}}
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
                        class="reminder"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" lg="5" class="py-0">
                  <v-row dense class="game-textareas">
                    <v-col cols="12" class="py-0">
                      <v-textarea
                        rows="11"
                        :label="lang.game.RESERVED"
                        v-model="reservedList"
                        no-resize
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-expansion-panels
                multiple
                :value="panels.filter(p => p.value !== null).map(p => p.value)"
                class="mt-4"
                accordion
              >
                <v-expansion-panel @change="panel(0)">
                  <v-expansion-panel-header color="grey darken-3">{{lang.game.DESCRIPTION_PANEL}}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-textarea
                          rows="7"
                          id="customSignup"
                          :label="lang.game.CUSTOM_SIGNUP_INSTRUCTIONS"
                          v-model="game.customSignup"
                          :hint="game.method === enums.GameMethod.CUSTOM ? '' : lang.game.SIGNUP_INSTRUCTIONS_DESC"
                          :rules="[v => game.method === 'automated' || !!v]"
                          persistent-hint
                          auto-grow
                          no-resize
                          maxlength="1500"
                          counter="1500"
                          @change="changed"
                        ></v-textarea>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-textarea
                          rows="7"
                          :label="lang.game.DESCRIPTION"
                          v-model="game.description"
                          :maxlength="1500 - (game.method === enums.GameMethod.CUSTOM ? game.customSignup.length : 0)"
                          auto-grow
                          :counter="1500 - (game.method === enums.GameMethod.CUSTOM ? game.customSignup.length : 0)"
                          @change="changed"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel @change="panel(1)">
                  <v-expansion-panel-header color="grey darken-3">{{lang.game.RESCHEDULING_PANEL}}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row>
                      <v-col
                        cols="12"
                        :sm="['2','3','4'].includes(game.frequency) ? game.frequency == '3' ? 4 : 6 : 12"
                        v-if="game.when === enums.GameWhen.DATETIME"
                      >
                        <v-select
                          id="frequency"
                          :label="lang.game.FREQUENCY"
                          v-model="game.frequency"
                          :items="frequencyItems"
                          @change="dateTimeLinks"
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        v-if="['3'].includes(game.frequency) && game.when === enums.GameWhen.DATETIME"
                        class="py-0"
                      >
                        <v-select
                          v-model="game.xWeeks"
                          :items="[1,2,3,4]"
                          :label="frequencyItems[3] && frequencyItems[3].text"
                          @change="dateTimeLinks"
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        :sm="game.frequency == '3' ? 4 : 6"
                        v-if="['2','3'].includes(game.frequency) && game.when === enums.GameWhen.DATETIME"
                      >
                        <v-select
                          v-model="weekdays"
                          :items="weekdayItems"
                          attach
                          chips
                          :label="lang.game.WEEKDAYS"
                          multiple
                          @change="dateTimeLinks"
                          class="fixed-size"
                        >
                          <template v-slot:selection="{ item, index }">
                            <v-chip v-if="index < 2">
                              <span>{{ item.text }}</span>
                            </v-chip>
                            <span
                              v-if="index === 2"
                              class="grey--text caption"
                            >(+{{ weekdays.length - 2 }} others)</span>
                          </template>
                        </v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                        v-if="['4'].includes(game.frequency) && game.when === enums.GameWhen.DATETIME"
                        class="py-0"
                      >
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
                      <v-col
                        cols="12"
                        v-if="game.frequency != 0 && game.when === enums.GameWhen.DATETIME"
                        class="py-0"
                      >
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
                  </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel @change="panel(2)">
                  <v-expansion-panel-header color="grey darken-3">{{lang.game.EXTRA_PANEL}}</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row>
                      <v-col cols="12">
                        <v-select
                          v-model="gameOptions"
                          :items="gameOptionItems"
                          :label="lang.game.GAME_OPTIONS"
                          multiple
                          chips
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-file-input
                      id="gameImageUpload"
                      ref="gameImageUpload"
                      type="file"
                      accept="image/jpeg, image/png, image/gif, image/webp"
                      @change="uploadToImgur"
                      v-model="uploadModel"
                      class="d-none"
                    ></v-file-input>
                    <v-row dense>
                      <v-col :cols="guildConfig && guildConfig.embeds ? 6 : 12" class="py-0">
                        <v-text-field
                          id="gameImage"
                          :label="lang.game.GAME_IMAGE"
                          v-model="game.gameImage"
                          append-icon="mdi-upload"
                          @click:append="uploadButton(lang.game.GAME_IMAGE)"
                          @change="changed"
                          :hint="lang.game.MAX_UPLOAD_SIZE"
                          persistent-hint
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6" class="py-0" v-if="guildConfig && guildConfig.embeds">
                        <v-text-field
                          id="thumbnail"
                          :label="lang.game.THUMBNAIL"
                          v-model="game.thumbnail"
                          append-icon="mdi-upload"
                          @click:append="uploadButton(lang.game.THUMBNAIL)"
                          @change="changed"
                          :hint="lang.game.MAX_UPLOAD_SIZE"
                          persistent-hint
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
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
                        :disabled="saveResult == 'saving' || saveResult == 'success' || !valid || game.pruned"
                      >
                        <v-progress-circular
                          indeterminate
                          color="white"
                          v-if="saveResult == 'saving'"
                        ></v-progress-circular>
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
                        :disabled="saveResult == 'saving' || !valid || game.pruned"
                      >
                        <v-progress-circular
                          indeterminate
                          color="white"
                          v-if="saveResult == 'saving'"
                        ></v-progress-circular>
                        <span v-if="saveResult != 'saving'">{{lang.buttons.SAVE}}</span>
                      </v-btn>
                    </v-col>
                    <v-col cols="12" class="py-md-0 col-md">
                      <v-btn
                        @click="saveCopy"
                        :disabled="saveResult == 'saving' || !valid"
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
import { parseEventTimes, isObject } from "../../../assets/auxjs/appaux";
import config from "../../../assets/auxjs/config";
import lang from "../../../assets/lang/en.json";
import ws from "../../../store/socket";
import { cloneDeep } from "lodash";
import moment from "moment-timezone";
import "moment-recur";

export default {
  middleware: ["authenticated"],
  head: {
    title: "Edit Game",
  },
  data() {
    return {
      componentKey: this.$route.query.g || this.$route.query.s,
      config: this.$store.getters.config,
      enums: this.$store.getters.enums,
      gameId: this.$route.query.g,
      guildId: this.$route.query.s,
      env: this.$store.getters.env,
      guildConfig: {},
      account: null,
      reservedList: "",
      guilds: [],
      guild: null,
      game: {},
      channel: "",
      channels: [],
      copy: false,
      convertLink: "",
      monthlyWeekdayDesc: "",
      dateMenu: false,
      timeMenu: false,
      nextDate: "",
      weekdays: [],
      repeatOptions: [],
      gameOptions: [],
      lang: lang,
      whenItems: [],
      methodItems: [],
      reminderItems: [],
      frequencyItems: [],
      repeatOptionItems: [],
      gameOptionItems: [],
      monthlyTypeItems: [],
      weekdayItems: [],
      tzItems: moment.tz
        .names()
        .filter((tz) => !tz.startsWith("Etc/") && !tz.startsWith("GMT")),
      hintStyle:
        "color: rgba(255,255,255,0.7); font-size: 12px; min-height: 14px; position: absolute; bottom: 0;",
      socket: null,
      saveResult: null,
      prevSave: null,
      valid: true,
      isChanged: false,
      lastGuildSelected: null,
      gameLoaded: false,
      imageUploading: false,
      imageSelection: lang.game.GAME_IMAGE,
      uploadModel: null,
      panels: [
        { name: "description", value: null },
        { name: "rescheduling", value: null },
        { name: "extra", value: null },
      ],
    };
  },
  computed: {
    lastListingPage() {
      return this.$store.getters.lastListingPage;
    },
    storeLang() {
      return this.$store.getters.lang;
    },
    storeAccount() {
      return this.$store.getters.account;
    },
    storeSocketData() {
      return this.$store.getters.socketData;
    },
  },
  watchQuery: ["s", "c"],
  watch: {
    storeLang: {
      handler: function (newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
        this.whenItems = [
          {
            text: this.lang.game.options.DATE_TIME,
            value: this.enums.GameWhen.DATETIME,
          },
          { text: this.lang.game.options.NOW, value: this.enums.GameWhen.NOW },
        ];
        this.methodItems = [
          {
            text: this.lang.game.options.AUTOMATED_SIGNUP,
            value: this.enums.GameMethod.AUTOMATED,
          },
          {
            text: this.lang.game.options.CUSTOM_SIGNUP_INSTRUCTIONS,
            value: this.enums.GameMethod.CUSTOM,
          },
        ];
      },
      immediate: true,
    },
    storeAccount: {
      handler: async function (newVal) {
        this.account = newVal;
        if (newVal) {
          if (!this.gameLoaded) {
            const guilds = cloneDeep(this.account.guilds);
            guilds.sort((a, b) =>
              a.config.password || a.id == "532564186023329792" ? 1 : -1
            );
            this.guilds = guilds
              .filter(
                (guild) =>
                  (guild.permission || guild.isAdmin) &&
                  guild.announcementChannels.length > 0
              )
              .map((g) => ({ text: g.name, value: g.id }));
          }
          if (this.guilds.length > 0 && !this.game.s) {
            this.game.s = this.guilds[0].id;
          }
          if (this.guilds.length === 0 && !this.gameId) {
            this.$router.replace(`/games/${this.lastListingPage || 'my-games'}`);
          }
        }
      },
      immediate: true,
    },
    storeSocketData: {
      handler: function (socket) {
        const data = socket.data;
        if (!this.gameId) return;
        if (socket.type === "game") {
          if (data.gameId != this.gameId) return;
          if (data.action === "rescheduled") {
            this.isChanged = false;
            localStorage.setItem("rescheduled", 1);
            this.$store.dispatch("addSnackBar", {
              message: this.lang.other.RESCHEDULED,
              color: "info",
            });
            this.$router.replace(
              `${this.$store.getters.config.urls.game.create.path}?g=${data.newGameId}`
            );
          } else if (data.action === "pruned") {
            this.game.pruned = true;
          } else if (
            data.action === "deleted" &&
            !localStorage.getItem("rescheduled")
          ) {
            this.isChanged = false;
            localStorage.setItem("rescheduled", 1);
            this.$store.dispatch("addSnackBar", {
              message: this.lang.other.DELETED,
              color: "error darken-1",
            });
            this.$router.replace(
              `/games/${this.lastListingPage || "my-games"}`
            );
          } else if (data.action === "updated") {
            for (const prop in data.game) {
              this.game[prop] = data.game[prop];
              if (prop === "reserved") {
                this.reservedList = this.game.reserved
                  .map((r) => r.tag)
                  .join(`\n`);
              }
            }
          }
        }
      },
    },
  },
  async mounted() {
    setTimeout(() => {
      localStorage.removeItem("rescheduled");
    }, 5000);

    this.updateSelectItems();

    this.gameLoaded = false;
    window.addEventListener("beforeunload", this.verifyUnload);

    if (!this.account) {
      await this.$store.dispatch("fetchGuilds", {
        app: this,
        page: "manage-server",
      });
    }

    if (!this.account) {
      await this.$store.dispatch("signOut");
      return this.$router.replace("/");
    }

    const guilds = cloneDeep(this.account.guilds);
    guilds.sort((a, b) =>
      a.config.password || a.id == "532564186023329792" ? 1 : -1
    );

    if (this.gameId) {
      const guild = guilds.find((g) =>
        g.games.find((gm) => gm._id === this.gameId)
      );
      const game = guild && guild.games.find((g) => g._id === this.gameId);
      if (game) {
        game.guildConfig = guild.config;
        this.finishFetchGame(game);
        this.gameLoaded = true;
      }
    }

    if (!this.gameLoaded || this.$route.query.fetch === "true") {
      if (this.gameId) await this.fetchGame("g", this.gameId);
      else if (this.guildId) await this.fetchGame("s", this.guildId);
      else {
        const guild =
          guilds.find((g) => g.id === (this.guildId || this.game.s)) ||
          guilds[0];

        let data = {
          s: guild.id,
          c: guild.announcementChannels[0] && guild.announcementChannels[0].id,
          channels: guild.announcementChannels.map((ac) => ({
            name: ac.name,
            id: ac.id,
          })),
          dm: this.account.user.tag,
          adventure: "",
          runtime: "",
          where: "",
          reserved: "",
          description: "",
          method: "automated",
          customSignup: "",
          when: "datetime",
          timezone: "",
          hideDate: false,
          gameImage: "",
          frequency: "0",
          monthlyType: "weekday",
          weekdays: [false, false, false, false, false, false, false],
          xWeeks: 2,
          clearReservedOnRepeat: false,
        };

        this.game.s = guild.id;
        this.finishFetchGame(data);
      }
    }

    const guild = this.account.guilds.find((g) => g.id === this.game.s);
    if (
      this.gameId &&
      (!guild ||
        (this.game.dm.id !== this.account.user.id &&
          this.game.dm.tag !== this.account.user.tag &&
          !guild.isAdmin &&
          this.account.user.tag !== config.author))
    ) {
      this.isChanged = false;
      this.$router.replace(`/games/${this.lastListingPage || 'my-games'}`);
      this.$store.dispatch("addSnackBar", {
        message: this.lang.other.EDIT_PERMISSION,
        color: "error",
        timeout: 10,
      });
      return;
    }

    this.selectGuild();
    this.panels = cloneDeep(this.panels).map((p) => {
      if (p.name === "description")
        p.value =
          this.game.description.trim().length ||
          this.game.customSignup.trim().length ||
          !this.gameId
            ? 0
            : null;
      if (p.name === "rescheduling")
        p.value = this.game.frequency > 0 ? 1 : null;
      if (p.name === "extra")
        p.value =
          (this.gameOptions || []).length > 0 ||
          this.game.gameImage.length > 0 ||
          (this.game.thumbnail && this.game.thumbnail.length > 0)
            ? 2
            : null;
      return p;
    });
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.verifyUnload);
  },
  beforeRouteLeave(to, from, next) {
    if (this.verifyUnload()) {
      next();
    } else if (!this.isChanged) {
      next();
    }
  },
  methods: {
    verifyUnload() {
      if (this.isChanged && !confirm(this.lang.game.UNSAVED)) {
        return false;
      }
      return true;
    },
    async selectGuild(event) {
      const guilds = this.account.guilds;
      const guild = guilds.find((g) => g.id === this.game.s);
      this.guildConfig = guild.config;
      if (guild.config.password && guild.config.password.length > 0) {
        const pass = prompt("Password?", "");
        if (pass !== guild.config.password) {
          const nonPass = guilds.find((g) => !g.config.password);
          if (nonPass) {
            setTimeout(() => {
              this.game.s =
                this.lastGuildSelected != this.game.s
                  ? this.lastGuildSelected
                  : nonPass.id;
              this.selectGuild();
            }, 100);
            return;
          } else
            return this.$router.replace(this.config.urls.game.dashboard.path);
        }
      }
      this.modGame(this.game, !!event);
      if (event) this.changed();
      if (this.guilds.length > 0 && this.lastGuildSelected != this.game.s) {
        this.lastGuildSelected = this.game.s;
        await this.fetchGameChannels();
        this.selectTemplate(!!event);
      }
    },
    selectChannel(event) {
      this.changed();
      this.selectTemplate(event);
      this.modGame(this.game, !!event);
    },
    selectTemplate(event) {
      if (this.guild && !this.gameId && this.game) {
        const templates = this.guild.config.gameTemplates.filter(
          (gt) =>
            gt &&
            (this.gameId ||
              this.guild.isAdmin ||
              !gt.role ||
              this.guild.userRoles.includes(
                isObject(gt.role) ? gt.role.name : gt.role
              )) &&
            this.guild.config.channel.find(
              (c) => c.channelId === this.game.c
            ) &&
            this.guild.config.channel
              .find((c) => c.channelId === this.game.c)
              .gameTemplates.includes(gt.id)
        );
        const template = templates.find((t) => t.id === this.game.template);
        if (template && event) {
          this.game.minPlayers = template.gameDefaults.minPlayers;
          this.game.players = template.gameDefaults.maxPlayers;
          this.game.reminder = template.gameDefaults.reminder;
        } else if (templates.length > 0) {
          this.game.template = templates[0].id;
          this.selectTemplate(true);
        }
      }
      this.changed();
      this.modGame(this.game);
    },
    changed() {
      this.isChanged = true;
    },
    fetchGameChannels() {
      if (this.account) {
        const guild = this.account.guilds.find((g) => g.id === this.game.s);
        const channel = guild && guild.announcementChannels[this.gameId ? guild.announcementChannels.findIndex(ac => ac.id === this.game.c) : 0];
        if (channel) {
          this.game.c = channel.id;
          this.game.channel = channel.name;
        }
      }
    },
    async fetchGame(param, value) {
      console.log(1);
      return await this.$store
        .dispatch("fetchGame", {
          param: param,
          value: value,
          app: this,
        })
        .then((game) => {
          this.finishFetchGame(game);
        });
    },
    finishFetchGame(game) {
      const account = cloneDeep(this.account);
      const guild = account.guilds.find((g) => g.id === game.s);

      if (this.gameId) {
        if (guild && !guild.games.find((g) => g._id === this.gameId)) {
          game.moment = parseEventTimes(game);
          game.reserved = game.reserved.filter((r) => r.tag);
          game.slot =
            game.reserved.findIndex(
              (t) =>
                t.tag.replace("@", "") === account.user.tag ||
                t.id === account.user.id
            ) + 1;
          game.signedup = game.slot > 0 && game.slot <= parseInt(game.players);
          game.waitlisted = game.slot > parseInt(game.players);

          guild.games.push(cloneDeep(game));
          guild.games.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
          if (["my-games", "upcoming"].includes(this.lastListingPage)) {
            account.guilds.sort((a, b) => {
              if (a.games.length === 0 && b.games.length === 0)
                return a.name < b.name ? -1 : 1;
              if (a.games.length === 0) return 1;
              if (b.games.length === 0) return -1;

              return a.games[0].timestamp < b.games[0].timestamp ? -1 : 1;
            });
          }
          this.$store.commit("setGuilds", account.guilds);
        }
      }

      this.gameOptions = [];
      if (game.pastSignups) this.gameOptions.push("pastSignups");
      if (game.hideDate) this.gameOptions.push("hideDate");
      if (game.disableWaitlist) this.gameOptions.push("disableWaitlist");

      this.modGame(cloneDeep(game));

      this.gameLoaded = true;
      setTimeout(() => {
        this.isChanged = false;
      }, 500);

      if (this.game && this.game.guildConfig) {
        if (
          this.game.guildConfig.password &&
          this.game.guildConfig.password.length > 0
        ) {
          const pass = prompt("Password?", "");
          if (pass !== this.game.guildConfig.password) {
            this.isChanged = false;
            return this.$router.replace(`/games/${this.lastListingPage || 'my-games'}`);
          }
        }
      }

      if (this.gameId) {
        this.guilds = [guild].map((g) => ({ text: g.name, value: g.id }));
        const channel = guild.channels.find((c) => c.id === game.c);
        if (!channel)
          return this.$router.replace(`/games/${this.lastListingPage || 'my-games'}`);
        // this.channels = [channel];
      }
    },
    async modGame(game, force) {
      if (!this.gameId && this.gameLoaded && !force && this.game && this.game.s)
        return;
      this.game = cloneDeep(game);
      if (!this.game) return;
      if (this.$refs.game) this.$refs.game.resetValidation();
      this.repeatOptions = [];
      if (this.game.clearReservedOnRepeat)
        this.repeatOptions.push("clearReservedOnRepeat");
      if (this.game.weekdays) {
        if (!Array.isArray(this.game.weekdays)) {
          this.game.weekdays = Array(7)
            .fill(false)
            .map((w, i) => this.game.weekdays[i]);
        }
        this.weekdays = this.game.weekdays
          .map((w, i) => (w ? i : false))
          .filter((w) => w !== false);
      }
      if (this.game.dm) {
        this.game.dmTag = this.game.dm.tag;
      }
      if (this.game.channels && this.game.channels.length > 0) {
        if (!game.c) {
          this.game.c = this.game.channels[0].id;
          this.game.channel = this.game.channels[0].name;
        } else {
          const channel = this.game.channels.find((c) => c.id === game.c);
          this.game.channel = channel && channel.name;
        }
      }
      if (this.account) {
        this.guild = this.account.guilds.find((g) => g.id === game.s);
        if (this.guild) {
          this.channels = this.guild.announcementChannels;
          const templates = this.guild.config.gameTemplates.filter(
            (gt) =>
              gt &&
              (this.$route.query.g ||
                this.guild.isAdmin ||
                !gt.role ||
                this.guild.userRoles.includes(
                  isObject(gt.role) ? gt.role.name : gt.role
                )) &&
              this.guild.config.channel.find((c) => c.channelId === game.c) &&
              this.guild.config.channel
                .find((c) => c.channelId === game.c)
                .gameTemplates.includes(gt.id)
          );
          if (
            templates[0] &&
            !templates.find((t) => t.id === this.game.template)
          ) {
            this.game.template = templates[0].id;
            this.selectTemplate();
          }
        } else {
          this.channels = [];
        }
        if (!game.dm || (this.game.dm.tag || "").trim().length === 0) {
          this.game.dmTag = this.account.user.tag;
        }
      }
      this.reservedList = Array.isArray(this.game.reserved)
        ? this.game.reserved.map((r) => r.tag).join(`\n`)
        : this.game.reserved;
      if (!this.gameId) {
        this.setDefaultDates();
      }
      if (!this.game.tz) {
        this.game.tz = moment.tz.guess();
      }
      this.dateTimeLinks();
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
        this.$store
          .dispatch("deleteGame", {
            app: this,
            route: this.$route,
            gameId: this.gameId,
          })
          .then((result) => {
            if (this.$store.getters.account) {
              this.$router.replace(`/games/${this.lastListingPage || 'my-games'}`);
            } else {
              this.$router.replace(`/`);
            }
          })
          .catch(() => {});
      }
    },
    saveCopy() {
      this.copy = true;
      this.saveGame();
    },
    save() {
      this.saveResult = "saving";
      this.copy = false;
      this.saveGame();
    },
    saveGame() {
      const data = this.$refs.game.$data.inputs;
      const updatedGame = cloneDeep(this.game);
      const guild = this.account
        ? this.account.guilds.find((g) => g.id === updatedGame.s)
        : {};

      data.forEach((d) => {
        if (updatedGame[d.id]) updatedGame[d.id] = d.value;
      });

      if (!this.$refs.game.validate()) {
        return;
      }

      if (
        !(
          this.channels &&
          this.channels.length > 0 &&
          this.guilds.filter((c) => !this.gameId || c.value === this.game.s)
            .length > 0
        ) ||
        !updatedGame.s ||
        !updatedGame.c
      ) {
        this.saveResult = "error";
        this.$store.dispatch("addSnackBar", {
          message: "Invalid guild/channel selection",
          color: "error",
          timeout: 10,
        });
        return;
      }

      if (updatedGame.when !== this.enums.GameWhen.DATETIME) {
        updatedGame.frequency = "0";
      }

      updatedGame.hideDate = this.gameOptions.includes("hideDate");
      updatedGame.pastSignups = this.gameOptions.includes("pastSignups");
      updatedGame.disableWaitlist = this.gameOptions.includes(
        "disableWaitlist"
      );

      updatedGame.minPlayers = Math.abs(updatedGame.minPlayers).toString();
      updatedGame.players = Math.abs(updatedGame.players).toString();

      delete updatedGame.copy;
      if (this.copy) updatedGame.copy = true;

      updatedGame.guild = guild.name;
      updatedGame.channel = (
        guild.announcementChannels.find((c) => c.id === updatedGame.c) || {}
      ).name;

      let reservedList = (Array.isArray(this.game.reserved)
        ? this.game.reserved
        : this.game.reserved
            .split(/\r?\n/)
            .filter((r) => r.trim().length > 0)
            .map((r) => ({ tag: r.trim() }))
      ).map((r) => r.tag);

      if (
        reservedList.join(`\n`) !== this.reservedList.split(/\r?\n/).join(`\n`)
      ) {
        updatedGame.reserved = this.reservedList
          .split(/\r?\n/)
          .filter((r) => r.trim().length > 0)
          .map((r) => ({ tag: r.trim() }));
      } else if (reservedList.length === 0) {
        updatedGame.reserved = [];
      }

      if (this.$store.getters.account && !this.$route.query.g) {
        updatedGame.author = {
          tag: this.$store.getters.account.user.tag,
          id: this.$store.getters.account.user.id,
        };
      }

      if (
        this.$store.getters.account &&
        updatedGame.dmTag === this.$store.getters.account.user.tag
      ) {
        updatedGame.dm = {
          tag: updatedGame.dmTag,
          id: this.$store.getters.account.user.id,
        };
      } else {
        updatedGame.dm = {
          tag: this.game.dmTag,
        };
      }

      updatedGame.weekdays = [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ].map((w, i) => this.weekdays.includes(i));

      const offset = moment(`${updatedGame.date} ${updatedGame.time}`)
        .tz(updatedGame.tz)
        .format("Z")
        .split(":");
      const offsetVal = parseInt(offset[0]) + parseInt(`${offset[1]}/60`);
      updatedGame.timezone = offsetVal;

      delete updatedGame.title;
      delete updatedGame.guildConfig;
      delete updatedGame.errors;
      delete updatedGame.is;
      delete updatedGame.dmTag;
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
      delete updatedGame.guildAccount;
      delete updatedGame.slot;
      delete updatedGame.signedup;
      delete updatedGame.waitlisted;
      this.prevSave = updatedGame;
      this.$store
        .dispatch("saveGame", {
          gameData: updatedGame,
          app: this,
        })
        .then(async (result) => {
          if (!this.gameId || (result._id && this.gameId != result._id)) {
            const account = cloneDeep(this.account);
            account.guilds = account.guilds.map((guild) => {
              if (guild.id === this.game.s) {
                updatedGame._id = result._id;
                updatedGame.createdTimestamp = new Date().getTime();
                guild.games.push(updatedGame);
              }
              return guild;
            });
            this.$store.commit("setAccount", account);
            this.copy = false;
            return this.$router.replace(
              `${this.config.urls.game.create.path}?g=${result._id}`
            );
          }
          await this.modGame(cloneDeep(result.game));
          this.saveResult = "success";
          this.isChanged = false;
          this.copy = false;
        })
        .catch((err) => {
          this.saveResult = "error";
          this.copy = false;
          this.$store.dispatch("addSnackBar", {
            message: (err && err.message) || err || "An error occured!",
            color: "error",
            timeout: 10,
          });
        });
    },
    getTZUrls(event) {
      const dateChanged =
        typeof event == "string" && /\d{4}-\d{2}-\d{2}/.test(event);
      if (!this.game) return {};
      const date = this.game.date || "";
      const time = this.game.time || "";
      const gmtOffset = this.game.timezone || 0;
      const runtime = this.game.runtime || 0;
      const frequency = this.game.frequency || 0;
      const xWeeks = this.game.xWeeks || 2;
      const monthlyType = this.game.monthlyType || "weekday";
      const name = this.game.adventure;
      const server = this.game.guild;
      const where = this.game.where;
      const description = this.game.description;
      const googleCalExtras = [];

      try {
        const d1raw = new Date(
          `${date.replace(/-/g, "/").replace(/UTC\//, "UTC-")} ${time} UTC${
            gmtOffset < 0 ? "-" : "+"
          }${Math.abs(gmtOffset)}`
        );
        const d1 = d1raw
          .toISOString()
          .replace(/[^0-9T]/gi, "")
          .slice(0, 13);
        const d2raw = new Date(
          `${date.replace(/-/g, "/").replace(/UTC\//, "UTC-")} ${time} UTC${
            gmtOffset < 0 ? "-" : "+"
          }${Math.abs(gmtOffset)}`
        );
        d2raw.setHours(parseFloat(runtime));
        const d2 = d2raw
          .toISOString()
          .replace(/[^0-9T]/gi, "")
          .slice(0, 13);

        const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
        if (!this.game.weekdays || dateChanged)
          this.game.weekdays = Array(7).fill(false);
        const weekdays = this.game.weekdays
          .map((w, i) => w && days[i])
          .filter((w) => w);

        if (weekdays.length == 0) {
          const wd = moment(date).weekday();
          this.game.weekdays[wd] = true;
          this.weekdays = [wd];
        }

        if (frequency == 1) {
          googleCalExtras.push(`&recur=RRULE:FREQ=DAILY`);
        }
        if (frequency == 2) {
          googleCalExtras.push(
            `&recur=RRULE:FREQ=WEEKLY;BYDAY=${weekdays.join(",")}`
          );
        }
        if (frequency == 3) {
          googleCalExtras.push(
            `&recur=RRULE:FREQ=WEEKLY;INTERVAL=${
              xWeeks || 2
            };BYDAY=${weekdays.join(",")}`
          );
        }
        if (frequency == 4) {
          if (monthlyType == "date") {
            googleCalExtras.push(`&recur=RRULE:FREQ=MONTHLY`);
          } else if (monthlyType == "weekday") {
            googleCalExtras.push(
              `&recur=RRULE:FREQ=MONTHLY;BYDAY=${
                moment(date).monthWeekByDay() + 1
              }${days[d1raw.getDay()]}`
            );
          }
        }

        if (name) googleCalExtras.push(`&text=${escape(name)}`);
        if (where)
          googleCalExtras.push(`&location=${escape(`${server} - ${where}`)}`);
        if (description)
          googleCalExtras.push(`&details=${escape(description)}`);

        return {
          convert: `https://timee.io/${d1}`,
          gcal: `http://www.google.com/calendar/render?action=TEMPLATE&dates=${d1}/${d2}&trp=true${googleCalExtras.join(
            ""
          )}`,
        };
      } catch (err) {
        console.warn(err);
        return {
          convert: "",
          gcal: "",
        };
      }
    },
    dateTimeLinks(event) {
      const link = this.getTZUrls(event);
      const m = moment.tz(this.game.tz);
      if (m) {
        const offset = m.format("Z").split(":");
        const offsetVal = parseInt(offset[0]) + parseInt(`${offset[1]}/60`);
        this.game.timezone = offsetVal;
      }
      this.convertLink = link.convert;
      this.getRecurrenceDate();
      this.changed();
    },
    getRecurrenceDate() {
      if (!this.game) return "";
      const baseDate = this.game.date || "";
      const frequency = this.game.frequency || 0;
      const monthlyType = this.game.monthlyType || this.enums.MonthlyType.DATE;
      const xWeeks = this.game.xWeeks || 2;
      if (frequency == 0) return moment(baseDate).format("YYYY-MM-DD");

      const repeatOptions = cloneDeep(this.repeatOptions);
      this.game.clearReservedOnRepeat = repeatOptions.includes(
        "clearReservedOnRepeat"
      );

      const weekdays = cloneDeep(this.weekdays);
      const validDays = weekdays.map((day, i) => {
        return moment().day(day).format("dddd").toLowerCase();
      });
      var dateGenerator;
      var nextDate = baseDate;

      switch (frequency) {
        case "1": // daily
          nextDate = moment(baseDate).add(1, "days");
          break;
        case "2": // weekly
          if (validDays.length === 0) break;
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
          while (nextDate.week() - moment(baseDate).week() < xWeeks) {
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

            if (
              weekOfMonth == 4 &&
              moment(nextDate).month() != moment(baseDate).month() + 1
            ) {
              dateGenerator = moment(baseDate)
                .recur()
                .every(validDay)
                .daysOfWeek()
                .every(3)
                .weeksOfMonthByDay();
              nextDate = dateGenerator.next(1)[0];
            }

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
    },
    updateSelectItems() {
      this.reminderItems = [
        {
          text: this.lang.game.options.NO_REMINDER,
          value: "0",
        },
        {
          text: this.lang.game.options.MINUTES_15,
          value: "15",
        },
        {
          text: this.lang.game.options.MINUTES_30,
          value: "30",
        },
        {
          text: this.lang.game.options.MINUTES_60,
          value: "60",
        },
        {
          text: this.lang.game.options.HOURS_6,
          value: "360",
        },
        {
          text: this.lang.game.options.HOURS_12,
          value: "720",
        },
        {
          text: this.lang.game.options.HOURS_24,
          value: "1440",
        },
      ];
      this.weekdayItems = [
        {
          text: moment().day(0).format("ddd"),
          value: 0,
        },
        {
          text: moment().day(1).format("ddd"),
          value: 1,
        },
        {
          text: moment().day(2).format("ddd"),
          value: 2,
        },
        {
          text: moment().day(3).format("ddd"),
          value: 3,
        },
        {
          text: moment().day(4).format("ddd"),
          value: 4,
        },
        {
          text: moment().day(5).format("ddd"),
          value: 5,
        },
        {
          text: moment().day(6).format("ddd"),
          value: 6,
        },
      ];
      this.frequencyItems = [
        {
          text: this.lang.game.options.NO_REPEAT,
          value: this.enums.FrequencyType.NO_REPEAT,
        },
        {
          text: this.lang.game.options.DAILY,
          value: this.enums.FrequencyType.DAILY,
        },
        {
          text: this.lang.game.options.WEEKLY,
          value: this.enums.FrequencyType.WEEKLY,
        },
        {
          text: this.lang.game.options.BIWEEKLY,
          value: this.enums.FrequencyType.BIWEEKLY,
        },
        {
          text: this.lang.game.options.MONTHLY,
          value: this.enums.FrequencyType.MONTHLY,
        },
      ];
      this.repeatOptionItems = [
        {
          text: this.lang.game.CLEAR_RESERVED,
          value: "clearReservedOnRepeat",
        },
      ];
      this.gameOptionItems = [
        {
          text: this.lang.game.HIDE_DATE,
          value: "hideDate",
        },
        {
          text: this.lang.game.DISABLE_WAITLIST,
          value: "disableWaitlist",
        },
        {
          text: this.lang.game.PAST_SIGNUPS,
          value: "pastSignups",
        },
      ];
      this.monthlyTypeItems = [
        {
          text: this.lang.game.options.WEEKDAY,
          value: this.enums.MonthlyType.WEEKDAY,
        },
        {
          text: this.lang.game.options.DATE,
          value: this.enums.MonthlyType.DATE,
        },
      ];
    },
    whenSelected() {
      if (this.game.when === this.enums.GameWhen.NOW) {
        this.game.pastSignups = true;
      } else {
        this.game.pastSignups = false;
      }
      this.changed();
    },
    moment(inp, format, strict) {
      return moment(inp, format, strict);
    },
    uploadButton(selection) {
      this.imageSelection = selection;
      document.getElementById("gameImageUpload").click();
    },
    uploadToImgur(file) {
      if (!file) return;
      this.imageUploading = true;

      if (file.size / 1024 / 1024 > 5) {
        this.$store.dispatch("addSnackBar", {
          message: "Image must be 5 MB or less",
          color: "error",
          timeout: 10,
        });
        this.imageUploading = false;
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        return this.$axios
          .post(`${this.env.apiUrl}/api/upload-to-imgur`, {
            image: reader.result.replace(
              /data:image\/(png|jpeg|gif);base64,/,
              ""
            ),
          })
          .then((result) => {
            this.imageUploading = false;
            return result.data;
          })
          .then((data) => {
            this.uploadModel = null;
            if (data.link) {
              this.game[
                this.imageSelection === this.lang.game.GAME_IMAGE
                  ? "gameImage"
                  : "thumbnail"
              ] = data.link;
            } else if (data.error) {
              this.$store.dispatch("addSnackBar", {
                message: data.error,
                color: "error",
                timeout: 10,
              });
            } else {
              this.$store.dispatch("addSnackBar", {
                message: "Invalid file",
                color: "error",
                timeout: 10,
              });
            }
          })
          .catch((err) => {
            this.imageUploading = false;
          });
      };

      reader.readAsDataURL(file);
    },
    panel(type) {
      this.panels = this.panels.map((p, i) => {
        if (i === type) {
          if (p.value !== null) {
            p.value = null;
          } else {
            p.value = i;
          }
        }
        return p;
      });
    },
    isObject(value) {
      return isObject(value);
    }
  },
};
</script>

<style>
.v-select.fixed-size.v-select--chips .v-input__slot {
  height: 32px !important;
}
.v-chip.v-size--default {
  height: 24px !important;
}
.v-application .accent--text {
  color: white !important;
}
.game-textareas textarea {
  min-height: 196px;
}
.reminder .v-text-field__details {
  display: none;
}
.v-expansion-panel--active > .v-expansion-panel-header {
  min-height: 48px;
}
</style>