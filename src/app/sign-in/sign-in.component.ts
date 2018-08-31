import { Component, OnInit } from '@angular/core';
import { HandleAuthService } from '../handle-auth.service';
import { MatSnackBar, MatInput, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  constructor(private authService: HandleAuthService 
    ,public dialog: MatDialog, public snackBar: MatSnackBar, private router: Router) { }
  public email: string;
  public pwd: string;

  signIn() {
    if(this.email == null || this.email == "") {
      this.openSnackBar("Email is required","OK");
    }
    else if(this.pwd == null || this.pwd == ""){
      this.openSnackBar("Password is required","OK");
    } else {
      this.authService.login(this.email, this.pwd);
    }
  }

  verifyEmailConfirmation(){
    this.authService.afAuth.auth.onAuthStateChanged((user)=>{
      if(user && !user.emailVerified){
        let snackBarRef = this.snackBar.open("Please verify email", "Send Again",{
          duration: 10000
        });
        snackBarRef.afterDismissed().subscribe((action)=>{
          if(action.dismissedByAction){
          user.sendEmailVerification();
          }
        });
      }
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000
    });
  }

  ngOnInit() {
    this.verifyEmailConfirmation();
    this.authService.afAuth.user.subscribe((user)=>{
      if(user) {
        this.router.navigateByUrl("/homepage?posts=myPosts");
      }
    })
  }

  openForgotPasswordDialog(): void {
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: "50%",
      data: ""
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != "" && result != null ){
      this.authService.afAuth.auth.sendPasswordResetEmail(result);
      }
    });
  }

  routeSignUp() {
    this.router.navigateByUrl("/signUp");
  }
}
