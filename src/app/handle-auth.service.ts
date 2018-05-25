import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable({
  providedIn: 'root'
})
export class HandleAuthService {

  constructor(public afAuth: AngularFireAuth) { 
  }

  login(email: string, pwd: string) {
    this.afAuth.auth.signInWithEmailAndPassword(email, pwd);
  }

  logout() {
    this.afAuth.auth.signOut();
  }

}
