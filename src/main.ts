import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'codemirror';
import 'codemirror/mode/javascript/javascript';
//import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/merge/merge';
import 'codemirror/addon/display/fullscreen'

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
