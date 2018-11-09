import * as application from "tns-core-modules/application";
import * as platformModule from "tns-core-modules/platform";
import isNil from "lodash/isNil";
import { makeText } from "nativescript-toast";
import moment from "moment";

let lastPress;
let listener;

function modificarBackButton() {
  if (platformModule.isAndroid) {
    if (isNil(listener)) {
      listener = application.android.on(
        application.AndroidApplication.activityBackPressedEvent,
        (args) => {
          args.cancel = true;
          const timeDelay = 1000;
          if (lastPress + timeDelay > moment().valueOf()) {
            args.cancel = false;
          }
          makeText("Presione otra vez para salir").show();
          lastPress = moment().valueOf();
        }//eslint-disable-line
      );
    }
  }
}

function reestablecerBackButton() {
  if (platformModule.isAndroid) {
    application.android.off(application.AndroidApplication.activityBackPressedEvent, listener);
  }
}

export {
  modificarBackButton,
  reestablecerBackButton,
};
