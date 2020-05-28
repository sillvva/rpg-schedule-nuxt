<template>
  <v-app>
    <v-flex class="d-flex" justify-center align-center style="height: 100%;">
      <v-progress-circular v-if="!error" :size="100" :width="7" color="discord" indeterminate></v-progress-circular>
      <div v-else>
        <h3>Error:</h3>
        <div class="error_description" v-html="error"></div>
      </div>
    </v-flex>
  </v-app>
</template>

<script>
import authAux from "../../assets/auxjs/auth";

export default {
  layout: "loading",
  data() {
    return {
      error: null
    }
  },
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
        }, 1000);
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
          if (result.status === "success") {
            authAux.setToken(this, result.token);
            setTimeout(() => {
              this.$cookies.remove("redirect", { path: "/" });
              this.$router.replace(
                redirect || this.$store.state.config.urls.game.games.path
              );
            }, 500);
          }
          else {
            this.error = result.message;
          }
        });
    }
  }
};
</script>

<style scoped>
  .error_description {
    border: 1px solid #888;
    background: #444;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
    font-family: 'Courier New', Courier, monospace;
  }
</style>