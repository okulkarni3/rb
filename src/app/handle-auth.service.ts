import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class HandleAuthService {

  constructor(public afAuth: AngularFireAuth, public router: Router, public snackbar: MatSnackBar) { 
  }

  signUp(name: string, email: string, pwd: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email,pwd);
  }

  login(email: string, pwd: string) {
    this.afAuth.auth.signInWithEmailAndPassword(email, pwd).then(success =>{
      this.router.navigateByUrl("/homepage");
    })
    .catch(error=>{
      this.snackbar.open("Email and password do not match","Done",{
        duration:2000
      });
    });
  }

  logout() {
    this.afAuth.auth.signOut().then(success=>{
      this.router.navigateByUrl("/landingPage");
    });
  }

}
