import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { CodemirrorModule } from 'ng2-codemirror';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { MatSnackBarModule, MatTooltipModule, MatMenuModule, MatListModule, MatSidenavModule, MatDialogModule, MatExpansionModule, MatBadgeModule, MatStepperModule, MatToolbarModule, MatProgressSpinnerModule, MatIconModule, MatInputModule, MatDividerModule, MatCardModule, MatButtonModule, MatGridListModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppRoutingModule } from './/app-routing.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MainToolbarComponent, CreatNewPostDialog } from './main-toolbar/main-toolbar.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { CreatNewPostDialogComponent } from './creat-new-post-dialog/creat-new-post-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    SignUpComponent,
    MainToolbarComponent,
    HomepageComponent,
    LandingPageComponent,
    CreatNewPostDialog,
    CreatNewPostDialogComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule, 
    MatBadgeModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    AngularFirestoreModule,
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
    AppRoutingModule,
    CodemirrorModule
  ],
  entryComponents:[CreatNewPostDialog],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
