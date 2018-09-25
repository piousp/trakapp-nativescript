import Vue from "nativescript-vue";
import Vuex from "vuex";
import moment from "moment";

import variables from "./modules/variablesSistema";
import geolocalizacion from "./modules/geolocalizacion";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    variables,
    geolocalizacion,
  },
});

store.watch(state => state.variables.empleado, (val) => {
  if (val && val.horarios) {
    const dias = {
      1: "lunes",
      2: "martes",
      3: "miercoles",
      4: "jueves",
      5: "viernes",
      6: "sabado",
      0: "domingo",
    };
    const horario = val.horarios[dias[moment().format("d")]];
    const horaActual = moment().format("H");
    if (horario.desde <= horaActual && horario.hasta > horaActual) {
      return store.commit("setEnHorario", true);
    }
  }
  return store.commit("setEnHorario", false);
});

store.watch(state => state.variables.enHorario, () => {
  store.dispatch("enableLocationTap");
});

store.watch(state => state.variables.emitiendoManual, () => {
  store.dispatch("enableLocationTap");
});

Vue.prototype.$store = store;

export default store;
