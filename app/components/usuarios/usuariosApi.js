import axios from "../../config/axios";

function listar() {
  return axios
    .get(`${axios.defaults.baseUrl}/api/usuario`)
    .then(resp => resp.data);
}

function listarConMensajes() {
  return axios
    .get(`${axios.defaults.baseUrl}/api/usuario/conmensajes`)
    .then(resp => resp.data);
}

const api = {
  listar,
  listarConMensajes,
};

export default api;
