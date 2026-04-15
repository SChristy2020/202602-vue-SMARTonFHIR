import { createRouter, createWebHistory } from "vue-router";
import LaunchView from "./views/LaunchView.vue";
import CallbackView from "./views/CallbackView.vue";
import PatientView from "./views/PatientView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "launch", component: LaunchView },
    { path: "/callback", name: "callback", component: CallbackView },
    { path: "/patient", name: "patient", component: PatientView },
  ],
});