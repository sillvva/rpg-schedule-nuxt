<template>
  <v-dialog v-model="cardDialog" scrollable max-width="500px">
    <template v-slot:activator="{ on }">
      <v-card v-on="on" color="grey darken-3" max-width="100%" height="100%">
        <div class="ribbon" v-if="new Date().getTime() - game.createdTimestamp < 24 * 3600 * 1000"><span>NEW</span></div>
        <v-card-title class="subtitle-1">
          <div class="game-title">{{game && game.adventure}}</div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="position: relative;">
          <v-btn
            @click.stop="rsvpGameId = game._id; rsvp();"
            v-if="!edit && game && account && !checkRSVP(game.dm, account.user) && game.method === 'automated' && game.slot === 0"
            :title="lang.buttons.SIGN_UP"
            color="green"
            fab
            x-small
            absolute
            top
            right
          >
            <v-icon>mdi-thumb-up</v-icon>
          </v-btn>
          <v-btn
            @click.stop="rsvpGameId = game._id; rsvp();"
            v-if="!edit && game && account && !checkRSVP(game.dm, account.user) && game.method === 'automated' && game.slot > 0"
            :title="lang.buttons.DROP_OUT"
            color="red"
            fab
            x-small
            absolute
            top
            right
          >
            <v-icon>mdi-thumb-down</v-icon>
          </v-btn>
          <v-btn
            :to="`${config.urls.game.create.path}?g=${game._id}`"
            v-if="edit || (game && account && checkRSVP(game.dm, account.user))"
            color="info"
            @click.stop
            fab
            x-small
            absolute
            top
            right
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-row dense>
            <v-col
              v-for="(col, c) in columns"
              :key="c"
              cols="12"
              :sm="numColumns === 2 ? (c === 0 ? 7 : 5) : 12"
              :class="`${col.class} py-0`"
            >
              <p v-for="(item, i) in col.items" :key="i" class="my-0">
                <strong v-if="item.label">{{item.label}}:</strong>
                <a
                  v-if="item.href"
                  :href="item.href"
                  :class="item.class"
                  :target="item.target"
                  rel="nofollow"
                  @click.stop
                  v-html="item.html || item.value"
                ></a>
                <span v-if="!item.href" v-html="item.html || item.value" :class="item.class"></span>
                <span
                  v-if="item.secondHTML || item.secondValue"
                  v-html="item.secondHTML || item.secondValue"
                  :class="item.secondClass"
                ></span>
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <v-card>
      <v-card-title>
        <span>{{game && game.adventure}}</span>
        <v-spacer></v-spacer>
        <v-btn fab small text @click="cardDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text
        v-if="game"
        class="pt-3"
        style="height: 90vh; max-height: 500px;"
        v-html="mdParse(`
        **${lang.game.DATE}:** ${game.hideDate ? this.lang.game.labesl.TBD : game.moment.date}
        **${lang.game.RUN_TIME}:** ${game.runtime} ${lang.game.labels.HOURS}
        **${lang.game.WHERE}:** ${game.where}
        ${game.description.trim().length > 0 ? `**${lang.game.DESCRIPTION}:**
        ${game.description}` : ''}
        `)"
      ></v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { Remarkable } from "remarkable";
import { cloneDeep } from "lodash";
import { checkRSVP } from "../assets/auxjs/appaux";

export default {
  props: ["gameData", "numColumns", "filter", "exclude", "edit"],
  data() {
    return {
      game: this.gameData,
      config: this.$store.getters.config,
      account: this.$store.getters.account || {},
      lang: this.$store.getters.lang || {},
      parseDateInterval: null,
      columns: [],
      cardDialog: false,
      md: new Remarkable()
    };
  },
  computed: {
    storeAccount() {
      return this.$store.getters.account;
    },
    storeLang() {
      return this.$store.getters.lang;
    }
  },
  watch: {
    storeAccount: {
      handler: function(newVal) {
        this.account = newVal;
        this.populateColumns();
      },
      immediate: true
    },
    storeLang: {
      handler: function(newVal) {
        if (newVal && newVal.nav) this.lang = newVal;
        setTimeout(() => {
          this.parseDates();
          this.populateColumns();
        }, 500);
      },
      immediate: true
    },
    gameData: {
      handler: function(newVal) {
        this.game = cloneDeep(newVal);
        this.populateColumns();
      },
      immediate: true
    }
  },
  created() {
    this.populateColumns();
    this.parseDateInterval = setInterval(() => {
      this.parseDates();
    }, 30 * 1000);
  },
  onDestroy() {
    clearInterval(this.parseDateInterval);
  },
  methods: {
    parseURL(string) {
      const exp = /((https?:\/\/)(www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b)([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
      const regex = new RegExp(exp);
      return string.replace(
        regex,
        `<a href="$1" target="_blank" class="discord--text" onclick="event.stopPropagation();">$4</a>`
      );
    },
    rsvp() {
      this.$store.dispatch("rsvpGame", {
        gameId: this.rsvpGameId,
        route: this.$route,
        app: this
      });
    },
    populateColumns() {
      const game = cloneDeep(this.game);
      let items = [];
      if (game && game.adventure) {
        this.parseDates();
        if (game.dm.tag)
          items.push({
            id: "gm",
            label: this.lang.game.GM,
            value: game.dm.tag.split("#")[0]
          });
        items.push({
          id: "where",
          label: this.lang.game.WHERE,
          html: this.parseURL(game.where)
        });
        items.push({
          id: "server",
          label: this.lang.game.SERVER,
          value: game.guildAccount.name
        });
        if (game.hideDate) {
          items.push({
            id: "when",
            label: this.lang.game.WHEN,
            class: game.moment.state,
            value: this.lang.game.labesl.TBD
          });
        } else {
          const tdiff = game.timestamp - moment().valueOf();
          items.push({
            id: "when",
            label: this.lang.game.WHEN,
            class: [game.moment.state, "nowrap"].filter(c => c).join(" "),
            value: [
              game.moment.calendar,
              tdiff > 0 && tdiff / 86400000 >= 6.5 && `(${game.moment.from})`
            ]
              .filter(c => c)
              .join(" ")
          });
          items.push({
            id: "calendar",
            href: game.moment.googleCal,
            target: "_blank",
            class: "discord--text hidden-xs-only",
            value: this.lang.buttons.ADD_TO_GOOGLE_CALENDAR
          });
        }
        items.push({
          id: "reserved",
          label: this.lang.game.RESERVED,
          value: `${Math.min(game.reserved.length, parseInt(game.players))}/${
            game.players
          }`,
          secondValue: game.signedUp
            ? `(${this.lang.game.SLOT} #${game.slot})`
            : null
        });
        items.push({
          id: "waitlisted",
          label: this.lang.game.WAITLISTED,
          value:
            game.reserved.length -
            Math.min(game.reserved.length, parseInt(game.players)),
          secondValue: game.waitlisted
            ? `(${this.lang.game.SLOT} #${game.slot})`
            : null
        });
      }

      if (Array.isArray(this.filter)) {
        items = items.filter(i => this.filter.includes(i.id));
      }

      if (Array.isArray(this.exclude)) {
        items = items.filter(i => !this.exclude.includes(i.id));
      }

      this.columns = [];
      if (this.numColumns === 1) {
        this.columns.push({
          items: items
        });
      } else if (this.numColumns === 2) {
        this.columns.push({
          items: [
            items.find(i => i.id === "when"),
            items.find(i => i.id === "calendar"),
            items.find(i => i.id === "where"),
            items.find(i => i.id === "server")
          ]
        });
        this.columns.push({
          items: [
            items.find(i => i.id === "gm"),
            items.find(i => i.id === "reserved"),
            items.find(i => i.id === "waitlisted")
          ]
        });
      }
    },
    parseDates() {
      try {
        const date = this.game.moment.raw;
        const iso = this.game.moment.iso;
        this.game.moment.calendar = moment(iso).calendar();
        this.game.moment.from = moment(iso).fromNow();
        if (new Date().getTime() >= new Date(date).getTime()) {
          this.game.moment.state = "red--text";
        }
      } catch (err) {}
    },
    mdParse(string) {
      const parsedString = string
        .split("\n")
        .map(line => this.md.render(line.trim()));
      return parsedString.join("\n");
    },
    checkRSVP(rsvp, user) {
      return checkRSVP(rsvp, user);
    }
  }
};
</script>

<style scoped>
.v-card__title .game-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.nowrap {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
  display: inline-block;
  display: inline-flex;
  margin-bottom: -7px;
}

.ribbon {
  position: absolute;
  right: -5px; top: -5px;
  z-index: 1;
  overflow: hidden;
  width: 75px; height: 75px;
  text-align: right;
}
.ribbon span {
  font-size: 10px;
  font-weight: bold;
  color: #FFF;
  text-transform: uppercase;
  text-align: center;
  line-height: 20px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  width: 100px;
  display: block;
  background: #79A70A;
  background: linear-gradient(#9BC90D 0%, #79A70A 100%);
  box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
  position: absolute;
  top: 19px; right: -21px;
}
.ribbon span::before {
  content: "";
  position: absolute; left: 0px; top: 100%;
  z-index: -1;
  border-left: 3px solid #79A70A;
  border-right: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #79A70A;
}
.ribbon span::after {
  content: "";
  position: absolute; right: 0px; top: 100%;
  z-index: -1;
  border-left: 3px solid transparent;
  border-right: 3px solid #79A70A;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #79A70A;
}
</style>