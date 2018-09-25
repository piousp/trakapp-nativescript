import ActualizarPass from "./ActualizarPass.vue";
import Perfil from "./Perfil.vue";

export default [
  {
    path: "/actualizarpass",
    name: "actualizarpass",
    component: ActualizarPass,
    meta: {
      title: "Actualizar contraseña",
      publica: true,
      esconder: true,
    },
  },
  {
    path: "/perfil",
    name: "perfil",
    component: Perfil,
    meta: {
      title: "Mi Perfil",
      icono: "res://user",
    },
  },
];
