/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Stores
import { useOboStore } from '@/stores/obo'

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

// Preload OBO terms into Pinia store before mounting the app
const oboStore = useOboStore()
await oboStore.loadFromOBO()

app.mount('#app')
