/* eslint-disable */
import Vue from "nativescript-vue";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import * as application from "tns-core-modules/application";
import * as utils from "tns-core-modules/utils/utils";
import * as platform from "tns-core-modules/platform";
import moment from "moment";

let activo = null;

if (application.android) {
  const { sdkVersion } = platform.device;
  if (sdkVersion * 1 < 26) {
    android.app.Service.extend("com.ciriscr.trakapp.location.BackgroundService", {
      onStartCommand(intent, flags, startId) {
        this.super.onStartCommand(intent, flags, startId);
        return android.app.Service.START_STICKY;
      },
      onCreate() {
        console.log("onCreate");
        const {enHorario, emitiendoManual} = Vue.prototype.$store.state.variables;
        if ( enHorario || emitiendoManual ) {
          activo = geolocateWatch();
        }
      },
      onBind() {
        console.log("on Bind Services");
      },
      onUnbind() {
        console.log("UnBind Service");
      },
      onDestroy() {
        console.log("service onDestroy");
        geolocation.clearWatch(activo);
      },
    });
  } else {
    android.app.job.JobService.extend("com.ciriscr.trakapp.location.BackgroundService26", {
      onStartJob(params) {
        console.log("Job execution ...");
        const {enHorario, emitiendoManual} = Vue.prototype.$store.state.variables;
        if ( enHorario || emitiendoManual ) {
          console.log("Entra");
          if (!activo) {
            mostrarNotificacion();
          }
          geolocate();
          activo = true;
          this.jobFinished(params, true);
        }
        return false;
      },

      onStopJob() {
        console.log("Stopping job ...");
        activo = false;
        return true;
      },
    });
  }
}

const success = (location) => {
  const { empleado } = Vue.prototype.$store.state.variables;
  if (empleado && location) {
    const obj = {
      _id: empleado._id,
      cuenta: empleado.cuenta,
      ubicacion: {
        pos: { coordinates: [location.longitude, location.latitude] },
        lastUpdate: empleado.ubicacion ? empleado.ubicacion.lastUpdate : moment(),
      },
    };
    console.log("Emite posición BG: \n", obj.ubicacion.pos.coordinates.toString());
    return Vue.prototype.$socket.emit("actualizarPosicion", obj);
  }
  return null;
};

const error = (e) => {
  console.log(`Background watchLocation error: ${e.message || e}`);
};

const opts = {
  desiredAccuracy: Accuracy.high,
  updateDistance: 0.1,
  updateTime: 3000,
  minimumUpdateTime: 100,
};

function geolocateWatch() {
  return geolocation.enableLocationRequest()
    .then(() => geolocation.watchLocation(success, error, opts))
    .catch((e) => {
      console.log(`Background enableLocationRequest error: ${e.message || e}`);
    });
}

function geolocate() {
  return geolocation.enableLocationRequest().then(() => geolocation.getCurrentLocation({
    desiredAccuracy: Accuracy.high,
  })
    .then(success)
    .catch(error), (e) => {
    console.log(`Background enableLocationRequest error: ${e.message || e}`);
  });
}

function mostrarNotificacion() {
  const context = utils.ad.getApplicationContext();
  // The id of the channel.
  const channelId = "trakapp_geo_notification";

  const builder = new android.app.Notification.Builder(context, channelId);
  builder.setContentTitle("Geolocalización activa")
    .setAutoCancel(true)
    //.setSmallIcon(com.google.firebase.messaging.default_notification_icon)
    .setSmallIcon(android.R.drawable.ic_menu_compass)
    .setProgress(0, 0, true)
    .setOnlyAlertOnce(true);
  // will open main NativeScript activity when the notification is pressed
  // const mainIntent = new android.content.Intent(context, com.tns.NativeScriptActivity.class);

  const servicio = android.content.Context.NOTIFICATION_SERVICE;
  const mNotificationManager = context.getSystemService(servicio);

  // The user-visible name of the channel.
  const name = "Trakapp Geo";
  // The user-visible description of the channel.
  const description = "Canal para notificaciones de geolocalizacion de Trakapp";
  const importance = android.app.NotificationManager.IMPORTANCE_LOW;
  const mChannel = new android.app.NotificationChannel(channelId, name, importance);
  // Configure the notification channel.
  mChannel.setDescription(description);
  mChannel.enableLights(true);
  // Sets the notification light color for notifications posted to this
  // channel, if the device supports this feature.
  mChannel.setLightColor(android.graphics.Color.RED);
  mChannel.enableVibration(true);
  mChannel.setVibrationPattern([100, 200, 100]);
  mNotificationManager.createNotificationChannel(mChannel);

  builder.setChannelId(channelId);

  mNotificationManager.notify(1, builder.build());
}

application.on(application.suspendEvent, (args) => {
  console.log("application.suspendEvent");
  if (args.android) {
    Vue.prototype.$store.dispatch("detenerGeoLocalization");
    empezarBackground();
  }
});

application.on(application.launchEvent, (args) => {
  console.log("application.launchEvent");
  if (args.android) {
    detenerBackground();
    Vue.prototype.$store.dispatch("enableLocationTap");
  }
});

application.on(application.resumeEvent, (args) => {
  console.log("application.resumeEvent");
  if (args.android) {
    detenerBackground();
    Vue.prototype.$store.dispatch("enableLocationTap");
  }
});

function empezarBackground() {
  if (application.android) {
    const { sdkVersion } = platform.device;
    const context = utils.ad.getApplicationContext();
    if (sdkVersion * 1 < 26) {
      const intent = new android.content.Intent(context, com.ciriscr.trakapp.location.BackgroundService.class);
      console.log("startService");
      context.startService(intent);
    } else {
      const component = new android.content.ComponentName(context, com.ciriscr.trakapp.location.BackgroundService26.class);
      const builder = new android.app.job.JobInfo.Builder(1, component);
      builder.setRequiredNetworkType(android.app.job.JobInfo.NETWORK_TYPE_ANY);
      builder.setPeriodic(15 * 60 * 1000);
      const jobScheduler = context.getSystemService(android.content.Context.JOB_SCHEDULER_SERVICE);
      const service = jobScheduler.schedule(builder.build());
      BGids.push(service);
      console.log(`Job Scheduled: ${jobScheduler.schedule(builder.build())}`);
    }
  }
}

function detenerBackground() {
  if (application.android) {
    const { sdkVersion } = platform.device;
    const context = utils.ad.getApplicationContext();
    if (sdkVersion * 1 < 26) {
      const intent = new android.content.Intent(context, com.ciriscr.trakapp.location.BackgroundService.class);
      console.log("stopService");
      context.stopService(intent);
    } else {
      if (BGids.length > 0) {
        const jobScheduler = context.getSystemService(android.content.Context.JOB_SCHEDULER_SERVICE);
        const service = BGids.pop();
        jobScheduler.cancel(service);
        console.log(`Job Canceled: ${service}`);
      }
    }
  }
}
