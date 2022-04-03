import { createApp } from "vue";
import { store } from "@/store";
import "./tailwind.css";
import App from "./App.vue";
import { routes } from "./routes.js";
import { createRouter, createWebHistory } from "vue-router";
import Particles from "particles.vue3";
import mitt from "mitt";
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

const emitter = mitt();
const app = createApp(App);

const router = createRouter({
    history: createWebHistory(),
    routes,
});

Sentry.init({
    app,
    dsn: "https://c94881e975e34aefa866f836db5f0834@o855233.ingest.sentry.io/6153173",
    integrations: [
        new Integrations.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ["localhost", "algofractals.com", /^\//],
        }),
    ],
    tracesSampleRate: 1.0,
});

app.use(router);
app.use(store);
app.use(Particles);
app.config.globalProperties.emitter = emitter;
app.mount("#app");
