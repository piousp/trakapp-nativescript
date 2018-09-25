import * as appSettings from "tns-core-modules/application-settings";
import cloneDeep from "lodash/cloneDeep";
import registrarPush from "../util/pushNotifications";

const Auth = {
  install(Vue, axios) {
    Vue.auth = {
      login(login, password) {
        return axios
          .post(`${axios.defaults.baseUrl}/api/auth/login/movil`, {
            login,
            password,
          })
          .then((resp) => {
            if (!resp.status) {
              throw new Error();
            }
            this.setCredenciales(resp.data);
            console.log("Cuenta: ", resp.data.usuario.cuenta);
            axios.defaults.headers.common.Authorization = `Bearer ${resp.data.token}`;
            axios.defaults.headers.common.Cuenta = resp.data.usuario.cuenta;
            Vue.prototype.$store.commit("setEmpleado", resp.data.usuario);
            registrarPush(resp.data.usuario);
            return resp.data;
          })
          .catch(err => err);
      },

      logout() {
        appSettings.clear();
        Vue.prototype.$store.commit("setEmpleado", null);
        axios.defaults.headers.common.Authorization = null;
        return true;
      },

      setHeaders() {
        const credenciales = this.getCredenciales();
        if (credenciales && credenciales.token) {
          axios.defaults.headers.common.Authorization = `Bearer ${credenciales.token}`;
          this.refreshCredenciales();
          registrarPush(credenciales.usuario);
          return true;
        }
        return false;
      },

      getCredenciales() {
        const credenciales = appSettings.getString("credenciales");
        return credenciales ? JSON.parse(credenciales) : null;
      },

      setCredenciales(data) {
        appSettings.setBoolean("autenticado", true);
        appSettings.setString("credenciales", JSON.stringify(data));
      },

      solicitarCambio(correo) {
        return axios
          .post(`${axios.defaults.baseUrl}/api/auth/solicitarCambio/movil/`, { correo })
          .then(resp => resp.data)
          .catch(err => console.log(err));
      },

      actualizarContrasena(password) {
        return axios
          .put(`${axios.defaults.baseUrl}/api/auth/actualizarContrasena/movil/`, { password })
          .then(resp => resp.data)
          .catch(err => console.log(err));
      },

      refreshCredenciales() {
        return axios
          .get(`${axios.defaults.baseUrl}/api/empleado/yo`)
          .then((resp) => {
            const credenciales = this.getCredenciales();
            credenciales.usuario = cloneDeep(resp.data);
            this.setCredenciales(credenciales);
            Vue.prototype.$store.commit("setEmpleado", resp.data);
            return credenciales;
          })
          .catch(err => console.log(err));
      },
    };

    Object.defineProperties(Vue.prototype, {
      $auth: {
        get() {
          return Vue.auth;
        },
      },
    });
  },
};

export default Auth;
