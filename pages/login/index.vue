<template></template>

<script>
import authAux from "../../components/auth";

export default {
  head: {
    title: "Logging In"
  },
  mounted() {
    console.log(this.$route.query);
    const redirect = this.$cookies.get("redirect");
    if (this.$route.query.redirect) {
      this.$cookies.set("redirect", this.$route.query.redirect);
      window.location = this.$store.getters.env.authUrl;
    }
    if (this.$route.query.code) {
      this.$store
        .dispatch("authenticate", this.$route.query.code)
        .then(async (result) => {
          authAux.setToken(this, result.token);
          setTimeout(() => {
            this.$router.replace(redirect || this.$store.state.config.urls.game.games.path);
            this.$cookies.remove("redirect");
          }, 500)
        });
    }
  }
};
</script>