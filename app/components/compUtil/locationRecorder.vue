<template>
  <Image class="img-circle"
         :backgroundColor="colorActivo"
         stretch="aspectFit"
         src="~/assets/images/locationPin.png"
         tintColor="black" width="30"
         @tap="activar"/>
</template>

<script>
import { Feedback } from "nativescript-feedback";

const FB = new Feedback();

export default {
  data() {
    return {
      colorActivo: "gray",
      intervalo: null,
    };
  },
  computed: {
    enHorario() {
      return this.$store.state.variables.enHorario;
    },
    emitiendoManual() {
      return this.$store.state.variables.emitiendoManual;
    },
  },
  watch: {
    enHorario(val) {
      if (val) {
        this.empezarIntermitencia();
      } else {
        this.pararIntermitencia();
      }
    },
  },
  created() {
    if (this.enHorario || this.emitiendoManual) {
      this.empezarIntermitencia();
    }
  },
  methods: {
    empezarIntermitencia,
    pararIntermitencia,
    activar,
  },
};

function empezarIntermitencia() {
  const comp = this;
  this.intervalo = setInterval(() => {
    if (comp.colorActivo === "gray") {
      comp.colorActivo = "red";
    } else {
      comp.colorActivo = "gray";
    }
  }, 500);
}

function pararIntermitencia() {
  clearInterval(this.intervalo);
  this.colorActivo = "gray";
}

function activar() {
  const comp = this;
  if (!this.enHorario) {
    if (this.emitiendoManual) {
      return confirm({
        title: "Geolocalización",
        message: "Está a punto de desactivar la geolocalización fuera de horario. ¿Desea continuar?",
        okButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result) {
          comp.$store.commit("toggleEmisionManual");
          comp.pararIntermitencia();
        }
        return null;
      });
    }
    return confirm({
      title: "Geolocalización",
      message: "Está a punto de activar la geolocalización fuera de horario. ¿Desea continuar?",
      okButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result) {
        comp.$store.commit("toggleEmisionManual");
        comp.empezarIntermitencia();
        return FB.info({
          title: "Geolocalización",
          message: "Se ha activado la geolocalización manual.",
        });
      }
      return null;
    });
  }
  return FB.error({
    title: "Geolocalización",
    message: "No puede desactivar la geolocalización mientras esté en horario.",
  });
}
</script>
