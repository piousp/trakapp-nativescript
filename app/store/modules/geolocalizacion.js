import Vue from "nativescript-vue";
import { Feedback } from "nativescript-feedback";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import moment from "moment";

const FB = new Feedback();

const state = {
  watch: null,
};

const mutations = {
  setWatch(pstate, newWatch) {
    pstate.watch = newWatch;
  },
  clearWatch(pstate) {
    pstate.watch = null;
  },
};

const actions = {
  enableLocationTap,
  detenerGeoLocalization,
};

function enableLocationTap(context) {
  geolocation.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      return geolocation.enableLocationRequest()
        .then(() => {
          console.log("GeoLocalizacion activa");
          return toggleGeoLocalizacion(context);
        })
        .catch((err) => {
          console.log("No se le dió permisos a la geolocalizacion"); // TODO: hay que ver si esto de verdad significa que no se le dio permisos
          return console.log(err);
        });
    }
    console.log("GeoLocalizacion activa");
    return toggleGeoLocalizacion(context);
  }).catch((err) => {
    console.log("No se ha iniciado el plugin de Geo y dió el siguiente error:");
    console.log(err);
    return enableLocationTap(context);
  });
}

function toggleGeoLocalizacion(context) {
  console.log("Iniciando Geo");
  const options = {
    desiredAccuracy: Accuracy.high,
    maximumAge: 5000,
    timeout: 20000,
    updateDistance: 1,
    updateTime: 3000,
    iosAllowsBackgroundLocationUpdates: true,
  };
  const success = (location) => {
    const { empleado } = context.rootState.variables;
    if (empleado && location) {
      const obj = {
        _id: empleado._id,
        cuenta: empleado.cuenta,
        ubicacion: {
          pos: { coordinates: [location.longitude, location.latitude] },
          lastUpdate: empleado.ubicacion ? empleado.ubicacion.lastUpdate : moment(),
        },
      };
      console.log("Emite posición: \n", obj.ubicacion.pos.coordinates.toString());
      return Vue.prototype.$socket.emit("actualizarPosicion", obj);
    }
    return null;
  };
  const error = err => console.log(err);
  const eh = context.rootState.variables.enHorario;
  const em = context.rootState.variables.emitiendoManual;
  if ((eh || em) && !context.state.watch) {
    context.commit("setWatch", geolocation.watchLocation(success, error, options));
    console.log("Geo iniciada");
  } else if (!eh && !em && context.state.watch) {
    detenerGeoLocalization(context);
    console.log("Geo detenida");
  }
}

function detenerGeoLocalization(context) {
  if (context.state.watch) {
    geolocation.clearWatch(context.state.watch);
    context.commit("clearWatch");
    FB.info({ title: "Geolocalización", message: "Se ha desactivado la geolocalización" });
  }
}

export default {
  state,
  mutations,
  actions,
};
