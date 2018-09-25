<template>
  <Page>
    <StackLayout>
      <GridLayout rows="auto" columns="75,*,75" class="action-bar p-10">
        <Image src="~/assets/images/times-circle.png" height="30"
               class="text-left" row="0" col="0" tintColor="red" @tap="cerrarSinEmitir"/>
        <Label text="Finalizar" class="text-center action-bar-title" row="0" col="1"/>
        <Image src="~/assets/images/check-circle.png" height="30"
               class="text-right" row="0" col="2" tintColor="green"
               @tap="cerrar"/>
      </GridLayout>
      <StackLayout height="30%" class="p-5">
        <Label>Apuntes</Label>
        <TextView hint="Ingrese apuntes adicionales"
                  returnKeyType="done"
                  autocorrect="true"
                  textWrap="true"
                  editable="true"
                  height="100%"
                  v-model="post.apuntes"/>
      </StackLayout>
      <StackLayout class="p-5">
        <Label>Firma</Label>
        <DrawingPad ref="dibujo" height="50%" class="bordeado"/>
      </StackLayout>
    </StackLayout>
  </Page>
</template>

<script>
import * as base64 from "base-64";

require("nativescript-vue").registerElement(
  "DrawingPad",
  () => require("nativescript-drawingpad").DrawingPad //eslint-disable-line
);

export default {
  data() {
    return {
      post: {},
    };
  },
  methods: {
    cerrar,
    cerrarSinEmitir,
  },
};

function cerrarSinEmitir() {
  return this.$modal.close();
}

function cerrar() {
  const comp = this;
  comp.$refs.dibujo._nativeView.getDrawingSvg() //eslint-disable-line
    .then((res) => {
      comp.post.firma = base64.encode(res);
      comp.$modal.close(comp.post);
      return res;
    })
    .catch(err => console.log(err));
}
</script>

<style lang="css">
.bordeado {
  border-width: 1px;
  border-color: black;
}
</style>
