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
        <v-dialog v-model="guild.editing" scrollable max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on">
              <v-icon dark>mdi-cog</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>{{lang.config.CONFIGURATION}}</v-card-title>
            <v-divider></v-divider>
            <v-card-text class="px-0" style="height: 90vh; max-height: 600px;" v-if="guild.config">
              <v-form :ref="`config${guild.id}`">
                <v-list subheader dense>
                  <v-subheader class="px-4">{{lang.config.GENERAL_CONFIGURATION}}</v-subheader>

                  <v-list-item class="px-4 mb-2">
                    <v-text-field
                      label="Role"
                      v-model="guild.config.role"
                      :hint="lang.config.desc.ROLE"
                      persistent-hint
                    ></v-text-field>
                  </v-list-item>

                  <v-list-item class="px-4 mb-2">
                    <v-text-field
                      label="Password"
                      type="password"
                      v-model="guild.config.password"
                      :hint="lang.config.desc.PASSWORD_SET"
                      persistent-hint
                    ></v-text-field>
                  </v-list-item>

                  <v-list-item class="px-4 mb-2">
                    <v-select
                      label="Language"
                      v-model="guild.config.lang"
                      :items="langs.map(lang => ({ text: lang.name, value: lang.code }))"
                      :hint="`${lang.config.desc.LANG.split('.')[0]}`"
                      persistent-hint
                    ></v-select>
                  </v-list-item>

                  <v-divider></v-divider>
                  <v-subheader class="px-4">{{lang.config.BOT_CONFIGURATION}}</v-subheader>

                  <v-list-item @click="guild.config.embeds = !guild.config.embeds">
                    <v-list-item-action>
                      <v-checkbox
                        v-model="guild.config.embeds"
                        color="discord"
                        @click.stop="guild.config.embeds = !guild.config.embeds"
                      ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                      <v-list-item-title>{{lang.config.EMBEDS}}</v-list-item-title>
                      <v-list-item-subtitle>{{lang.config.desc.EMBEDS}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="guild.config.embedMentions = !guild.config.embedMentions">
                    <v-list-item-action>
                      <v-checkbox
                        v-model="guild.config.embedMentions"
                        color="discord"
                        @click.stop="guild.config.embedMentions = !guild.config.embedMentions"
                      ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                      <v-list-item-title>{{lang.config.EMBED_USER_TAGS}}</v-list-item-title>
                      <v-list-item-subtitle>{{lang.config.desc.EMBED_USER_TAGS}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-menu
                    v-model="colorMenu"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-list-item class="px-4 mb-2">
                        <v-list-item-action>
                          <v-btn fab small :color="guild.config.embedColor" v-on="on">&nbsp;</v-btn>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-text-field
                            label="Embed Color"
                            v-model="guild.config.embedColor"
                            :hint="lang.config.desc.EMBED_COLOR"
                            persistent-hint
                          ></v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                    <v-color-picker v-model="guild.config.embedColor"></v-color-picker>
                  </v-menu>

                  <v-list-item class="px-4 mb-2">
                    <v-text-field
                      :label="lang.config.EMOJI_JOIN"
                      v-model="guild.config.emojiAdd"
                      :hint="lang.config.desc.EMOJI"
                      :rules="[emojiRule]"
                      persistent-hint
                    ></v-text-field>
                  </v-list-item>

                  <v-list-item class="px-4 mb-2">
                    <v-text-field
                      :label="lang.config.EMOJI_LEAVE"
                      v-model="guild.config.emojiRemove"
                      :hint="lang.config.desc.EMOJI"
                      :rules="[emojiRule]"
                      persistent-hint
                    ></v-text-field>
                  </v-list-item>

                  <v-list-item @click="guild.config.dropOut = !guild.config.dropOut">
                    <v-list-item-action>
                      <v-checkbox
                        v-model="guild.config.dropOut"
                        color="discord"
                        @click.stop="guild.config.dropOut = !guild.config.dropOut"
                      ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                      <v-list-item-title>{{lang.config.DROP_OUTS}}</v-list-item-title>
                      <v-list-item-subtitle>{{lang.config.desc.TOGGLE_DROP_OUT}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item class="px-4 mb-2">
                    <v-text-field
                      :label="lang.config.PREFIX_CHAR"
                      v-model="guild.config.escape"
                      :hint="lang.config.desc.PREFIX.replace(':CHAR', cloneDeep(guild.currentConfig.escape))"
                      persistent-hint
                      maxlength="3"
                    ></v-text-field>
                  </v-list-item>

                  <v-divider></v-divider>
                  <v-subheader class="px-4">{{lang.config.GAME_CONFIGURATION}}</v-subheader>

                  <v-list-item>
                    <v-select
                      :label="lang.config.CHANNELS"
                      v-model="guild.config.channel"
                      :items="guild.channels.filter(channel => channel.type === 'text').map(channel => {
                        return { text: channel.name, value: channel.id };
                      })"
                      :hint="lang.config.desc.ADD_CHANNEL"
                      persistent-hint
                      attach
                      chips
                      multiple
                    ></v-select>
                  </v-list-item>

                  <v-list-item @click="guild.config.pruning = !guild.config.pruning">
                    <v-list-item-action>
                      <v-checkbox
                        v-model="guild.config.pruning"
                        color="discord"
                        @click.stop="guild.config.pruning = !guild.config.pruning"
                      ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                      <v-list-item-title>{{lang.config.PRUNING}}</v-list-item-title>
                      <v-list-item-subtitle>{{lang.config.desc.PRUNING}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    @click="guild.config.privateReminders = !guild.config.privateReminders"
                  >
                    <v-list-item-action>
                      <v-checkbox
                        v-model="guild.config.privateReminders"
                        color="discord"
                        @click.stop="guild.config.privateReminders = !guild.config.privateReminders"
                      ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                      <v-list-item-title>{{lang.config.PRIVATE_REMINDERS}}</v-list-item-title>
                      <v-list-item-subtitle>{{lang.config.desc.PRIVATE_REMINDERS.split('.')[0]}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-select
                      :label="lang.config.RESCHEDULE_MODE"
                      v-model="guild.config.rescheduleMode"
                      :items="[{text: 'Repost', value: 'repost'},{text: 'Update', value: 'update'}]"
                    ></v-select>
                  </v-list-item>
                </v-list>
              </v-form>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn color="white" text @click="guild.editing = false">Close</v-btn>
              <v-btn color="discord" text @click="saveGuildConfiguration">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
            <GameCard :gameData="game" :numColumns="1" :exclude="['server']" :edit="true"></GameCard>
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
import GraphemeSplitter from "grapheme-splitter";

export default {
  middleware: ["authenticated"],
  head: {
    title: "Manage Server"
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
        this.guilds = cloneDeep(newVal).map(g => ({
          ...g,
          collapsed: false,
          filtered: false
        }));
        if (
          !(
            this.$store.getters.account &&
            this.$store.getters.account.user.tag === this.config.author
          )
        ) {
          this.searchGuild();
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
  mounted() {
    updateToken(this);
    this.$store.dispatch("fetchGuilds", {
      page: "server",
      games: true,
      app: this
    });
  },
  methods: {
    saveGuildConfiguration() {
      const guild = this.guilds.find(g => g.editing);
      if (guild && guild.config) {
        const form = this.$refs[`config${guild.id}`][0];
        if (form && form.validate()) {
          this.$store
            .dispatch("saveGuildConfig", {
              config: guild.config,
              app: this,
              route: this.$route
            })
            .then(result => {
              this.$store.dispatch("addSnackBar", { message: "Configuration saved successfully" || err, color: "success darken-2" });
              guild.editing = false;
            })
            .catch(err => {
              this.$store.dispatch("addSnackBar", { message: (err && err.message) || err, color: "error" });
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
    }
  }
};
</script>

<style>
input[type="color"] {
  padding: 0;
  width: 20px;
}
</style>