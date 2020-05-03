<template></template>

<script>
import authAux from "../../components/auxjs/auth";

export default {
  layout: "loading",
  head: {
    title: "Logging In"
  },
  async mounted() {
    if (this.$route.query.error) {
      const message = this.$route.query.error_description;
      this.$cookies.remove("redirect", { path: "/" });
      this.$router.replace("/").then(() => {
        setTimeout(() => {
          this.$store.dispatch("addSnackBar", {
            message: message,
            color: "error darken-1"
          });
        }, 1000)
      });
    }
    if (this.$route.query.redirect) {
      this.$cookies.set("redirect", this.$route.query.redirect, { path: "/" });
      window.location = this.$store.getters.env.authUrl;
    }
    if (this.$route.query.code) {
      const redirect = this.$cookies.get("redirect");
      this.$store
        .dispatch("authenticate", this.$route.query.code)
        .then(async result => {
          authAux.setToken(this, result.token);
          setTimeout(() => {
            this.$cookies.remove("redirect", { path: "/" });
            this.$router.replace(
              redirect || this.$store.state.config.urls.game.games.path
            );
          }, 500);
        });
    }
  }
};
</script>