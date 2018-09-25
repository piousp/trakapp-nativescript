<template>
  <Page class="page" loaded="loaded">
    <ActionBar title="Mi Perfil" class="action-bar">
      <android v-if="!usuario.nuevo">
        <NavigationButton icon="res://bars" @tap="$refs.drawer.toggleSD();" />
      </android>
      <ios v-if="!usuario.nuevo">
        <ActionItem icon="res://bars" ios.position="left" @tap="$refs.drawer.toggleSD();" />
      </ios>
      <StackLayout class="action-bar-title">
        <Label text="Actualizar Contraseña"
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
    <side-drawer class="body" ref="drawer" v-if="!usuario.nuevo">
      <ScrollView>
        <StackLayout>
          <StackLayout backgroundColor="white">
            <StackLayout marginLeft="16" class="subtitulo" orientation="horizontal">
              <Label class="font-weight-bold"
                     text="Establezca una nueva contraseña"
                     textWrap="true"/>
            </StackLayout>
            <RadDataForm ref="passForm" :source="contrasena" :metadata="params" />
            <Button text="Actualizar" class="btn btn-primary" @tap="aceptar"/>
          </StackLayout>
        </StackLayout>
      </ScrollView>
    </side-drawer>
    <ScrollView v-else>
      <StackLayout>
        <StackLayout backgroundColor="white">
          <StackLayout marginLeft="16" class="subtitulo" orientation="horizontal">
            <Label class="font-weight-bold"
                   text="Establezca una nueva contraseña"
                   textWrap="true"/>
          </StackLayout>
          <RadDataForm ref="passForm" :source="contrasena" :metadata="params" />
          <Button text="Actualizar" class="btn btn-primary" @tap="aceptar"/>
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script>
import { Feedback } from "nativescript-feedback";
import Tareas from "../tareas/Tareas.vue";
import locationRecorder from "../compUtil/locationRecorder.vue";

const FB = new Feedback();

export default {
  components: {
    "loc-rec": locationRecorder,
  },
  data,
  methods: {
    aceptar,
    loaded,
  },
};

function data() {
  return {
    contrasena: {
      nueva: "",
      confirmar: "",
    },
    usuario: {},
    params: {
      commitMode: "Immediate",
      validationMode: "Manual",
      propertyAnnotations:
      [
        {
          name: "nueva",
          displayName: "Nueva contraseña",
          index: 0,
          editor: "Password",
          required: true,
          validators: [
            {
              name: "NonEmpty",
              params: {
                errorMessage: "Este campo es requerido.",
              },
            },
          ],
        },
        {
          name: "confirmar",
          displayName: "Confirmar contraseña",
          index: 1,
          editor: "Password",
          required: true,
          validators: [
            {
              name: "NonEmpty",
              params: {
                errorMessage: "Este campo es requerido.",
              },
            },
          ],
        },
      ],
    },
  };
}

function aceptar() {
  return this.$refs.passForm.nativeView.validateAll()
    .then((valido) => {
      if (!valido) {
        return null;
      }
      if (this.contrasena.nueva === this.contrasena.confirmar) {
        return this.$auth.actualizarContrasena(this.contrasena.nueva).then(() => {
          FB.success({
            title: "Éxito",
            message: "Perfil actualizado exitosamente",
          });
          return this.$navigateTo(Tareas, { clearHistory: true });
        });
      }
      return FB.error({
        title: "Contraseña",
        message: "La contraseña no coincide",
      });
    });
}

function loaded() {
  this.usuario = this.$auth.getCredenciales().usuario;
}
</script>
