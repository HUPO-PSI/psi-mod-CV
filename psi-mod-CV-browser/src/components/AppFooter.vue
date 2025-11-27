<template>
  <v-footer
    app
    height="40"
    class="d-flex justify-space-between"
  >
    <a
      v-for="item in items"
      :key="item.title"
      class="d-inline-block mx-2 social-link"
      :href="item.href"
      rel="noopener noreferrer"
      target="_blank"
      :title="item.title"
    >
      <v-icon
        :icon="item.icon"
        :size="item.icon === '$vuetify' ? 24 : 16"
      />
    </a>

    <div
      v-if="obo.dataVersion"
      class="text-caption text-medium-emphasis"
    >
      PSI-MOD data version: {{ obo.dataVersion }}
    </div>
    <div
      class="text-caption text-disabled"
    >
      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">HUPO PSI</span>
      —
      <a
        class="text-decoration-none on-surface"
        href="https://github.com/HUPO-PSI/psi-ms-CV/blob/master/Licence.txt"
        rel="noopener noreferrer"
        target="_blank"
      >
        Creative Commons Attribution
      </a>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
  import { useOboStore } from '@/stores/obo'
  const obo = useOboStore()

  const items = [
    {
      title: 'GitHub',
      icon: `mdi-github`,
      href: 'https://github.com/HUPO-PSI/psi-ms-CV',
    },
  ]
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>
