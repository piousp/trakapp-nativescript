<template>
  <Page class="page" @loaded="loaded" @unloaded="unloaded">
    <ActionBar :title="userReceptor.nombre || 'Comunicados'" class="action-bar"
    backgroundColor="#171616">
      <android>
        <NavigationButton icon="res://bars" @tap="$refs.drawer.toggleSD();" />
      </android>
      <ios>
        <ActionItem icon="res://bars" ios.position="left" @tap="$refs.drawer.toggleSD();" />
      </ios>
      <StackLayout class="action-bar-title">
        <Label :text="userReceptor.nombre || 'Comunicados'"
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
      <GridLayout columns="*" rows="*,auto">
        <StackLayout v-if="cargando">
          <ActivityIndicator busy="true" alignSelf="center" color="lightgray"/>
        </StackLayout>
        <ListView row="0" padding="5"
                  ref="lista"
                  for="msj in mensajes"
                  separatorColor="transparent"
                  backgroundColor="transparent"
                  @itemLoading="cargarItems" v-else>
          <v-template>
            <StackLayout backgroundColor="transparent">

              <StackLayout :visibility="msj.emisor._id !== emisor._id ? 'visible' : 'collapsed'">
                <GridLayout width="100%" columns="*" rows="auto, 30" class="msg them">
                  <Label v-if="!privado" :text="msj.emisor.nombre"/>
                  <StackLayout orientation="horizontal">
                    <Image class="authorimg" width="30" height="30" stretch="aspectFill" verticalAlignment="top" tintColor="white" src="res://user" />
                    <Label :text="msj.texto"
                           textWrap="true"
                           verticalAlignment="top"
                           class="msg_text" />
                  </StackLayout>
                  <Label :text="msj.fechaEnvio | fecha('DD/MM/YYYY HH:mm')"
                         verticalAlignment="top" row="1" colSpan="2"
                         fontSize="10" color="white" class="text-left"
                         marginLeft="40"/>
                </GridLayout>
              </StackLayout>

              <StackLayout :visibility="msj.emisor._id === emisor._id ? 'visible' : 'collapsed'">
                <GridLayout columns="*" rows="auto, 30" class="msg me">
                  <StackLayout orientation="horizontal" horizontalAlignment="right">
                    <Label :text="msj.texto" class="msg_text"
                           textWrap="true" verticalAlignment="top" />
                    <Image class="authorimg" stretch="aspectFill"
                           height="30" width="30" verticalAlignment="top"
                           src="res://user" col="1" tintColor="white"/>
                  </StackLayout>
                  <Label :text="msj.fechaEnvio | fecha('DD/MM/YYYY HH:mm')"
                         verticalAlignment="top" row="1" col="1"
                         fontSize="10" color="white" class="text-right"
                         marginRight="40"/>
                </GridLayout>
              </StackLayout>

            </StackLayout>
          </v-template>
        </ListView>
        <GridLayout row="1" columns="*,auto">
          <TextView row="0" col="0"
                    v-model="mensaje"
                    class="texto--enviar"
                    textWrap="true"
                    editable="true"
                    hint="Escribir mensaje"
                    maxLength="100"
                    height="50"/>
          <Image src="res://paper_plane"
                 stretch="none"
                 backgroundColor="#3cb54c"
                 row="0"
                 col="1"
                 class="boton--enviar"
                 tintColor="#FFF"
                 verticalAlignment="center"
                 @tap="enviar(mensaje)"/>
        </GridLayout>
      </GridLayout>
    </side-drawer>
  </Page>
</template>

<script>
import moment from "moment";
import chatApi from "./chatApi";
import locationRecorder from "../compUtil/locationRecorder.vue";

export default {
  components: {
    "loc-rec": locationRecorder,
  },
  props: {
    user: {
      type: Object,
      default() {
        return {};
      },
    },
    privado: { type: Boolean, default: false },
  },
  data,
  methods: {
    enviar,
    scrollear,
    cargarItems,
    listar,
    agregarMensaje,
    loaded,
    unloaded,
  },
};

function data() {
  return {
    mensaje: null,
    mensajes: [],
    emisor: null,
    userReceptor: {},
    cargando: false,
    totalItems: 0,
    limiteItems: 20,
  };
}

function loaded() {
  this.$store.commit("toggleEnChat");
  this.cargando = true;
  this.$socket.on(this.privado ? "recibirMensaje" : "recibirBroadcast", this.agregarMensaje);
  this.emisor = this.$auth.getCredenciales().usuario;
  this.userReceptor = this.user || {};
  return this.listar(0)
    .then((msjs) => {
      chatApi.marcarComoLeidos(this.userReceptor._id);
      this.mensajes = msjs.docs;
      this.totalItems = msjs.cant;
      this.cargando = false;
      this.scrollear();
      return msjs;
    });
}

function unloaded() {
  this.$store.commit("toggleEnChat");
}


function enviar(txt) {
  const txtTrim = txt ? txt.trim() : null;
  if (!txtTrim) {
    return null;
  }
  const msj = {
    texto: txtTrim,
    emisor: this.emisor,
    modelo: "empleado",
    fechaEnvio: moment(),
  };
  if (this.privado) {
    msj.receptor = this.userReceptor._id;
  }
  const accion = this.privado ? "mensajeEnviado" : "broadcastEnviado";
  this.agregarMensaje(msj);
  this.mensaje = null;
  return chatApi.guardar(msj).then((resp) => {
    this.$socket.emit(accion, resp);
    return resp;
  });
}

function agregarMensaje(mensaje) {
  this.mensajes.push(mensaje);
  this.totalItems += 1;
  this.scrollear();
}

function scrollear() {
  this.$nextTick(() => {
    this.$refs.lista.$el.nativeView.scrollToIndex(this.mensajes.length - 1);
  });
}

function cargarItems(args) {
  if (args.index === 0 && this.totalItems > this.mensajes.length) {
    this.cargando = true;
    return this.listar(this.mensajes.length)
      .then((resp) => {
        this.mensajes = resp.docs.concat(this.mensajes);
        this.cargando = false;
        this.$nextTick(() => {
          this.$refs.lista.$el.nativeView.scrollToIndex(resp.docs.length);
        });
        return resp;
      });
  }
  return null;
}

function listar(cantMsjsCargados) {
  if (this.privado) {
    const em = this.emisor._id;
    const re = this.userReceptor._id;
    return chatApi.listarPrivado(cantMsjsCargados, this.limiteItems, em, re);
  }
  return chatApi
    .listarPublico(cantMsjsCargados, this.limiteItems);
}
</script>

<style lang="scss">
.msg {
  font-size: 14;
  padding: 5;
  color: white;
}

.me .msg_text {
  background-color: #3cb54c;
  color: white;
  padding: 8;
  margin-left: 40px;
  border-radius: 5;
}

.them .msg_text {
  background-color: #e0e0e0;
  color: #333;
  padding: 7;
  border-radius: 5;
  margin-right: 40;
}

.authorimg {
  margin: 0 5 5 5;
  width: 30;
  height: 30;
  border-radius: 15;
  border-color: white;
  border-width: 1;
}

.texto--enviar {
  padding: 5 10 5 10;
  border-radius: 20%;
  margin: 2 0 2 5;
  background-color: #FFF;
}

.boton--enviar {
  border-radius: 25%;
  margin: 2 5 2 5;
  height: 50;
}
</style>
