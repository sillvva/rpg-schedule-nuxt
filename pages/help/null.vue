<template></template>

<script>
export default {
  head: {
    title: "Redirecting..."
  },
  mounted() {
    this.$router.redirect("/help");
  }
};
</script>