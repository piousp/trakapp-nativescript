<template>
  <Page class="page" @loaded="loaded">
    <ActionBar title="Tareas" class="action-bar">
      <android>
        <NavigationButton icon="res://bars" @tap="$refs.drawer.toggleSD();" />
      </android>
      <ios>
        <ActionItem icon="res://bars" ios.position="left" @tap="$refs.drawer.toggleSD();" />
      </ios>
      <StackLayout class="action-bar-title">
        <Label text="Tareas"
               color="white"
               fontSize="20px"
               verticalAlignment="center"
               style="font-weight: 500;"/>
      </StackLayout>
      <ActionItem ios.position="right"
                  android.position="actionBar">
        <StackLayout class="action-item" width="50">
          <loc-rec/>
        </StackLayout>
      </ActionItem>
    </ActionBar>
    <side-drawer class="body" ref="drawer">
      <PullToRefresh @refresh="fetchData" ref="p2r">
        <ScrollView v-show="!cargando">
          <ListView class="list-group"
                    v-if="tareas.length > 0"
                    for="tarea in tareas"
                    separatorColor="transparent"
                    @itemTap="onItemTap"
                    style="background-color: rgb(0,0,0,0)">
            <v-template if="tarea">
              <GridLayout class="list-group-item" rows="auto, *" columns="60, *, 20">
                <Image
                  row="0"
                  col="0"
                  src="~/assets/images/locationPin.png"
                  class="thumb img-circle"
                  rowSpan="2"/>
                <Label row="0" col="1" :text="tarea.title" class="list-group-item-heading" />
                <Label row="1" col="1" :text="tarea.descripcion" class="list-group-item-text" />
                <Image row="0" col="2" rowSpan="2" src="~/assets/images/circle-solid.png" tintColor="green"
                       v-show="!!tarea.horaInicio"/>
              </GridLayout>
            </v-template>
          </ListView>
          <FlexboxLayout
            v-else
            flexDirection="column"
            verticalAlignment="middle">
            <Image src="~/assets/images/check-circle.png"
                   class="m-y-30"
                   width="250"
                   tintColor="darkgray" />
            <Label class="text-center" style="font-size: 20" color="lightgray">No hay tareas</Label>
          </FlexboxLayout>
        </ScrollView>
      </PullToRefresh>
    </side-drawer>
  </Page>
</template>
<script>
import * as appSettings from "tns-core-modules/application-settings";
import tareaApi from "./tareasApi.js";
import TareasForm from "./TareasForm.vue";
import { modificarBackButton, reestablecerBackButton } from "../../util/backButton";
import locationRecorder from "../compUtil/locationRecorder.vue";

function data() {
  return {
    tareas: [],
    cargando: true,
  };
}

export default {
  components: {
    "loc-rec": locationRecorder,
  },
  data,
  methods: {
    onItemTap,
    fetchData,
    loaded,
  },
};

function loaded() {
  modificarBackButton();
  this.fetchData();
}

function onItemTap(evento) {
  reestablecerBackButton();
  this.$navigateTo(
    TareasForm,
    {
      context: {
        propsData: {
          id: evento.item._id,
        },
      },
    }); //eslint-disable-line
  return evento;
}

function fetchData() {
  const comp = this;
  comp.$refs.p2r._nativeView.refreshing = true; //eslint-disable-line
  comp.cargando = true;
  const credenciales = JSON.parse(appSettings.getString("credenciales"));
  const id = credenciales.usuario._id;
  return tareaApi.listar(id)
    .then((resp) => {
      comp.tareas = resp.docs;
      comp.cargando = false;
      if (comp.$refs.p2r) {
        comp.$refs.p2r._nativeView.refreshing = false; //eslint-disable-line
      }
      return resp;
    })
    .catch(err => console.log(err));
}
</script>
