<template>
  
</template>

<script>
import { updateToken } from '../../components/auth';

export default {
  head: {
    title: "Upcoming Games"
  },
  mounted() {
    updateToken(this);
  }
}
</script>