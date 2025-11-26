/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Stores
import { useOboStore } from '@/stores/obo'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

// Preload OBO terms into Pinia store before mounting the app
const oboStore = useOboStore()
await oboStore.loadFromOBO()

app.mount('#app')
