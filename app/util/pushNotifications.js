import Vue from "nativescript-vue";
import * as pushPlugin from "nativescript-push-notifications";
import { Feedback } from "nativescript-feedback";
import * as platformModule from "tns-core-modules/platform";
import api from "../components/empleados/empleadoApi";

const FB = new Feedback();

const androidSettings = {
  senderID: "424241979329",
  notificationCallbackAndroid(stringifiedData, fcmNotification) {
    const notificationBody = fcmNotification && fcmNotification.getBody();
    console.log(`Message received!\n${notificationBody}\n${stringifiedData}`);
    const data = JSON.parse(stringifiedData);
    if (!Vue.prototype.$store.state.variables.enChat && data.tipo === "chat") {
      return FB.info({
        title: "Mensaje nuevo",
        message: notificationBody,
      });
    } else if (data.tipo === "tarea") {
      return FB.info({
        title: "Tarea nueva",
        message: notificationBody,
      });
    }
    return null;
  },
};

const iosSettings = {
  badge: true,
  sound: true,
  alert: true,
  interactiveSettings: {
    actions: [{
      identifier: "READ_IDENTIFIER",
      title: "Read",
      activationMode: "foreground",
      destructive: false,
      authenticationRequired: true,
    }, {
      identifier: "CANCEL_IDENTIFIER",
      title: "Cancel",
      activationMode: "foreground",
      destructive: true,
      authenticationRequired: true,
    }],
    categories: [{
      identifier: "READ_CATEGORY",
      actionsForDefaultContext: ["READ_IDENTIFIER", "CANCEL_IDENTIFIER"],
      actionsForMinimalContext: ["READ_IDENTIFIER", "CANCEL_IDENTIFIER"],
    }],
  },
  notificationCallbackIOS(data) {
    alert("**********PUSH********* \n", `${JSON.stringify(data)}`);
  },
};

function registrarPush(pusuario) {
  const pushSettings = platformModule.isAndroid ? androidSettings : iosSettings;
  pushPlugin.register(pushSettings, (token) => {
    const usuario = {
      _id: pusuario._id,
      device: {
        token,
        platform: platformModule.isAndroid ? "Android" : "IOS",
      },
    };
    if (!platformModule.isAndroid && pushSettings.interactiveSettings) {
      pushPlugin.registerUserNotificationSettings(() => {
        console.log("IOS: Successfully registered for interactive push.");
      }, (err) => {
        console.log(`IOS: Error registering for interactive push: ${JSON.stringify(err)}`);
      });
    }
    return api.guardar(usuario).then(() => console.log(`Device registered. Access token: ${token}`)).catch(() => { console.log("Error registrando dispositivo"); });
  }, (error) => { console.log(error); });
}

export default registrarPush;
