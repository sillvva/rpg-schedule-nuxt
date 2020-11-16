<template>
  <div class="snackbar-container">
    <v-snackbar
      v-for="(bar, b) in snackBars"
      :key="b"
      :color="`${bar.color} darken-2` || `discord`"
      :timeout="bar.timeout * 1000 || 0"
      multi-line
      v-model="snackBar"
      style="position: static;"
    >
      <span v-html="bar.message"></span>
      <v-btn text dark @click="removeBar(b);">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      snackBar: true,
      snackBars: []
    };
  },
  computed: {
    storeSnackBars() {
      return this.$store.getters.snackBars;
    }
  },
  watch: {
    storeSnackBars: {
      handler: function(newVal) {
        this.snackBars = newVal;
      },
      immediate: true
    }
  },
  methods: {
    removeBar(bar) {
      this.$store.dispatch("removeSnackBar", bar);
    }
  }
};
</script>

<style scoped>
.snackbar-container {
  position: fixed;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-flow: column;
  align-items: flex-end;
}

.snackbar-container .v-snack {
  margin-top: 10px;
}

.snackbar-container .v-snack__content > span {
  max-width: 300px;
}
</style>