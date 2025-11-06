<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <template v-slot:prepend>
        <v-img src="@/assets/logo.svg" width="35px" class="ml-2" />
      </template>

      <v-app-bar-title class="font-weight-bold">
        PSI-MOD Peptide Modifications Browser
      </v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script lang="ts" setup>
  //
</script>
