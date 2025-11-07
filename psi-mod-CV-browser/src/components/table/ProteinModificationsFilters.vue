<template>
  <v-card elevation="2" rounded="lg" class="mb-2">
    <v-card-title class="bg-primary text-white d-flex align-end">
      <v-icon class="mr-2">mdi-magnify</v-icon>
      <div class="font-weight-bold">
        Filter peptide modifications
      </div>
      <v-spacer />
      <v-btn
        variant="outlined"
        color="white"
        size="small"
        prepend-icon="mdi-restore"
        class="text-none"
        @click="resetFilters"
      >
        Reset
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-col cols="12" md="12">
        <div class="text-xl-body-1 mb-4">
          Search and filter peptide modifications by ID, name, or definition.
          You can also view cross-references and SMILES structure for each modification.
        </div>
        <v-text-field
          v-model="search"
          density="comfortable"
          placeholder="Search modifications..."
          prepend-inner-icon="mdi-magnify"
          flat
          hide-details
          clearable
          class="search-field mb-4"
        />
        <div class="text-caption text-medium-emphasis mt-n2 mb-4">
          The search field supports free text search across all PSI-MOD term properties, including ID, name,
          definition, and synonyms. Enter any keyword to filter modifications.
        </div>

        <!-- Additional filters -->
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-4">
              <v-checkbox
                v-model="leafOnly"
                color="primary"
                label="Show only leaf nodes"
                density="compact"
                hide-details
              />
              <div class="text-caption text-medium-emphasis">
                Leaf terms are PSI-MOD entries without child terms. Enable this to hide higher-level grouping terms.
              </div>
            </div>
            <div>
              <v-checkbox
                v-model="hasSmilesOnly"
                color="primary"
                label="Show only terms with SMILES"
                density="compact"
                hide-details
              />
              <div class="text-caption text-medium-emphasis">
                Keep only modifications that have a SMILES notation in their cross-references, so you can preview a structure.
              </div>
            </div>

            <!-- Origin filter -->
            <div class="mt-4">
              <v-select
                v-model="selectedOrigin"
                :items="originOptions"
                label="Filter by Origin (amino acid)"
                multiple
                chips
                clearable
                density="comfortable"
                hide-details
              />
              <div class="text-caption text-medium-emphasis">
                The amino acid of origin on which the modification takes place. Clear to include all.
              </div>
            </div>

            <!-- TermSpec filter -->
            <div class="mt-4">
              <v-select
                v-model="selectedTermSpec"
                :items="termSpecOptions"
                label="Filter by TermSpec"
                multiple
                chips
                clearable
                density="comfortable"
                hide-details
              />
              <div class="text-caption text-medium-emphasis">
                Restrict to modifications with a specific TermSpec (e.g., N-term, C-term, Anywhere). Clear to include all.
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <RangeSliderInput
              v-model="diffMonoRange"
              label="Filter by DiffMono"
              :min="diffMonoMinMax.min"
              :max="diffMonoMinMax.max"
              :step="10"
              description="Difference in monoisotopic mass relative to the unmodified residue (in Da). Move the handles or enter values to restrict modifications by mass delta."
            />

            <RangeSliderInput
              v-model="massMonoRange"
              label="Filter by MassMono"
              :min="massMonoMinMax.min"
              :max="massMonoMinMax.max"
              :step="10"
              description="Absolute monoisotopic mass of the modified residue or moiety (in Da). Move the handles or enter values to limit the mass window."
            />
          </v-col>

          <!-- Small summary -->
          <v-col cols="12">
            <div class="text-caption text-medium-emphasis">
              Showing {{ filteredItems.length }} of {{ totalCount }} terms after applying filters.
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useProteinModificationsFilters } from '@/composables/useProteinModificationsFilters'
import RangeSliderInput from '@/components/common/RangeSliderInput.vue'

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
