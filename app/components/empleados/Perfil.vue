<template>
  <Page class="page">
    <ActionBar title="Mi Perfil" class="action-bar" backgroundColor="#171616">
      <android>
        <NavigationButton icon="res://bars" @tap="$refs.drawer.toggleSD();" />
      </android>
      <ios>
        <ActionItem icon="res://bars" ios.position="left" @tap="$refs.drawer.toggleSD();" />
      </ios>
      <StackLayout class="action-bar-title">
        <Label text="Mi Perfil"
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
      <ScrollView>
        <StackLayout>
          <StackLayout backgroundColor="white">
            <StackLayout marginLeft="16" class="subtitulo" orientation="horizontal">
              <Label class="font-weight-bold" text="Información"/>
            </StackLayout>
            <StackLayout>
              <RadDataForm ref="perfilForm" :source="perfil" :metadata="params" />
              <Button text="Guardar" class="btn btn-primary" @tap="guardar(perfil)"/>
            </StackLayout>
          </StackLayout>
          <StackLayout marginTop="15" backgroundColor="white">
            <StackLayout marginLeft="16" class="subtitulo" orientation="horizontal">
              <Label class="font-weight-bold" text="Cambiar contraseña"/>
            </StackLayout>
            <StackLayout marginLeft="16">
              <Label text="Contraseña actual"/>
              <TextField v-model="contrasenaActual" secure="true" hint="**********"/>
            </StackLayout>
            <Button text="Cambiar" class="btn btn-primary"
                    @tap="cambiar(contrasenaActual)"/>
          </StackLayout>
        </StackLayout>
      </ScrollView>
    </side-drawer>
  </Page>
</template>

<script>
import { Feedback } from "nativescript-feedback";
import empleadoApi from "./empleadoApi";
import ActualizarPass from "./ActualizarPass.vue";
import locationRecorder from "../compUtil/locationRecorder.vue";

require("nativescript-vue").registerElement(
  "RadDataForm",
  () => require("nativescript-ui-dataform").RadDataForm //eslint-disable-line
);

const FB = new Feedback();

export default {
  components: {
    "loc-rec": locationRecorder,
  },
  data,
  created,
  methods: {
    guardar,
    cambiar,
  },
};

function data() {
  return {
    perfil: {
      nombre: "",
      apellidos: "",
      correo: "",
    },
    contrasenaActual: "",
    params: {
      commitMode: "Manual",
      validationMode: "Manual",
      propertyAnnotations: [
        {
          name: "correo",
          readOnly: true,
        },
        {
          name: "nombre",
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
          name: "apellidos",
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

function created() {
  return empleadoApi.yo().then((resp) => {
    this.perfil = {
      nombre: resp.nombre,
      apellidos: resp.apellidos,
      correo: resp.correo,
    };
    return resp;
  });
}

function guardar() {
  return this.$refs.perfilForm.nativeView.validateAndCommitAll().then((valido) => {
    if (valido) {
      const temp = {
        _id: this.$refs.drawer.usuario._id,
        nombre: this.$refs.perfilForm.nativeView.getPropertyByName("nombre").valueCandidate,
        apellidos: this.$refs.perfilForm.nativeView.getPropertyByName("apellidos").valueCandidate,
      };
      return empleadoApi.guardar(temp).then((resp) => {
        this.$refs.drawer.usuario = resp;
        const nvosCreds = this.$auth.getCredenciales();
        nvosCreds.usuario = resp;
        this.$auth.setCredenciales(nvosCreds);
        FB.success({
          title: "Éxito",
          message: "Perfil actualizado exitosamente",
        });
        return resp;
      });
    }
    return null;
  });
}

function cambiar(clave) {
  return empleadoApi.verificarPasswordCorrecto(clave)
    .then(() => {
      this.$navigateTo(ActualizarPass);
      return null;
    })
    .catch(() => {
      FB.error({
        title: "Contraseña",
        message: "La contraseña no coincide",
      });
    });
}
</script>
