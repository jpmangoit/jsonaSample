// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: window["env"]["apiUrl"] || "default",
  debug: window["env"]["debug"] || false
};

export const serverUrl = 'http://localhost:8001/api/'
export const baseUrl = 'http://localhost:8001/api/api/';
export const backendBaseUrl = 'http://localhost:8001/'

export const fireStore = {
  apiKey: "AIzaSyC8iOcxDzuq-RdRufPOq9hSDeDurg7nEjE",
  authDomain: "friendlychat-97fd3.firebaseapp.com",
  databaseURL: "https://friendlychat-97fd3.firebaseio.com",
  projectId: "friendlychat-97fd3",
  storageBucket: "friendlychat-97fd3.appspot.com",
  messagingSenderId: "587050570367",
  appId: "1:587050570367:web:244c4636dbf2a9e47e654a"
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
