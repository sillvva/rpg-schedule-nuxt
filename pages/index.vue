<template>
  <v-container d-flex flex-column align-center style="height: 100vh;">
    <v-img src="/images/logo.png" :max-height="windowWidth < 600 || windowHeight < 600 ? windowHeight <= 568 ? 100 : 200 : 264" max-width="300px" contain class="mb-3" />
    <v-row justify="center">
      <v-col cols="6" class="text-right">
        <v-btn :href="$store.getters.env.inviteUrl" target="_blank">{{lang.nav.INVITE}}</v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn :href="$store.getters.env.authUrl" class="bg-discord">{{lang.nav.LOGIN}}</v-btn>
      </v-col>
    </v-row>
    <v-carousel :show-arrows="false" cycle :height="windowWidth < 600 || windowHeight < 600 ? `calc(100vh - ${windowHeight <= 568 ? 204 : 284}px)` : 600">
      <v-carousel-item reverse-transition="fade-transition" transition="fade-transition">
        <v-sheet height="100%" style="background-color:rgba(0, 0, 0, 0.5);">
          <v-row class="fill-height" align="center" justify="center">
            <div class="d-flex align-center flex-column" style="width: 100%;">
              <div style="width: calc(100% - 50px); max-width: 500px;">
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
            </div>
          </v-row>
        </v-sheet>
      </v-carousel-item>
      <v-carousel-item
        :src="windowWidth < 600 ? '' : '/images/screenshot3.jpg'"
        reverse-transition="fade-transition"
        transition="fade-transition"
      >
        <v-sheet height="100%" style="background-color:rgba(0, 0, 0, 0.5);">
          <v-row class="fill-height" align="center" justify="center">
            <div class="d-flex align-center flex-column" style="width: 100%;">
              <div style="width: calc(100% - 50px); max-width: 500px;">
                <h3>Upcoming Games</h3>
                <p>
                  This screen shows upcoming games that have been scheduled. Players can sign up or drop out using the button on the event. Clicking on an event displays additional
                  information about it.
                </p>
              </div>
            </div>
          </v-row>
        </v-sheet>
      </v-carousel-item>
      <v-carousel-item
        :src="windowWidth < 600 ? '' : '/images/screenshot.jpg'"
        reverse-transition="fade-transition"
        transition="fade-transition"
      >
        <v-sheet height="100%" style="background-color:rgba(0, 0, 0, 0.5);">
          <v-row class="fill-height" align="center" justify="center">
            <div class="d-flex align-center flex-column" style="width: 100%;">
              <div style="width: calc(100% - 50px); max-width: 500px;">
                <h3>Post Games</h3>
                <p>
                  Game Masters can post games using the web interface and choose whether to use the built-in automated sign up features or use custom signup instructions. The GM can also
                  set a reminder that will either be sent to the game announcements channel on the Discord server or to each participants' private messages, depending on the server's
                  reminder configuration.
                </p>
              </div>
            </div>
          </v-row>
        </v-sheet>
      </v-carousel-item>
      <v-carousel-item
        :src="windowWidth < 600 ? '' : '/images/screenshot2.jpg'"
        reverse-transition="fade-transition"
        transition="fade-transition"
      >
        <v-sheet height="100%" style="background-color:rgba(0, 0, 0, 0.5);">
          <v-row class="fill-height" align="center" justify="center">
            <div class="d-flex align-center flex-column" style="width: 100%;">
              <div style="width: calc(100% - 50px); max-width: 500px;">
                <h3>Discord Announcements</h3>
                <p>
                  When a game is posted, an announcement will be posted in the designated channel on Discord. Players can sign up either via the web interface or the reaction buttons
                  directly on the game announcement. Whenever a game is updated, the announcement will automatically be updated.
                </p>
              </div>
            </div>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>

<script>
import lang from "../assets/lang/en.json";

export default {
  layout: "noframe",
  middleware: ["authenticated"],
  data() {
    return {
      lang: lang,
      windowWidth: 0,
      windowHeight: 0,
      onResize: () => {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
      }
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
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
    if (this.socket) this.socket.close();
  }
};
</script>

<style scoped>
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