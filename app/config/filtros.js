import Vue from "nativescript-vue";
import moment from "moment";

Vue.filter("colones", value => `₡${value.toLocaleString()}`);

Vue.filter("fecha", (value, format) => {
  if (value) {
    return moment(String(value)).format(format || "DD/MM/YYYY");
  }
  return "No definida";
});
