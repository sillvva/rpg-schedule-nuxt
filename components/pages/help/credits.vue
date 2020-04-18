<template>
  <v-container>
    <h4 class="mb-3">
      <a href="https://www.mattdekok.dev/" target="_blank">My Website</a>
    </h4>
    <h4>Patrons/Donors</h4>
    <ul class="mb-3">
      <li>JmanX</li>
      <li v-for="(pledge, p) in pledges" :key="p">
        {{pledge.full_name}}
        <span
          v-if="pledge.vanity && !pledge.url.startsWith('https://www.patreon.com/user')"
        >
          (
          <a :href="pledge.url" target="_blank">{{pledge.vanity}}</a>
          )
        </span>
      </li>
    </ul>
    <h4>Code/Language Contributors</h4>
    <p class="mb-0">
      This list contains contributors who have added something to RPG Schedule. You can see the full list of contributors and their contributions
      <a
        href="https://github.com/sillvva/rpg-schedule/graphs/contributors"
        target="_blank"
      >here</a>.
    </p>
    <ul>
      <li>wilywyrm (Recurring Games Added)</li>
      <li>Manuoue (French Language Added)</li>
      <li>ILDaviz (Italian Language Added)</li>
      <li>Level8Broccoli (German Language Added)</li>
      <li>Rudolf J (Russian Language Added)</li>
    </ul>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      pledges: []
    }
  },
  mounted() {
    this.$store.dispatch("fetchPledges").then(result => {
      this.pledges = result.pledges;
    });
  }
};
</script>