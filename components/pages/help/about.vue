<template>
  <v-container>
    <p>The bot and API layer are deployed from Github to AWS Elastic Beanstalk as a Node.js and discord.js application with MongoDB for data storage.</p>
    <p>The website is deployed from Github to AWS Elastic Beanstalk as a Nuxt.js web app that communicates with the API layer over web requests and web sockets.</p>

    <h4>
      Want to contribute?
      <a
        href="/r/githubAPI"
        target="_blank"
        style="white-space: nowrap;"
      >Github (API & Bot)</a>
      |
      <a href="/r/githubUI" target="_blank" style="white-space: nowrap;">Github (UI)</a>
      |
      <a href="/r/donate" target="_blank" style="white-space: nowrap;">Patreon</a>
      |
      <a href="/r/paypal" target="_blank" style="white-space: nowrap;">PayPal</a>
    </h4>
    <h4>
      Need assistance?
      <span style="white-space: nowrap;">
        Join my
        <a href="https://discord.gg/mazZEe3" target="_blank">Discord server</a>.
      </span>
    </h4>
    <h4 class="mb-4">
      <a
        href="https://github.com/sillvva/rpg-schedule/blob/master/CHANGELOG.md"
        target="_blank"
      >Change Log</a>
    </h4>

    <v-card class="mb-4" color="grey darken-3">
      <v-toolbar color="info">
        <v-toolbar-title>Important Note</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <p>Games are automatically pruned 48 - 72 hours after the scheduled time. Or you can delete them manually.</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>