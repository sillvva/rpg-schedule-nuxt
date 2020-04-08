<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" lg="6" class="py-0">
        <v-card class="mb-3">
          <v-toolbar color="discord">
            <v-toolbar-title>Links</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <h4>
              Want to contribute?
              <a
                :href="env.githubAPIUrl"
                target="_blank"
                style="white-space: nowrap;"
              >Github (API & Bot)</a>
              |
              <a
                :href="env.githubUIUrl"
                target="_blank"
                style="white-space: nowrap;"
              >Github (UI)</a>
              |
              <a
                :href="env.donateUrl"
                target="_blank"
                style="white-space: nowrap;"
              >Patreon</a>
              |
              <a
                :href="env.paypalUrl"
                target="_blank"
                style="white-space: nowrap;"
              >PayPal</a>
            </h4>
            <h4>
              Need assistance?
              <span style="white-space: nowrap;">
                Join my
                <a href="https://discord.gg/mazZEe3" target="_blank">Discord server</a>.
              </span>
            </h4>
            <h4>
              <a
                href="https://github.com/sillvva/rpg-schedule/blob/master/CHANGELOG.md"
                target="_blank"
              >Change Log</a>
            </h4>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6" class="py-0">
        <v-card class="mb-3">
          <v-toolbar color="discord">
            <v-toolbar-title>Important Note</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>Games are automatically pruned 48 - 72 hours after the scheduled time. Or you can delete them manually.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-card class="mb-3">
      <v-toolbar color="discord">
        <v-toolbar-title>Command List</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>All bot commands must be sent in the server being configured. The bot will not respond to direct messages.</p>
        <v-simple-table class="command-list" dense fixed-header>
          <template v-slot:default>
            <thead>
              <tr>
                <th
                  scope="col"
                >Command&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                <th
                  scope="col"
                >Default&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>General Commands</strong>
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>!schedule</td>
                <td></td>
                <td>Displays the help menu</td>
              </tr>
              <tr>
                <td>!schedule help</td>
                <td></td>
                <td>Displays the help menu</td>
              </tr>
              <tr>
                <td>
                  <strong>General Configuration</strong>
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>!schedule configuration</td>
                <td></td>
                <td>Get the bot configuration</td>
              </tr>
              <tr>
                <td>
                  !schedule role
                  <code>role name</code>
                </td>
                <td>All Roles</td>
                <td>Assign a role as a prerequisite for posting games</td>
              </tr>
              <tr>
                <td>
                  !schedule manager-role
                  <code>role name</code>
                </td>
                <td>Server Admins</td>
                <td>
                  Assign a role to allow managing all server games. By default any server user with the
                  <em>Manage Server</em> permission has this capability. This option allows you to provide this capability to users without that permission.
                </td>
              </tr>
              <tr>
                <td>
                  !schedule password
                  <code>password</code>
                </td>
                <td>disabled</td>
                <td>Configure a password for posting games</td>
              </tr>
              <tr>
                <td>!schedule password</td>
                <td></td>
                <td>Remove the password</td>
              </tr>
              <tr>
                <td>
                  !schedule lang
                  <code>en</code>
                </td>
                <td>
                  <code>en</code> (English)
                </td>
                <td>Set the bot's language.</td>
              </tr>
              <tr>
                <td>
                  <strong>Bot Configuration</strong>
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>
                  !schedule embeds
                  <code>on/off</code>
                </td>
                <td>
                  <code>on</code>
                </td>
                <td>Use discord embeds for announcements</td>
              </tr>
              <tr>
                <td>
                  !schedule embed-color
                  <code>color</code>
                </td>
                <td>
                  <code>#2196f3</code>
                </td>
                <td>
                  Set a discord embed color. Can be a color name like
                  <code>red</code> or a hexadecimal color like
                  <code>#2196f3</code>
                </td>
              </tr>
              <tr>
                <td>
                  !schedule embed-user-tags
                  <code>on/off</code>
                </td>
                <td>
                  <code>off</code>
                </td>
                <td>
                  Include user tags in announcement embeds (
                  <a
                    href="https://cdn.discordapp.com/attachments/532565396746928149/682786099679985665/unknown.png"
                    target="_blank"
                  >Can occasionally glitch</a>)
                </td>
              </tr>
              <tr>
                <td>!schedule emoji-sign-up ➕</td>
                <td>➕</td>
                <td>Set the emoji used for automated sign up</td>
              </tr>
              <tr>
                <td>!schedule emoji-drop-out ➖</td>
                <td>➖</td>
                <td>Set the emoji used for automated sign up</td>
              </tr>
              <tr>
                <td>!schedule toggle-drop-out</td>
                <td>
                  <code>off</code>
                </td>
                <td>Enable/disable the ability for players to drop out</td>
              </tr>
              <tr>
                <td>
                  !schedule prefix-char
                  <code>?</code>
                </td>
                <td>
                  <code>!</code>
                </td>
                <td>Set the prefix character for sending bot commands</td>
              </tr>
              <tr>
                <td>
                  <strong>Game Configuration</strong>
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>
                  !schedule add-channel
                  <code>#channel-name</code>
                </td>
                <td>first text channel</td>
                <td>Add a channel where games are posted (recommended)</td>
              </tr>
              <tr>
                <td>
                  !schedule remove-channel
                  <code>#channel-name</code>
                </td>
                <td></td>
                <td>Remove a channel where games are posted</td>
              </tr>
              <tr>
                <td>
                  !schedule pruning
                  <code>on/off</code>
                </td>
                <td>
                  <code>off</code>
                </td>
                <td>
                  Automatically delete old game announcements. As noted above, games over 48 hours past their scheduled date are automatically pruned from the database. However, by
                  default the announcements are not.
                </td>
              </tr>
              <tr>
                <td>!schedule private-reminders</td>
                <td>
                  <code>off</code>
                </td>
                <td>Toggle whether the game reminders are sent to private messages.</td>
              </tr>
              <tr>
                <td>!schedule reschedule-mode</td>
                <td>
                  <code>repost</code>
                </td>
                <td>
                  Available modes:
                  <br />
                  <ul>
                    <li>
                      <code>repost</code> - Creates a new announcement post
                    </li>
                    <li>
                      <code>update</code> - Updates the original announcement post
                    </li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Usage</strong>
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>!schedule link</td>
                <td></td>
                <td>Retrieve the link for posting games</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
      <v-toolbar color="discord">
        <v-toolbar-title>Rescheduling</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>
          The rescheduled announcement will be posted X hours after the date/time of the current announcement, where
          X is the duration (or runtime) of the game (+/- 1 hour). If no duration is entered, it defaults to 0 hours.
        </p>
        <h4>Weekly</h4>
        <p class="mb-0">You enter: 3/25 (Wed) 9 am; Reschedule: Weekly, Friday; Duration: 2 hours</p>
        <ul>
          <li>First announcement says 3/25 (Wed) 9 am, posted manually</li>
          <li>Next announcement says 3/27 (Fri) 9 am, posted automatically at 3/25 11 am</li>
          <li>Next announcement says 4/3 (Fri) 9 am, posted automatically at 3/27 11 am</li>
        </ul>
        <p
          class="mt-3 mb-0"
        >The first announcement is always on the date you entered. Any following announcements will be based on the day(s) of the week selected.</p>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
      <v-toolbar color="discord">
        <v-toolbar-title>About the Bot</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>The bot and API layer are deployed from Github to AWS Elastic Beanstalk as a Node.js and discord.js application with MongoDB for data storage.</p>
        <p>The website is deployed from Github to AWS Elastic Beanstalk as a Nuxt.js web app that communicates with the API layer over web requests and web sockets.</p>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
      <v-toolbar color="discord">
        <v-toolbar-title>Credits</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <h4 class="mb-3">
          <a href="https://www.mattdekok.dev/#donate" target="_blank">My Website</a>
        </h4>
        <h4>Patrons/Donors</h4>
        <ul class="mb-3">
          <li>JmanX</li>
          <li v-for="(pledge, p) in pledges" :key="p">
            {{pledge.full_name}}
            <span
              v-if="pledge.vanity && !pledge.url.startsWith('https://www.patreon.com/user')"
            >
              (
              <a :href="pledge.url" target="_blank">{{pledge.patron.attributes.vanity}}</a>)
            </span>
          </li>
        </ul>
        <h4>Code/Language Contributors</h4>
        <p class="mb-0">
          This list contains contributors who have added something to RPG Schedule. You can see the full list of contributors and their contributions
          <a
            href="https://github.com/sillvva/rpg-schedule/graphs/contributors"
            target="_blank"
          >here</a>.
        </p>
        <ul>
          <li>wilywyrm (Recurring Games Added)</li>
          <li>Manuoue (French Language Added)</li>
          <li>ILDaviz (Italian Language Added)</li>
          <li>Level8Broccoli (German Language Added)</li>
          <li>Rudolf J (Russian Language Added)</li>
        </ul>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { updateToken } from "../../components/auth";

export default {
  middleware: ["check-auth"],
  head: {
    title: "Help"
  },
  data() {
    return {
      pledges: [],
      env: {}
    };
  },
  computed: {
    storeEnv() {
      return this.$store.getters.env;
    }
  },
  watch: {
    storeEnv: {
      handler: function(newVal) {
        this.env = newVal;
      },
      immediate: true
    }
  },
  mounted() {
    updateToken(this);
    this.$store.dispatch("fetchPledges").then(result => {
      this.pledges = result.pledges;
    });
  }
};
</script>

<style>
.command-list tr td:first-child {
  white-space: nowrap;
}
.command-list td {
  vertical-align: top;
  padding-top: 5px;
  padding-bottom: 5px;
}
</style>