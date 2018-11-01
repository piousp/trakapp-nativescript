import Vue from "nativescript-vue";
import VueAxios from "vue-axios";
import axios from "axios";

console.log(process.env);

const a = axios.create({
  baseUrl: process.env.API_URL || "http://trakapp.ciriscr.com:7001",
});

Vue.use(VueAxios, a);

export default a;
