import { createApp } from "vue";
import "./tailwind.css";
import App from "./App.vue";
import { routes } from "./routes.js";
import { Buffer } from "buffer";
import { createRouter, createWebHistory } from "vue-router";
import Particles from "particles.vue3";
import mitt from "mitt";

window.Buffer = Buffer;

const emitter = mitt();
const app = createApp(App);

const router = createRouter({
    history: createWebHistory(),
    routes,
});

app.use(router);
app.use(Particles);
app.config.globalProperties.emitter = emitter;
app.mount("#app");
