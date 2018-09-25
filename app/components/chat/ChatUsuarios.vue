<template>
  <Page class="page" @loaded="fetchData">
    <ActionBar title="Usuarios" class="action-bar">
      <android>
        <NavigationButton icon="res://bars" @tap="$refs.drawer.toggleSD();" />
      </android>
      <ios>
        <ActionItem icon="res://bars" ios.position="left" @tap="$refs.drawer.toggleSD();" />
      </ios>
      <StackLayout class="action-bar-title">
        <Label text="Usuarios"
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
        <ScrollView>
          <ListView class="list-group"
                    for="usuario in usuarios"
                    separatorColor="transparent"
                    @itemTap="abrirUsuario"
                    style="height:1250px; background-color: rgb(0,0,0,0)">
            <v-template if="usuario">
              <GridLayout class="list-group-item" rows="auto, *" columns="80, *, 80">
                <Image src="res://user"
                       stretch="aspectFit"
                       class="fa thumb img-circle"
                       row="0"
                       col="0"
                       rowSpan="2"/>
                <Label row="0" col="1" :text="usuario.nombre" class="list-group-item-heading" />
                <Label row="1" col="1" :text="usuario.correo" class="list-group-item-text" />
                <StackLayout row="0"
                             col="2"
                             rowSpan="2"
                             class="thumb img-circle"
                             width="30" height="30"
                             backgroundColor="red"
                             orientation="horizontal"
                             v-if="usuario.cantMensajesNoVistos > 0">
                  <Label :text="usuario.cantMensajesNoVistos" verticalAlignment="center"
                         horizontalAlignment="center"
                         class="text-center"
                         width="100%" color="white"/>
                </StackLayout>
              </GridLayout>
            </v-template>
          </ListView>
        </ScrollView>
      </PullToRefresh>
    </side-drawer>
  </Page>
</template>

<script>
import usuarioApi from "../usuarios/usuariosApi";
import ChatDialogo from "./ChatDialogo.vue";
import locationRecorder from "../compUtil/locationRecorder.vue";

export default {
  components: {
    "loc-rec": locationRecorder,
  },
  data,
  methods: {
    abrirUsuario,
    fetchData,
  },
};

function data() {
  return {
    usuarios: [],
    loading: true,
  };
}

function fetchData() {
  const comp = this;
  comp.$refs.p2r._nativeView.refreshing = true; //eslint-disable-line
  return usuarioApi.listarConMensajes().then((usuarios) => {
    comp.usuarios = usuarios.docs;
    comp.$refs.p2r._nativeView.refreshing = false; //eslint-disable-line
    return usuarios;
  });
}

function abrirUsuario(evt) {
  this.$navigateTo(
    ChatDialogo,
    {
      context: {
        propsData: {
          user: evt.item,
          privado: true,
        },
      },
    }); //eslint-disable-line
}
</script>
