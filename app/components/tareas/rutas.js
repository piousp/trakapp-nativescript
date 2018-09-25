import Tareas from "./Tareas.vue";
import TareasForm from "./TareasForm.vue";

export default [
  {
    path: "/tareas",
    name: "tareas",
    component: Tareas,
    meta: {
      title: "Tareas",
      icono: "res://tasks",
    },
  },
  {
    path: "/tareasForm",
    name: "tareasForm",
    component: TareasForm,
    meta: {
      title: "Tarea",
      esconder: true,
    },
  },
];
