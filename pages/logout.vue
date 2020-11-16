<template>
  
</template>

<script>
export default {
  layout: "noframe",
  mounted() {
    this.$store.dispatch("signOut").then(() => {
      this.$store.dispatch("removeToken", this.$cookies);
      this.$router.push("/", () => {
        // window.location.reload(true);
      });
    });
  }
};
</script>