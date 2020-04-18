<template></template>

<script>
import authAux from "../../components/auxjs/auth";

export default {
  layout: "loading",
  head: {
    title: "Logging In"
  },
  mounted() {
    if (this.$route.query.redirect) {
      this.$cookies.set("redirect", this.$route.query.redirect);
      window.location = this.$store.getters.env.authUrl;
    }
    if (this.$route.query.code) {
      const redirect = this.$cookies.get("redirect");
      this.$store
        .dispatch("authenticate", this.$route.query.code)
        .then(async result => {
          authAux.setToken(this, result.token);
          setTimeout(() => {
            this.$cookies.remove("redirect");
            this.$router.replace(
              redirect || this.$store.state.config.urls.game.games.path
            );
          }, 500);
        });
    }
  }
};
</script>