import axios from "../../config/axios";

function yo() {
  return axios
    .get(`${axios.defaults.baseUrl}/api/empleado/yo`)
    .then(resp => resp.data);
}

function guardar(obj) {
  return axios
    .put(`${axios.defaults.baseUrl}/api/empleado/${obj._id}`, obj)
    .then(resp => resp.data);
}

function verificarPasswordCorrecto(password) {
  return axios
    .post(`${axios.defaults.baseUrl}/api/auth/verificarPasswordCorrecto/movil`, { password })
    .then(resp => resp.data);
}

export default {
  yo,
  guardar,
  verificarPasswordCorrecto,
};
