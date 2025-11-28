<template>
  <v-card class="mb-2" elevation="2" rounded="lg">
    <v-card-title class="bg-primary text-white d-flex align-end">
      <v-icon class="mr-2">mdi-magnify</v-icon>
      <div class="font-weight-bold">
        Filter residue modifications
      </div>
      <v-spacer />
      <v-btn
        class="text-none"
        color="white"
        prepend-icon="mdi-restore"
        size="small"
        variant="outlined"
        @click="resetFilters"
      >
        Reset
      </v-btn>
    </v-card-title>

    <v-card-text class="overflow-y-scroll d-flex flex-column" :style="lgAndUp ? 'height: calc(100vh - 200px);': ''">
      <v-col sm="12" lg="12">
        <div class="text-xl-body-1 mb-4">
          Search and filter peptide modifications by ID, name, or definition.
          You can also view cross-references and SMILES structure for each modification.
        </div>
        <v-text-field
          v-model="search"
          class="search-field mb-4"
          clearable
          density="comfortable"
          flat
          hide-details
          placeholder="Search modifications..."
          prepend-inner-icon="mdi-magnify"
        />
        <div class="text-caption text-medium-emphasis mt-n2 mb-4">
          The search field supports free text search across all PSI-MOD term properties, including ID, name,
          definition, and synonyms. Enter any keyword to filter modifications.
        </div>

        <!-- Additional filters -->
        <v-row>
          <v-col sm="12" md="6" lg="12">
            <div class="mb-4">
              <v-checkbox
                v-model="leafOnly"
                color="primary"
                density="compact"
                hide-details
                label="Show only leaf nodes"
              />
              <div class="text-caption text-medium-emphasis">
                Leaf terms are PSI-MOD entries without child terms. Enable this to hide higher-level grouping terms.
              </div>
            </div>
            <div>
              <v-checkbox
                v-model="hasSmilesOnly"
                color="primary"
                density="compact"
                hide-details
                label="Show only terms with SMILES"
              />
              <div class="text-caption text-medium-emphasis">
                Keep only modifications that have a SMILES notation in their cross-references, so you can preview a structure.
              </div>
            </div>

            <!-- Origin filter -->
            <div class="mt-4" style="width: 100%;">
              <v-select
                v-model="selectedOrigin"
                chips
                clearable
                density="comfortable"
                hide-details
                :items="originOptions"
                label="Filter by Origin Residue"
                multiple
              />
              <div class="text-caption text-medium-emphasis">
                The amino acid of origin on which the modification takes place. Clear to include all.
              </div>
            </div>

            <!-- TermSpec filter -->
            <div class="mt-4">
              <v-select
                v-model="selectedTermSpec"
                chips
                clearable
                density="comfortable"
                hide-details
                :items="termSpecOptions"
                label="Filter by Terminal Specification"
                multiple
              />
              <div class="text-caption text-medium-emphasis">
                Restrict to modifications with a specific TermSpec (e.g., N-term, C-term, Anywhere). Clear to include all.
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6" lg="12" class="mb-4">
            <RangeSliderInput
              v-model="diffMonoRange"
              description="Difference in monoisotopic mass relative to the unmodified residue (in Da). Move the handles or enter values to restrict modifications by mass delta."
              label="Filter by Monoisotopic Delta Mass"
              :max="diffMonoMinMax.max"
              :min="diffMonoMinMax.min"
              :step="10"
              class="mt-4"
            />

            <RangeSliderInput
              v-model="massMonoRange"
              description="Absolute monoisotopic mass of the modified residue (in Da). Move the handles or enter values to limit the mass window."
              label="Filter by Monoisotopic Mass"
              :max="massMonoMinMax.max"
              :min="massMonoMinMax.min"
              :step="10"
            />
          </v-col>
        </v-row>
      </v-col>
<!--      <v-spacer></v-spacer>-->
      <div :class="lgAndUp ? 'text-caption text-medium-emphasis mt-n6' : 'text-caption text-medium-emphasis'">
        Showing {{ filteredItems.length }} of {{ totalCount }} terms after applying filters.
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import RangeSliderInput from '@/components/common/RangeSliderInput.vue'
  import { useProteinModificationsFilters } from '@/composables/useProteinModificationsFilters'
  import { useDisplay } from 'vuetify'

  const { lgAndUp } = useDisplay();

  const {
    search,
    leafOnly,
    hasSmilesOnly,
    selectedOrigin,
    selectedTermSpec,
    diffMonoRange,
    massMonoRange,
    diffMonoMinMax,
    massMonoMinMax,
    originOptions,
    termSpecOptions,
    totalCount,
    filteredItems,
    resetFilters,
  } = useProteinModificationsFilters()
</script>

<style scoped>
.search-field :deep(.v-field) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
