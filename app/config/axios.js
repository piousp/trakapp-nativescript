import Vue from "nativescript-vue";
import VueAxios from "vue-axios";
import axios from "axios";

console.log(process.env);

const a = axios.create({
  //baseUrl: process.env.API_URL || "http://trakapp.ciriscr.com:7001",
  baseUrl: process.env.API_URL || "http://192.168.1.38:3001",
});

/* a.interceptors.request.use((config) => {
  console.log(Vue.prototype.$Progress.start());
  return config;
}, (error) => {
  console.log(Vue.prototype.$Progress.fail());
  return Promise.reject(error);
});

a.interceptors.response.use((response) => {
  console.log(Vue.prototype.$Progress.finish());
  return response;
}, (error) => {
  console.log(Vue.prototype.$Progress.fail());
  return Promise.reject(error);
}); */

Vue.use(VueAxios, a);

export default a;
