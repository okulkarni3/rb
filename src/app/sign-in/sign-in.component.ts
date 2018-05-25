import { Component, OnInit } from '@angular/core';
import { HandleAuthService } from '../handle-auth.service';
import { MatSnackBar, MatInput } from '@angular/material';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  constructor(private authService: HandleAuthService, public snackBar: MatSnackBar) { }
  public email: string;
  public pwd: string;
  signIn() {
    if(this.email == null || this.email == "") {
      this.openSnackBar("Email is required","Done");
    }
    else if(this.pwd == null || this.pwd == ""){
      this.openSnackBar("Password is required","Done");
    } else {
      this.authService.login(this.email, this.pwd);
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000
    });
  }
  singOut() {
    this.authService.logout();
  }

  ngOnInit() {
  }

}
