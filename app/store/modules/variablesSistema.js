import Vue from "nativescript-vue";
import cloneDeep from "lodash/cloneDeep";

const state = {
  enChat: false,
  connect: false,
  empleado: {},
  emitiendoManual: false,
  enHorario: false,
};

const mutations = {
  toggleEmisionManual(pstate) {
    pstate.emitiendoManual = !pstate.emitiendoManual;
  },
  toggleEnChat(pstate) {
    pstate.enChat = !pstate.enChat;
  },
  setEmpleado(pstate, pempleado) {
    pstate.empleado = pempleado;
  },
  setEnHorario(pstate, bool) {
    pstate.enHorario = bool;
  },
  SOCKET_CONNECT: (pstate) => {
    console.log("EMISION RECIBIDA: CONNECT");
    pstate.connect = !pstate.connect;
  },
  SOCKET_ACTUALIZAR: (pstate, pempleado) => {
    console.log("EMISION RECIBIDA: ACTUALIZAR");
    pstate.empleado = pempleado[0]; //eslint-disable-line
    actualizarUsuario(pempleado[0]);
  },
};

function actualizarUsuario(empleado) {
  const credenciales = Vue.prototype.$auth.getCredenciales();
  credenciales.usuario = cloneDeep(empleado);
  return Vue.prototype.$auth.setCredenciales(credenciales);
}

export default {
  state,
  mutations,
};
