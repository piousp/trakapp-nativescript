<template>
  <RadSideDrawer ref="drawer" @drawerOpened="handleAbierto"
                 @drawerClosed="handleAbierto" :showOverNavigation="true">
    <StackLayout ~drawerContent backgroundColor="white">
      <DockLayout stretchLastChild="true" :height="tamanoLista">
        <StackLayout dock="top" height="180" class="header" @tap="enrutar({ item: rutas[0] })">
          <Image src="~/assets/images/icono.png" class="header-image"/>
          <Label :text="usuario.nombre + ' ' + usuario.apellidos" />
          <Label :text="usuario.correo" />
        </StackLayout>
        <Label dock="bottom" text="Cerrar sesión" color="gray" :padding="50"
               class="text-center" @tap="cerrarSesion" :height="50"/>
        <ListView dock="center" for="ruta in rutas" @itemTap="enrutar" separatorColor="transparent">
         <v-template>
           <StackLayout orientation="horizontal">
             <Image :src="`${ruta.icono}`"
                    stretch="none"/>
             <Label :text="ruta.title" verticalAlignment="center"/>
           </StackLayout>
         </v-template>
        </ListView>
      </DockLayout>
    </StackLayout>
    <GridLayout ~mainContent>
      <slot/>
    </GridLayout>
  </RadSideDrawer>
</template>
<script>
import * as platform from "tns-core-modules/platform";
import filter from "lodash/filter";
import Login from "./components/Login.vue";
import MiPerfil from "./components/empleados/Perfil.vue";
import Tareas from "./components/tareas/Tareas.vue";
import Mensajes from "./components/chat/ChatUsuarios.vue";
import Comunicados from "./components/chat/ChatDialogo.vue";
import { reestablecerBackButton } from "./util/backButton";

require("nativescript-vue").registerElement(
  "RadSideDrawer",
  () => require("nativescript-ui-sidedrawer").RadSideDrawer //eslint-disable-line
);

export default {
  data() {
    return {
      abierto: false,
      cargando: true,
      usuario: {
        nombre: "",
        correo: "",
      },
      rutas: [
        { title: "Mi Perfil", icono: "res://user", component: MiPerfil },
        { title: "Tareas", icono: "res://tasks", component: Tareas },
        { title: "Mensajes", icono: "res://comment_dots", component: Mensajes },
        { title: "Comunicados", icono: "res://comments", component: Comunicados },
      ],
      tamanoLista: 0,
    };
  },
  created() {
    this.tamanoLista = platform.screen.mainScreen.heightPixels;
    this.setUsuario();
  },
  methods: {
    setUsuario,
    enrutar,
    handleAbierto,
    cerrarSesion,
    filtrarRutas,
    toggleSD,
  },
};

function setUsuario() {
  this.usuario = this.$auth.getCredenciales().usuario;
}

function cerrarSesion() {
  this.$auth.logout();
  reestablecerBackButton();
  this.$navigateTo(Login, { clearHistory: true });
}

function enrutar(event) {
  const settings = {};
  if (event.item.title === "Comunicados") {
    settings.context = {
      propsData: {
        privado: false,
      },
    };
  } else if (event.item.title === "Tareas") {
    settings.clearHistory = true;
  }
  if (event.item.title !== "Tareas") {
    reestablecerBackButton();
  }
  this.$navigateTo(event.item.component, settings);
  this.$refs.drawer.nativeView.closeDrawer();
}

function handleAbierto() {
  this.abierto = !this.abierto;
  if (this.abierto) {
    this.setUsuario();
  }
}

function toggleSD() {
  if (this.abierto) {
    this.$refs.drawer.nativeView.closeDrawer();
  } else {
    this.$refs.drawer.nativeView.showDrawer();
  }
}

function filtrarRutas(rutas) {
  return filter(rutas, (v) => {
    if (v.meta.esconder) {
      return null;
    }
    return v;
  });
}
</script>
<style>
.header {
  text-align: center;
  vertical-align: center;
}

.header-image{
  display: block;
  border-radius: 50;
  border-color: gray;
  border-width: 0.5;
  min-height: 100;
  height: auto;
  width: 100;
}
</style>
