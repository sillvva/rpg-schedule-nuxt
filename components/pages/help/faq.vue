<template>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>How does rescheduling work?</v-expansion-panel-header>
        <v-expansion-panel-content>
          <p>
            The rescheduled announcement will be posted X hours after the date/time of the current announcement, where
            X is the duration (or runtime) of the game (+/- 1 hour). If no duration is entered, it defaults to 0 hours.
          </p>
          <h4>Weekly</h4>
          <p class="mb-0">You enter: 3/25 (Wed) 9 am; Reschedule: Weekly, Friday; Duration: 2 hours</p>
          <ul>
            <li>First announcement says 3/25 (Wed) 9 am, posted manually</li>
            <li>Next announcement says 3/27 (Fri) 9 am, posted automatically at 3/25 11 am</li>
            <li>Next announcement says 4/3 (Fri) 9 am, posted automatically at 3/27 11 am</li>
          </ul>
          <p
            class="mt-3 mb-0"
          >The first announcement is always on the date you entered. Any following announcements will be based on the day(s) of the week selected.</p>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <!-- <v-expansion-panel>
        <v-expansion-panel-header>How do I create a game image?</v-expansion-panel-header>
        <v-expansion-panel-content>

        </v-expansion-panel-content>
      </v-expansion-panel> -->
    </v-expansion-panels>
  </v-container>
</template>