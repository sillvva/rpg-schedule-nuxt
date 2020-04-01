<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <v-img src="/images/logo.png" :height="264" contain />
      </v-col>
    </v-row>
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
  </v-container>
</template>

<script>
import lang from "../components/lang/en.json";

export default {
  middleware: ["check-auth", "authenticated"],
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
