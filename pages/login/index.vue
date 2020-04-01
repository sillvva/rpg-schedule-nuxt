<template></template>

<script>
import authAux from "../../components/auth";

export default {
  head: {
    title: "Loggin In"
  },
  activated() {},
  mounted() {
    this.$store
      .dispatch("authenticate", this.$route.query.code)
      .then(async (result) => {
        authAux.setToken(this, result.token);
        setTimeout(() => {
          this.$router.replace(this.$store.state.config.urls.game.games.path);
        }, 500)
      });
  }
};
</script>