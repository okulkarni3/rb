// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDTecfUvSfeVT4EiTuzi0L2kAfTA9p2uNQ",
    authDomain: "review-book-rb.firebaseapp.com",
    databaseURL: "https://review-book-rb.firebaseio.com",
    projectId: "review-book-rb",
    storageBucket: "review-book-rb.appspot.com",
    messagingSenderId: "40882082283"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.