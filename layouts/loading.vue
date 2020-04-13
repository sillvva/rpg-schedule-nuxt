<template>
  <v-app>
    <v-flex class="d-flex" justify-center align-center style="height: 100%;">
      <v-progress-circular :size="100" :width="7" color="discord" indeterminate></v-progress-circular>
      <nuxt />
    </v-flex>
  </v-app>
</template>