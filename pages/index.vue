<template>
  <v-container d-flex flex-column align-center>
    <v-img src="/images/logo.png" max-height="264px" max-width="300px" contain />
    <v-row justify="center">
      <v-col cols="6" class="text-right">
        <v-btn :href="$store.getters.env.inviteUrl" target="_blank">{{lang.nav.INVITE}}</v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn :href="$store.getters.env.authUrl" class="bg-discord">{{lang.nav.LOGIN}}</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="text-center">
        <v-btn :href="$store.getters.env.donateUrl">{{lang.nav.DONATE}}</v-btn>
      </v-col>
    </v-row>
    <div class="description my-8">
      <p>A discord bot for posting game announcements for RPGs. Features include:</p>
      <ul>
        <li>
          A web interface for
          <ul>
            <li>Signing up for or dropping out of games</li>
            <li>Posting and editing game announcements</li>
          </ul>
        </li>
        <li>Automated or manual sign ups and automated waitlisting</li>
        <li>Automated reminders</li>
      </ul>
    </div>
    <div class="feature wrap-reverse">
      <img src="/images/screenshot3.png" alt="Upcoming Games" />
      <div>
        <h3>Upcoming Games</h3>
        <p>
          This screen shows upcoming games that have been scheduled. Players can sign up or drop out using the button on the event. Clicking on an event displays additional
          information about it.
        </p>
      </div>
    </div>
    <div class="feature wrap">
      <div>
        <h3>Post Games</h3>
        <p>
          Game Masters can post games using the web interface and choose whether to use the built-in automated sign up features or use custom signup instructions. The GM can also
          set a reminder that will either be sent to the game announcements channel on the Discord server or to each participants' private messages, depending on the server's
          reminder configuration.
        </p>
      </div>
      <img src="/images/screenshot.png" alt="Post Games" />
    </div>
    <div class="feature wrap-reverse">
      <img src="/images/screenshot2.png" alt="Game Announcements" />
      <div>
        <h3>Discord Announcements</h3>
        <p>
          When a game is posted, an announcement will be posted in the designated channel on Discord. Players can sign up either via the web interface or the reaction buttons
          directly on the game announcement. Whenever a game is updated, the announcement will automatically be updated.
        </p>
      </div>
    </div>
  </v-container>
</template>

<script>
import lang from "../components/lang/en.json";

export default {
  middleware: ["authenticated"],
  data() {
    return {
      lang: lang
    };
  },
  computed: {
    stateLang() {
      const lang = this.$store.getters.lang;
      return lang;
    }
  },
  watch: {
    stateLang: {
      handler: "setLang",
      immediate: true
    }
  },
  methods: {
    setLang(newVal) {
      this.lang = newVal;
    }
  },
  created() {
    this.lang = lang;
  }
};
</script>

<style scoped>
.feature {
  display: flex;
  max-width: 1000px;
  margin: 20px auto;
}

.feature > * {
  flex: 1;
  margin: 10px;
  width: 50%;
}

@media (max-width: 768px) {
  .feature.wrap {
    flex-wrap: wrap;
  }
  .feature.wrap-reverse {
    flex-wrap: wrap-reverse;
  }
  .feature > * {
    width: calc(100vw - 40px);
  }
}

.feature > img {
  box-shadow: 0 0 7px black;
}

h1 {
  font-size: 64px;
}
h1 img {
  height: 264px;
  margin-top: -10px;
}

@media (max-width: 500px) {
  h1 {
    font-size: 48px;
  }
  h1 img {
    margin-top: -8px;
  }
}

@media (max-width: 400px) {
  h1 {
    max-height: 200px;
    font-size: 32px;
  }
  h1 img {
    margin-top: -6px;
  }
}
</style>