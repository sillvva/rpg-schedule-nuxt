<template>
  <v-container class="px-0">
    <p
      class="px-4"
    >All bot commands must be sent in the server being configured. The bot will not respond to direct messages.</p>
    <v-simple-table class="command-list" dense fixed-header>
      <template>
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
                href="/images/glitch1.png"
                target="_blank"
              >Can occasionally glitch</a>;
              <a href="https://github.com/discordjs/discord.js/issues/3527" target="_blank">cause</a> )
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
  </v-container>
</template>

<script>
export default {};
</script>