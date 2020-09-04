<template>
  <!-- <v-app v-if="$fetchState.pending">
    <v-flex class="d-flex" justify-center align-center style="height: 100%;">
      <v-progress-circular :size="100" :width="7" color="discord" indeterminate></v-progress-circular>
    </v-flex>
  </v-app>-->
  <v-container fluid>
    <v-app-bar dense class="mb-3 hidden-sm-and-up">
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
        v-if="guilds.filter(g => g.collapsed).length == guilds.length"
        @click="expandAll"
        class="ml-4"
      >
        <v-icon>mdi-chevron-double-up</v-icon>
      </v-btn>
      <v-btn
        text
        small
        v-if="guilds.filter(g => !g.collapsed).length > 0"
        @click="collapseAll"
        class="ml-4"
      >
        <v-icon>mdi-chevron-double-down</v-icon>
      </v-btn>
    </v-app-bar>
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

        <v-dialog
          v-model="guild.editing"
          scrollable
          max-width="600px"
          @click:outside="guildSettingToggle(g)"
        >
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on" @click="guildSettingToggle(g)">
              <v-icon dark>mdi-cog</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="discord">
              <v-icon dark class="mr-2">mdi-cog</v-icon>
              {{lang.config.CONFIGURATION}}
            </v-card-title>
            <v-tabs
              v-model="tab"
              background-color="discord"
              slider-color="white"
              dark
              center-active
              show-arrows
              centered
            >
              <v-tab active-class="white--text">{{lang.config.GUILD}}</v-tab>
              <v-tab active-class="white--text">{{lang.config.BOT_CONFIGURATION}}</v-tab>
              <v-tab active-class="white--text">{{lang.config.CHANNEL_CONFIGURATION}}</v-tab>
              <v-tab active-class="white--text">{{lang.config.GAME_CONFIGURATION}}</v-tab>
              <v-tab active-class="white--text">{{lang.config.TEMPLATE_CONFIGURATION}}</v-tab>
            </v-tabs>
            <v-card-text class="px-0" style="height: 90vh; max-height: 600px;" v-if="guild.config">
              <v-form :ref="`config${guild.id}`">
                <v-tabs-items v-model="tab">
                  <v-tab-item>
                    <v-list dense>
                      <v-list-item
                        class="px-4 mb-2"
                        v-if="!guild.userRoles.includes(guild.config.managerRole)"
                      >
                        <v-select
                          :label="lang.config.MANAGER_ROLE"
                          v-model="guild.config.managerRole"
                          :hint="lang.config.desc.MANAGER_ROLE"
                          persistent-hint
                          :items="guild.roleValues"
                        ></v-select>
                      </v-list-item>

                      <v-list-item class="px-4 mb-2">
                        <v-text-field
                          :label="lang.config.PASSWORD"
                          type="password"
                          v-model="guild.config.password"
                          :hint="lang.config.desc.PASSWORD_SET"
                          persistent-hint
                        ></v-text-field>
                      </v-list-item>

                      <v-list-item class="px-4 mb-2">
                        <v-select
                          :label="lang.config.LANGUAGE"
                          v-model="guild.config.lang"
                          :items="langs.map(lang => ({ text: lang.name, value: lang.code }))"
                          :hint="`${lang.config.desc.LANG.split('.')[0]}`"
                          persistent-hint
                        ></v-select>
                      </v-list-item>

                      <v-divider class="my-3" />

                      <v-list-item>
                        <v-text-field
                          :label="lang.config.PRUNE_INTERVAL_EVENTS"
                          type="number"
                          :min="guild.config.pruneIntDiscord"
                          max="14"
                          v-model="guild.config.pruneIntEvents"
                          :hint="lang.config.desc.PRUNE_INTERVAL_EVENTS"
                          persistent-hint
                          :rules="[v => parseInt(v) >= guild.config.pruneIntDiscord, v => parseInt(v) >= 2, v => parseInt(v) <= 14]"
                        ></v-text-field>
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

                      <v-list-item>
                        <v-text-field
                          :label="lang.config.PRUNE_INTERVAL_DISCORD"
                          type="number"
                          min="2"
                          :max="guild.config.pruneIntEvents"
                          v-model="guild.config.pruneIntDiscord"
                          :hint="lang.config.desc.PRUNE_INTERVAL_DISCORD"
                          persistent-hint
                          :rules="[v => parseInt(v) <= guild.config.pruneIntEvents, v => parseInt(v) >= 2, v => parseInt(v) <= 14]"
                        ></v-text-field>
                      </v-list-item>
                    </v-list>
                  </v-tab-item>

                  <v-tab-item>
                    <v-list dense>
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

                      <v-list-item
                        @click="guild.config.embedMentions = !guild.config.embedMentions"
                      >
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

                      <v-list-item
                        @click="guild.config.embedMentionsAbove = !guild.config.embedMentionsAbove"
                      >
                        <v-list-item-action>
                          <v-checkbox
                            v-model="guild.config.embedMentionsAbove"
                            color="discord"
                            @click.stop="guild.config.embedMentionsAbove = !guild.config.embedMentionsAbove"
                          ></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-content>
                          <v-list-item-title>{{lang.config.EMBED_USER_TAGS_ABOVE}}</v-list-item-title>
                          <v-list-item-subtitle>{{lang.config.desc.EMBED_USER_TAGS_ABOVE}}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-row no-gutters>
                        <v-col cols="12" sm="6">
                          <v-list-item class="px-4 mb-2">
                            <v-text-field
                              :label="lang.config.EMOJI_JOIN"
                              v-model="guild.config.emojiAdd"
                              :hint="lang.config.desc.EMOJI"
                              :rules="[emojiRule]"
                              persistent-hint
                            ></v-text-field>
                          </v-list-item>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-list-item class="px-4 mb-2">
                            <v-text-field
                              :label="lang.config.EMOJI_LEAVE"
                              v-model="guild.config.emojiRemove"
                              :hint="lang.config.desc.EMOJI"
                              :rules="[emojiRule]"
                              persistent-hint
                            ></v-text-field>
                          </v-list-item>
                        </v-col>
                      </v-row>

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
                          :label="lang.config.PREFIX"
                          v-model="guild.config.escape"
                          :hint="lang.config.desc.PREFIX.replace(':CHAR', guild.config.escape || '!')"
                          persistent-hint
                          maxlength="3"
                        ></v-text-field>
                      </v-list-item>
                    </v-list>
                  </v-tab-item>

                  <v-tab-item>
                    <v-list dense>
                      <v-subheader class="px-4">{{lang.config.desc.CHANNEL_CONFIGURATION}}</v-subheader>

                      <v-list-item class="mb-6">
                        <v-select
                          :label="lang.config.CHANNELS"
                          v-model="selectedChannel"
                          :items="guild.channels.filter(channel => channel.type === 'text' && !guild.config.channel.find(c => c.channelId === channel.id)).map(channel => {
                            const category = channel.parentID ? guild.channelCategories.find(gc => gc.id === channel.parentID).name + ' - ' : '';
                            return { text: `${category}#${channel.name}`, value: channel.id };
                          })"
                          :hint="lang.config.desc.ADD_CHANNEL"
                          persistent-hint
                          @change="addChannel"
                        ></v-select>
                      </v-list-item>

                      <div
                        v-for="(channel, c) in guild.config.channel.filter(c => guild.channels.find(ch => ch.id === c.channelId))"
                        :key="c"
                      >
                        <v-divider></v-divider>

                        <v-row dense class="mx-0">
                          <v-col class="pr-0">
                            <h4 class="mx-4 mt-4 mb-0">
                              <span
                                v-html="guild.channels.find(ch => ch.type === 'text' && ch.id === channel.channelId).parentID ? guild.channelCategories.find(gc => gc.id === guild.channels.find(ch => ch.type === 'text' && ch.id === channel.channelId).parentID).name + '<br />' : ''"
                              ></span>
                              #{{guild.channels.find(ch => ch.type === 'text' && ch.id === channel.channelId).name}}
                            </h4>
                          </v-col>
                          <v-col class="pl-0 pr-4 text-right" style="max-width: 80px;">
                            <v-btn fab icon @click="removeChannel(guild.config, c)">
                              <v-icon>mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>

                        <v-list-item class="px-4 mb-2">
                          <v-select
                            label="Template"
                            v-model="channel.gameTemplates"
                            persistent-hint
                            :items="(guild.config.gameTemplates || []).filter(gt => gt.id).map(gt => ({ text: gt.name, value: gt.id }))"
                            multiple
                            chips
                            attach
                          ></v-select>
                        </v-list-item>
                      </div>
                    </v-list>
                  </v-tab-item>

                  <v-tab-item>
                    <v-list dense>
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
                  </v-tab-item>

                  <v-tab-item>
                    <p class="ma-3 text-right">
                      <v-btn color="discord" @click="newTemplate">{{lang.config.NEW_TEMPLATE}}</v-btn>
                    </p>

                    <v-expansion-panels v-model="openTemplate">
                      <v-expansion-panel
                        v-for="(template, t) in guild.config.gameTemplates"
                        :key="t"
                        class="grey darken-3"
                        style="border-radius: 0;"
                      >
                        <v-expansion-panel-header style="min-height: 72px;">
                          {{template.name}}
                          <div class="text-right">
                            <v-btn
                              fab
                              small
                              text
                              v-if="!template.isDefault"
                              @click.stop="removeTemplate(t);"
                            >
                              <v-icon>mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-list-item class="mb-2 px-0" v-if="!template.isDefault">
                            <v-text-field
                              :label="lang.config.TEMPLATE_NAME"
                              v-model="template.name"
                            ></v-text-field>
                          </v-list-item>

                          <v-list-item class="mb-2 px-0">
                            <v-select
                              :label="lang.config.ROLE"
                              v-model="template.role"
                              :hint="lang.config.desc.ROLE"
                              persistent-hint
                              :items="template.isDefault ? guild.roleValues : guild.channelRoleValues"
                            ></v-select>
                          </v-list-item>

                          <v-list-item class="mb-2 px-0">
                            <v-select
                              :label="lang.config.PLAYER_ROLE"
                              v-model="template.playerRole"
                              :hint="lang.config.desc.PLAYER_ROLE"
                              persistent-hint
                              :items="guild.roleValues"
                            ></v-select>
                          </v-list-item>

                          <v-menu
                            v-model="colorMenus[template.id]"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-list-item class="px-0 mb-2">
                                <v-list-item-action>
                                  <v-btn fab small :color="template.embedColor" v-on="on">&nbsp;</v-btn>
                                </v-list-item-action>
                                <v-list-item-content class="pt-0">
                                  <v-text-field
                                    :label="lang.config.EMBED_COLOR"
                                    v-model="template.embedColor"
                                    :placeholder="lang.config.DEFAULT_SERVER"
                                    :hint="lang.config.desc.EMBED_COLOR"
                                    persistent-hint
                                    @keyup="updateColors"
                                  ></v-text-field>
                                </v-list-item-content>
                              </v-list-item>
                            </template>
                            <v-color-picker
                              v-model="template.embedColor"
                              @update:color="updateColors"
                            ></v-color-picker>
                          </v-menu>

                          <v-subheader
                            class="px-0"
                            v-if="template.gameDefaults"
                          >{{lang.config.GAME_DEFAULTS}}</v-subheader>
                          <v-row no-gutters v-if="template.gameDefaults">
                            <v-col cols="12" sm="4">
                              <v-list-item class="px-0">
                                <v-text-field
                                  :label="lang.game.MIN_PLAYERS"
                                  v-model="template.gameDefaults.minPlayers"
                                  type="number"
                                  min="1"
                                  :max="!template.gameDefaults || isNaN(template.gameDefaults.maxPlayers) ? 1 : parseInt(template.gameDefaults.maxPlayers)"
                                  maxlength="3"
                                  :rules="[v => parseInt(v) <= template.gameDefaults.maxPlayers]"
                                ></v-text-field>
                              </v-list-item>
                            </v-col>
                            <v-col cols="12" sm="4">
                              <v-list-item class="px-0">
                                <v-text-field
                                  :label="lang.game.MAX_PLAYERS"
                                  v-model="template.gameDefaults.maxPlayers"
                                  type="number"
                                  :min="isNaN(template.gameDefaults.minPlayers) ? 1 : parseInt(template.gameDefaults.minPlayers)"
                                  maxlength="3"
                                  :rules="[v => parseInt(v) >= template.gameDefaults.minPlayers]"
                                ></v-text-field>
                              </v-list-item>
                            </v-col>
                            <v-col cols="12" sm="4">
                              <v-list-item class="px-0">
                                <v-select
                                  :label="lang.game.REMINDER"
                                  v-model="template.gameDefaults.reminder"
                                  :items="[
                                    { text: lang.game.options.NO_REMINDER, value: '0' },
                                    { text: lang.game.options.MINUTES_15, value: '15' },
                                    { text: lang.game.options.MINUTES_30, value: '30' },
                                    { text: lang.game.options.MINUTES_60, value: '60' },
                                    { text: lang.game.options.HOURS_6, value: '360' },
                                    { text: lang.game.options.HOURS_12, value: '720' },
                                    { text: lang.game.options.HOURS_24, value: '1440' }
                                  ]"
                                ></v-select>
                              </v-list-item>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-tab-item>
                </v-tabs-items>
              </v-form>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer />
              <v-btn color="white" text @click="guildSettingToggle(g); guild.editing = false">Close</v-btn>
              <v-btn color="discord" text @click="saveGuildConfiguration">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn icon @click="guild.collapsed = !guild.collapsed">
          <v-icon v-if="!guild.collapsed">mdi-chevron-down</v-icon>
          <v-icon v-if="guild.collapsed">mdi-chevron-up</v-icon>
        </v-btn>

        <v-menu left offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on="on" v-bind="attrs">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              :href="guild.csv"
              :download="`manage-server-${new Date().getFullYear()}-${new Date().getMonth()+1 < 10 ? '0' : ''}${new Date().getMonth()+1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}.csv`"
              target="_blank"
              v-if="guild.games.length > 0"
            >
              <v-list-item-icon>
                <v-icon dark>mdi-download</v-icon>
              </v-list-item-icon>
              <v-list-item-content>Download</v-list-item-content>
            </v-list-item>
            <v-list-item :href="`${env && env.apiUrl}/guild-rss/${guild.id}`" target="_blank">
              <v-list-item-icon>
                <v-icon dark>mdi-rss</v-icon>
              </v-list-item-icon>
              <v-list-item-content>RSS</v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="storeAccount.apiKey"
              :href="`${env && env.apiUrl}/patron-api/games?key=${storeAccount.apiKey}&guildId=${guild.id}`"
              target="_blank"
            >
              <v-list-item-icon>
                <v-icon dark>mdi-key-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-content>API</v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>

      <v-container fluid v-if="!guild.collapsed">
        <v-row dense>
          <v-col
            v-for="(game, i) in guild.games.filter(game => !game.filtered)"
            v-bind:key="i"
            cols="12"
            sm="6"
            md="4"
            lg="4"
            xl="2"
          >
            <GameCard :gameData="game" :numColumns="1" :exclude="['server']" :edit="true"></GameCard>
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
import { gamesCSV } from "../../../assets/auxjs/appaux";
import GameCard from "../../../components/game-card";
import { cloneDeep } from "lodash";
import GraphemeSplitter from "grapheme-splitter";
import { ObjectID } from "bson";

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
      env: this.$store.getters.env,
      searchQuery: this.$route.query.s,
      colorMenu: false,
      colorMenus: {},
      selectedChannel: "",
      openTemplate: null,
      tab: null,
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
    storeAccount() {
      return this.$store.getters.account;
    },
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
        this.guilds = cloneDeep(newVal).filter(
          g =>
            g.isAdmin ||
            (this.$store.getters.account &&
              this.$store.getters.account.user.tag === this.config.author)
        );
        this.guilds = this.mapGuilds(this.guilds);
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
        if (newVal && newVal.nav) {
          this.lang = newVal;
          this.guilds = this.mapGuilds(this.guilds);
        }
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
    this.$store.commit("setLastListingPage", "manage-server");
  },
  methods: {
    saveGuildConfiguration() {
      const index = this.guilds.findIndex(g => g.editing);
      const guild = this.guilds.find(g => g.editing);
      if (guild && guild.config) {
        const form = this.$refs[`config${guild.id}`][0];
        if (form && form.validate()) {
          if (guild.config.pruneIntEvents < 2) guild.config.pruneIntEvents = 2;
          if (guild.config.pruneIntEvents > 14)
            guild.config.pruneIntEvents = 14;
          if (guild.config.pruneIntDiscord < 2)
            guild.config.pruneIntDiscord = 2;
          if (guild.config.pruneIntDiscord > 14)
            guild.config.pruneIntDiscord = 14;
          if (guild.config.pruneIntEvents < guild.config.pruneIntDiscord) {
            guild.config.pruneIntEvents = guild.config.pruneIntDiscord;
          }
          guild.config.gameTemplates = guild.config.gameTemplates.map(gt => {
            gt.gameDefaults.minPlayers = parseInt(gt.gameDefaults.minPlayers);
            gt.gameDefaults.maxPlayers = parseInt(gt.gameDefaults.maxPlayers);
            delete gt.unsaved;
            return gt;
          });
          guild.config.channel = guild.config.channel
            .filter(c => guild.channels.find(ch => ch.id === c.channelId))
            .filter(
              (c, i) =>
                guild.config.channel.findIndex(
                  gc => gc.channelId === c.channelId
                ) === i
            );
          this.$store
            .dispatch("saveGuildConfig", {
              config: guild.config,
              app: this,
              route: this.$route
            })
            .then(result => {
              this.$store.commit(
                "setGuilds",
                this.guilds.map(g => {
                  if (g.editing) g.config = result.guildConfig;
                  return g;
                })
              );
              this.$store.dispatch("addSnackBar", {
                message: "Configuration saved successfully" || err,
                color: "success",
                timeout: 10
              });
              guild.editing = false;
            })
            .catch(err => {
              this.$store.dispatch("addSnackBar", {
                message: (err && err.message) || err || "An error occured!",
                color: "error",
                timeout: 10
              });
            });
        }
      }
    },
    cloneDeep(val) {
      return cloneDeep(val);
    },
    mapGuilds(guilds) {
      return guilds.map(g => {
        g.roleValues = [
          {
            text: (this.lang.config || {}).NO_ROLE,
            value: null
          },
          ...g.roles
            .filter(r => !r.managed && r.name !== "@everyone")
            .map(r => {
              return { text: r.name, value: r.name };
            })
        ];
        g.channelRoleValues = [
          {
            text: (this.lang.config || {}).DEFAULT_SERVER,
            value: null
          },
          ...g.roles
            .filter(r => !r.managed && r.name !== "@everyone")
            .map(r => {
              return { text: r.name, value: r.name };
            })
        ];
        g.config.escape = g.config.escape || "!";
        g.config.gameTemplates.forEach(gt => {
          this.colorMenus[gt.id] = false;
        });
        g.csv = gamesCSV(g);
        return {
          ...g,
          collapsed: false,
          filtered: false
        };
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
                    (match.query != "new" &&
                      match.type === "any" &&
                      (match.regex.test(game.adventure) ||
                        match.regex.test(game.dm.tag || game.dm) ||
                        match.regex.test(game.author.tag) ||
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
        if (
          !this.searchQuery ||
          this.searchQuery.trim().length === 0 ||
          guild.games.find(game => !game.filtered)
        )
          guild.filtered = false;
        return guild;
      });
      this.expandAll();
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
    },
    addChannel() {
      const guild = this.guilds.find(g =>
        g.channels.find(c => c.id === this.selectedChannel)
      );
      if (guild) {
        guild.config.channel.push({
          channelId: this.selectedChannel,
          gameDefaults: {
            minPlayers: 1,
            maxPlayers: 7,
            reminder: "0"
          }
        });
      }
      this.selectedChannel = "";
    },
    removeChannel(config, c) {
      config.channel.splice(c, 1);
      this.selectedChannel = "";
    },
    updateColors(color) {
      const g = this.guilds.find(g => g.editing);
      if (!g) return;
      g.config.embedColor = this.colorFixer(g.config.embedColor);
      g.config.gameTemplates = g.config.gameTemplates.map(gt => {
        gt.embedColor = this.colorFixer(gt.embedColor);
        return gt;
      });
    },
    guildSettingToggle(gIndex) {
      if (this.guilds[gIndex].editing) {
        this.openTemplate = null;
        this.guilds[gIndex].config.gameTemplates = this.guilds[
          gIndex
        ].config.gameTemplates.filter(g => !g.unsaved);
      }
    },
    newTemplate() {
      const guild = this.guilds.find(g => g.editing);
      if (guild && guild.config) {
        guild.config.gameTemplates.push({
          id: new ObjectID().toHexString(),
          name: this.lang.config.NEW_TEMPLATE,
          embedColor: guild.config.embedColor,
          role: guild.config.role,
          unsaved: true,
          gameDefaults: {
            minPlayers: 1,
            maxPlayers: 7,
            reminder: "0"
          }
        });
        this.openTemplate = guild.config.gameTemplates.length - 1;
      }
    },
    removeTemplate(index) {
      const guild = this.guilds.find(g => g.editing);
      if (guild && guild.config) {
        guild.config.gameTemplates.splice(index, 1);
      }
    },
    colorFixer(color) {
      color = color.replace(/[^0-9a-f#]/gi, "");
      if (!color.startsWith("#")) color = "#" + color;
      if (/^#([0-9a-f]{7,})$/i.test((color || "").trim()))
        color = color.slice(0, 7);
      return color;
    }
  }
};
</script>

<style>
input[type="color"] {
  padding: 0;
  width: 20px;
}

@media (min-width: 1400px) {
  .col-lg-4 {
    flex: 0 0 calc(100% / 4);
    max-width: calc(100% / 4);
  }
}

@media (min-width: 1800px) {
  .col-xl-2 {
    flex: 0 0 calc(100% / 5);
    max-width: calc(100% / 5);
  }
}
</style>