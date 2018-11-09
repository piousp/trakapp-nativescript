<template>
  <Page class="page">
    <ActionBar :title="tarea.title" class="action-bar" backgroundColor="#171616">
      <NavigationButton icon="res://arrow_left" @tap="$navigateBack" />
      <StackLayout class="action-bar-title">
        <Label :text="tarea.title"
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
    <side-drawer class="body">
      <ScrollView>
        <FlexboxLayout>
          <StackLayout class="form" backgroundColor="white">
            <StackLayout orientation="horizontal" class="m-t-10 p-x-20">
              <Label width="30%">Fecha tope</Label>
              <Label width="70%"
                     :text="tarea.end | fecha('DD/MM/YYYY hh:mm a')"/>
            </StackLayout>
            <StackLayout orientation="horizontal" class="m-t-10 p-x-20">
              <Label width="30%">Estado</Label>
              <StackLayout width="70%" v-show="!tarea.horaInicio" orientation="horizontal">
                <Image src="~/assets/images/circle-solid.png" height="15" tintColor="red"/>
                <Label text=" Inactiva"/>
              </StackLayout>
              <StackLayout width="70%" v-show="tarea.horaInicio" orientation="horizontal">
                <Image src="~/assets/images/circle-solid.png" height="15" tintColor="green"/>
                <Label text=" En progreso"/>
              </StackLayout>
            </StackLayout>
            <StackLayout class="hr-dark m-t-10 m-b-20"/>
            <Label
              class="h4 p-x-20"
              :text="tarea.descripcion"
              textWrap="true"/>
            <StackLayout v-show="tarea.subtareas" class="m-t-10 p-x-20">
              <StackLayout orientation="vertical">
                <Label class="font-weight-bold">Subtareas</Label>
                <Label class="footnote" v-show="!tarea.horaInicio">Tiene que iniciar la tarea para poder marcar subtareas</Label>
              </StackLayout>
              <StackLayout orientation="vertical" v-for="item in tarea.subtareas" :key="item._id">
                <FlexboxLayout justifyContent="space-between" alignItems="center" alignContent="center">
                  <CheckBox :checked="item.completado" @checkedChange="checkedChange(item)" fillColor="indigo"
                  :color="tarea.horaInicio ? 'black' : 'gray'" border-width="gray" :text="item.texto"
                  fontSize="16" :width="item.ubicacion ? '50%' : '60%'"
                  :isUserInteractionEnabled="tarea.horaInicio ? true : false" :isEnabled="tarea.horaInicio ? true : false"/>
                  <Image src="res://map" stretch="aspectFit" height="30"
                  v-show="item.ubicacion" @tap="abrirNavegador(item.ubicacion.coordinates)"/>
                </FlexboxLayout>
                <StackLayout class="hr-light m-y-5"/>
              </StackLayout>
            </StackLayout>
            <StackLayout class="m-t-10">
              <Button class="btn btn-primary"
                      v-show="!tarea.horaInicio"
                      @tap="iniciarTarea">Iniciar tarea</Button>
              <Button class="btn btn-primary"
                      v-show="tarea.horaInicio"
                      @tap="completarTarea">Completar tarea</Button>
              <Button class="btn btn-secondary"
                      @tap="abrirNavegador(tarea.ubicacion.coordinates)" v-show="tarea.usarUbicacion">Abrir mapa</Button>
            </StackLayout>
          </StackLayout>
        </FlexboxLayout>
      </ScrollView>
    </side-drawer>
  </Page>
</template>
<script>
import { Directions } from "nativescript-directions";
import { Feedback } from "nativescript-feedback";
import moment from "moment";
import tareaApi from "./tareasApi.js";
import Tareas from "./Tareas.vue";
import PostTareaForm from "./PostTareaForm.vue";
import locationRecorder from "../compUtil/locationRecorder.vue";

require("nativescript-vue").registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox, {
  model: {
    prop: 'checked',
    event: 'checkedChange',
  }
});

const FB = new Feedback();

const directions = new Directions();
directions.available().then(disp => console.log(disp ? "Si" : "No")).catch(err => console.log(err));

function data() {
  return {
    tarea: {
      cuenta: {},
      post: {}
    },
    PostTareaForm,
  };
}

export default {
  components: {
    "loc-rec": locationRecorder,
  },
  props: { id: { type: String, default: "" } },
  data,
  created,
  methods: {
    abrirNavegador,
    completarTarea,
    iniciarTarea,
    irATareas,
    checkedChange,
    guardarTarea,
  },
};

function created() {
  const comp = this;
  return tareaApi.obtener(comp.id)
    .then((resp) => {
      resp.horaInicio = !!resp.horaInicio ? resp.horaInicio : null;
      comp.tarea = resp;
      return resp;
    })
    .catch(err => console.log(err));
}

function abrirNavegador(coordinates) {
  directions.navigate({
    to: {
      lng: coordinates[0],
      lat: coordinates[1],
    },
  }).then(() => console.log("Maps app launched."))
    .catch(error => console.log(error));
}

function completarTarea() {
  const comp = this;
  this.$showModal(PostTareaForm)
    .then(post => {
      if (post) {
        return confirm({
          title: "Completar tarea",
          message: "¿Desea marcar esta tarea como completada?",
          cancelButtonText: "Cancelar",
          okButtonText: "Completar",
        })
          .then((result) => {
            if (result) {
              comp.tarea.post = post;
              return tareaApi.completar(comp.tarea)
                .then(() => {
                  FB.success({
                    title: "Tarea completada",
                    message: "La tarea se ha completado satisfactoriamente",
                  });
                  return comp.irATareas();
                })
                .catch(err => console.log(err));
            }
            return null;
          }).catch((err) => {
            console.log(err);
            return FB.error({
              title: "Algo pasó",
              message: "Por favor intente nuevamente",
            });
          })
      }
    })
    .catch((err) => {
      console.log(err);
      return FB.error({
        title: "Algo pasó",
        message: "Ocurrió un error al llenar el formulario",
      });
    });
}

function iniciarTarea() {
  const comp = this;
  confirm({
    title: "Iniciar tarea",
    message: "¿Desea iniciar esta tarea?",
    cancelButtonText: "Cancelar",
    okButtonText: "Iniciar",
  })
    .then((result) => {
      if (result) {
        return tareaApi.iniciar(comp.id)
          .then((resp) => {
            FB.success({
              title: "Tarea iniciada",
              message: "La tarea se inició satisfactoriamente",
            });
            comp.tarea = resp;
            return null;
          })
          .catch(err => console.log(err));
      }
      return null;
    }).catch((err) => {
      console.log(err);
      return FB.error({
        title: "Algo pasó",
        message: "Por favor intente nuevamente",
      });
    });
}

function irATareas() {
  this.$navigateTo(Tareas, { clearHistory: true });
}

function checkedChange(item) {
  item.completado = !item.completado;
  if (item.completado) {
    item.fecha = moment();
  }
  this.guardarTarea();
}

function guardarTarea() {
  return tareaApi.guardar(this.tarea)
    .then((resp) => {
      this.tarea = resp;
      return null;
    })
    .catch(err => console.log(err));
}
</script>
