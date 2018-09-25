import axios from "../../config/axios";

function listar(id) {
  return axios
    .get(`${axios.defaults.baseUrl}/api/tarea/empleado/${id}`)
    .then(resp => resp.data);
}

function obtener(id) {
  return axios
    .get(`${axios.defaults.baseUrl}/api/tarea/${id}`)
    .then(resp => resp.data);
}

function guardar(obj) {
  if (obj._id) {
    return axios
      .put(`${axios.defaults.baseUrl}/api/tarea/${obj._id}`, obj)
      .then(resp => resp.data);
  }
  return axios
    .post(`${axios.defaults.baseUrl}/api/tarea`, obj)
    .then(resp => resp.data);
}

function eliminar(id) {
  return axios.delete(`${axios.defaults.baseUrl}/api/tarea/${id}`);
}

function completar(tarea) {
  return axios.put(`${axios.defaults.baseUrl}/api/tarea/completar/${tarea._id}`, tarea);
}

function iniciar(id) {
  return axios
    .put(`${axios.defaults.baseUrl}/api/tarea/iniciar/${id}`)
    .then(resp => resp.data);
}

const api = {
  listar,
  obtener,
  guardar,
  eliminar,
  completar,
  iniciar,
};

export default api;
