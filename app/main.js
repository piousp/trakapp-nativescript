import Vue from 'nativescript-vue';
import socketio from "vue-socket.io";
import * as appSettings from "tns-core-modules/application-settings";
import auth from "./config/auth.js";
import axios from "./config/axios";
import sideDrawer from "./sideDrawer.vue";

import Tareas from './components/tareas/Tareas';
import Login from './components/Login';

import store from './store';

import './styles.scss';
import "./config/filtros.js";

Vue.use(auth, axios);
Vue.component("sideDrawer", sideDrawer);
Vue.use(socketio, Vue.axios.defaults.baseUrl, store);

Vue.registerElement(
  "PullToRefresh",
  () => require("nativescript-pulltorefresh").PullToRefresh //eslint-disable-line
);

appSettings.setBoolean("enChat", false);
Vue.prototype.$auth.setHeaders();

const credenciales = Vue.prototype.$auth.getCredenciales();

console.log("Hay credenciales: ", !!credenciales);

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production');

new Vue({

  render: h => h('frame',[h(credenciales ? Tareas : Login)]),

  store,

}).$start();
