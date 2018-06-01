import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { MatSnackBarModule, MatStepperModule, MatToolbarModule, MatIconModule, MatInputModule, MatDividerModule, MatCardModule, MatButtonModule, MatGridListModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppRoutingModule } from './/app-routing.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    SignUpComponent,
    MainToolbarComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatInputModule,
    ReactiveFormsModule,
    MatStepperModule,
    BrowserAnimationsModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatGridListModule,
    MatCardModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
