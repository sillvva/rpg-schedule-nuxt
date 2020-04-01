<template>
  
</template>

<script>
import { updateToken } from '../../../components/auth';

export default {
  middleware: ["check-auth", "authenticated"],
  head: {
    title: "Upcoming Games"
  },
  mounted() {
    updateToken(this);
  }
}
</script>