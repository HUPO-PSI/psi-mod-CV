<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <template #prepend>
        <v-img class="ml-2" src="@/assets/logo.svg" width="35px" />
      </template>

      <v-app-bar-title class="font-weight-bold">
        PSI-MOD Residue Modifications Browser
      </v-app-bar-title>

      <!-- Spacer pushes status to right side -->
      <v-spacer />
      <SmilesStatus class="mr-4" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script lang="ts" setup>
// Component auto-registered by unplugin-vue-components
</script>
