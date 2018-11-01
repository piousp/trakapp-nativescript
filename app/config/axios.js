import Vue from "nativescript-vue";
import VueAxios from "vue-axios";
import axios from "axios";

console.log(process.env);

const a = axios.create({
  //baseUrl: process.env.API_URL || "http://trakapp.ciriscr.com:7001",
  baseUrl: process.env.API_URL || "http://192.168.1.40:3001",
});

Vue.use(VueAxios, a);

export default a;
