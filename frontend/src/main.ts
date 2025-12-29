import "@mdi/font/css/materialdesignicons.css";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import App from "./App.vue";
import router from "./router";
import "./styles.css";
// Importar configuração do axios para inicializar interceptors
import "@/config/axios";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
  },
});

const app = createApp(App);

app.use(vuetify);
app.use(router);

app.mount("#app");
//deploy teste
