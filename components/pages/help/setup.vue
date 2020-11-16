<template>
  <v-container>
    <p>Here are the steps you should take to setup your server for the first time:</p>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>1. Invite the bot</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>
            Click the invite link in the sidebar menu to invite the 
            bot to your server. Ensure it has all the required 
            permissions it asks for, or the bot may not work properly.
            It may take up to an hour for your server to appear on the website.
          </p>
          <img src="https://i.imgur.com/FBgP7Ni.png" alt="Invite" />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>2. Go to the Manage Servers page</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>Visit the Manage Servers page in the sidebar menu.</p>
          <img src="https://i.imgur.com/If6nA9o.png" alt="Manage Server" />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>3. Open the Server Configuration dialog window.</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>Locate your server and click the cog icon to the right of the server name.</p>
          <img src="https://i.imgur.com/YPAuqBo.png" alt="Configure Server" />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>4. Configure a channel</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>Navigate to the Channel tab in the configuration dialog window. Add a channel from the dropdown.</p>
          <img src="https://i.imgur.com/GYdkt9M.png" alt="Setup a Channel" />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>5. (Optional) Configure a template</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>
            You can create templates that can be assigned to channels. 
            These templates allow you to configure a role for creating 
            games and some default values for certain event fields.
          </p>
          <img src="https://i.imgur.com/3ft21ES.png" alt="SAVE!" />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>6. Select any other configuration options you need</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>Explore the other configuration options and customize the bot to your liking. DON'T FORGET TO SAVE!</p>
          <img src="https://i.imgur.com/8LxG1L6.png" alt="SAVE!" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style scoped>
img {
  max-width: 100%;
}
</style>