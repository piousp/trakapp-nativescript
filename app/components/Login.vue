<template>
  <Page actionBarHidden="true" @loaded="modificarBackButton">
    <ActionBar title="Login"/>
    <ScrollView>
      <FlexboxLayout class="page">
        <StackLayout class="form cuadro-ingreso">
          <Image src="~/assets/images/logo-peq-contra.png" stretch="aspectFit" />
          <StackLayout class="input-field" horizontalAlignment="left">
            <Label text="Correo electrónico" class="label"/>
            <TextField class="input" v-model="login.email" keyboardType="email"
                       returnKeyType="next" />
            <StackLayout class="hr-light"/>
            <Label text="* Este campo es requerido."
                   class="label--error"
                   v-show="!login.email && submitted"/>
            <Label text="* Formato de correo inválido."
                   class="label--error"
                   v-show="login.email && !validarCorreo(login.email) && submitted"/>
          </StackLayout>
          <StackLayout class="input-field">
            <Label text="Contraseña" class="label"/>
            <TextField secure="true" class="input"
                       v-model="login.password"
                       autocorrect="false"
                       returnKeyType="send"
                       @returnPress="flogin(login)"/>
            <StackLayout class="hr-light"/>
            <Label text="* Este campo es requerido."
                   class="label--error"
                   v-show="!login.password && submitted" />
          </StackLayout>

          <Button text="Iniciar Sesión" class="btn btn-primary" @tap="flogin(login)"/>
          <Label class="forgotLabel" text="¿Olvidó su contraseña?" color="white"
                 @tap="recuperarContrasena"/>
        </StackLayout>
      </FlexboxLayout>
    </ScrollView>
  </Page>
</template>

<script>
import { Feedback } from "nativescript-feedback";
import noop from "lodash/noop";
import Tareas from "./tareas/Tareas.vue";
import ActualizarPass from "./empleados/ActualizarPass.vue";
import { modificarBackButton, reestablecerBackButton } from "../util/backButton";

const FB = new Feedback();

function data() {
  return {
    login: {
      email: "",
      password: "",
    },
    submitted: false,
  };
}

function flogin(plogin) {
  this.submitted = true;
  if (validarForm(plogin)) {
    return this.$auth.login(plogin.email, plogin.password)
      .then((resp) => {
        if (resp.usuario) {
          FB.success({
            title: "Bienvenido",
            message: resp.usuario.nombre,
          });
          reestablecerBackButton();
          if (resp.usuario.nuevo) {
            return this.$navigateTo(ActualizarPass, { clearHistory: true });
          }
          return this.$navigateTo(Tareas, { clearHistory: true });
        }
        return FB.error({
          title: "Datos invalidos",
          message: "Correo o contraseña incorrectos",
        });
      })
      .catch((err) => {
        console.log(err);
        return FB.error({
          title: "Algo pasó",
          message: "Por favor intente nuevamente",
        });
      });
  }
  return FB.error({
    title: "Datos invalidos",
    message: "Tiene que ingresar todos los datos correctamente",
  });
}

function recuperarContrasena() {
  prompt({ //eslint-disable-line
    cancelButtonText: "Cancelar",
    inputType: "email",
    message: "Ingrese su correo electrónico",
    okButtonText: "Recuperar",
    title: "Recuperar constraseña",
  })
    .then((resp) => {
      if (resp.result && resp.text) {
        return this.$auth.solicitarCambio(resp.text)
          .then(() => FB.success({
            title: "Éxito",
            message: "Se le envió un correo para recuperar su cuenta",
          }))
          .catch((err) => {
            console.log(err);
            return FB.error({
              title: "Algo pasó",
              message: "Por favor intente nuevamente",
            });
          });
      }
      if (resp.result && !resp.text) {
        return FB.error({
          title: "Datos invalidos",
          message: "Tiene que ingresar un correo valido",
        });
      }
      return noop();
    }) //eslint-disable-line
    .catch(resp => console.log(resp));
}

function validarCorreo(correo) {
  const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return correo && regEx.test(correo);
}

function validarForm(plogin) {
  return plogin.password && plogin.email && validarCorreo(plogin.email);
}

export default {
  data,
  methods: {
    flogin,
    recuperarContrasena,
    validarCorreo,
    modificarBackButton,
  },
};
</script>

<style lang="scss">
.page {
  background: transparentize(#222, .2);
  align-items: center;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  .label {
    color: #fff;
  }

  .label--error {
    color: #f44336;
    font-size: 12px;
  }

  .input {
    color: #fff;
    border-color: #fff;
  }
}
.form {
  margin: 0 auto;
  flex-grow: 2;
  vertical-align: middle;
  width: 75%;
}
.forgotLabel {
  padding-top: 75px;
  text-align: center;
}
</style>
