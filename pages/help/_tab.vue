<template>
  <v-container fluid class="help-container">
    <v-card class="help-card">
      <v-toolbar color="discord">
        <v-toolbar-title>Help</v-toolbar-title>
      </v-toolbar>

      <v-tabs
        v-model="tab"
        :vertical="windowWidth >= 800"
        center-active
        :grow="windowWidth < 800"
      >
        <v-tab>About</v-tab>
        <v-tab>Credits</v-tab>
        <v-tab>Commands</v-tab>
        <v-tab>Setup</v-tab>
        <v-tab>Rescheduling</v-tab>

        <v-tabs-items v-model="tab" touchless>
          <v-tab-item>
            <AboutPage />
          </v-tab-item>

          <v-tab-item>
            <CreditsPage />
          </v-tab-item>

          <v-tab-item>
            <CommandsPage />
          </v-tab-item>

          <v-tab-item>
            <SetupPage />
          </v-tab-item>

          <v-tab-item>
            <ReschedulingPage />
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </v-card>
  </v-container>
</template>

<script>
import { updateToken } from "../../assets/auxjs/auth";
import AboutPage from "../../components/pages/help/about";
import CreditsPage from "../../components/pages/help/credits";
import CommandsPage from "../../components/pages/help/commands";
import ReschedulingPage from "../../components/pages/help/rescheduling";
import SetupPage from "../../components/pages/help/setup";

export default {
  // middleware: ["authenticated"],
  head: {
    title: "Help"
  },
  components: {
    AboutPage: AboutPage,
    CreditsPage: CreditsPage,
    CommandsPage: CommandsPage,
    ReschedulingPage: ReschedulingPage,
    SetupPage: SetupPage
  },
  data() {
    return {
      pledges: [],
      env: {},
      tab: null,
      windowWidth: 0,
      tabIndexes: {
        about: 0,
        credits: 1,
        commands: 2,
        setup: 3,
        rescheduling: 4
      },
      onResize: () => {
        this.windowWidth = window.innerWidth;
      }
    };
  },
  computed: {
    storeEnv() {
      return this.$store.getters.env;
    }
  },
  watch: {
    windowWidth(newWidth, oldWidth) {
      this.drawer = newWidth >= 1264;
    },
    storeEnv: {
      handler: function(newVal) {
        this.env = newVal;
      },
      immediate: true
    }
  },
  created() {
    this.tab = null;
  },
  mounted() {
    updateToken(this);

    window.addEventListener("resize", this.onResize);
    this.onResize();

    const tab = this.$route.params.tab;
    if (tab) {
      setTimeout(() => {
        if (this.tabIndexes[tab]) this.tab = this.tabIndexes[tab];
        else if (!isNaN(tab)) this.tab = tab;
        else this.tab = null;
      }, 100);
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  }
};
</script>

<style>
@media (max-width: 599px) {
  .help-container .help-card .v-tabs-items {
    max-height: calc(100vh - 185px);
    overflow-y: auto;
  }
}

.help-container .command-list tr td:first-child {
  white-space: nowrap;
}
.help-container .command-list td {
  vertical-align: top;
  padding-top: 5px;
  padding-bottom: 5px;
}

.help-container .v-slide-group__prev {
  display: none !important;
}

.help-container a {
  color: #7289da !important;
}
</style>