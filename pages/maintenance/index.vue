<template>
  <v-container d-flex flex-column justify-center align-center style="height: 100vh">
    <v-img src="/images/logo.png" max-height="264px" max-width="300px" contain />
    <h1 style="font-size: 3em; margin: 0;">{{lang.other.UNDER_MAINTENANCE}}</h1>
    <h2>{{lang.other.BACK_SOON}}</h2>
  </v-container>
</template>

<script>
import lang from "../../components/lang/en.json";

export default {
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