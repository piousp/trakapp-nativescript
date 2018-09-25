import ChatDialogo from "./ChatDialogo.vue";
import ChatUsuarios from "./ChatUsuarios.vue";

export default [
  {
    path: "/room",
    name: "room",
    component: ChatDialogo,
    meta: {
      title: "Comunicados",
      icono: "res://comments",
      privado: false,
    },
  },
  {
    path: "/chat",
    name: "chatusuarios",
    component: ChatUsuarios,
    meta: {
      title: "Mensajes",
      icono: "res://comment_dots",
    },
  },
  {
    path: "/chat/dialogo/:id?",
    name: "chatdialogo",
    component: ChatDialogo,
    meta: {
      title: "Mensajes",
      icono: "res://comment_dots",
      esconder: true,
      privado: true,
    },
  },
];
