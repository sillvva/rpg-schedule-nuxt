<template></template>

<script>
export default {
  middleware: 'redirect',
  head: {
    title: "Redirecting..."
  },
  created() {
    this.$route.params
  }
};
</script>