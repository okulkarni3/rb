import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatInput, MatStepper } from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { HandleAuthService } from '../handle-auth.service';
import { HandFbService } from '../hand-fb.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isLinear: false;
  team: string;

  constructor(public snackBar: MatSnackBar, private fbService: HandFbService, private afAuthService: HandleAuthService) {
   }

   valUserName(stepper) {
    if(this.userName === undefined || this.userName === "") {
      this.snackBar.open("Please provide your name","Done",{
        duration: 2000
      });
    } else {
      stepper.next();
    }
   }

   valConfirmPwd(stepper) {
     var valFlag: boolean = true;
    if((this.password === undefined && this.confirmPassword === undefined)
    || (this.password === "" && this.confirmPassword === "")) {
      this.snackBar.open("Please provide valid password","Done",{
        duration: 2000
      });
      valFlag = false;
    }

    if ((this.password != this.confirmPassword)){
      this.snackBar.open("Passwords do not match", "Done",{
        duration: 2000
      });
      valFlag = false;
    } else {
        valFlag = valFlag?true:false;
    }

    if(this.email === undefined || this.email === "") {
      valFlag = false;
      this.snackBar.open("Email cannot be empty","Done",{
        duration: 2000
      });
    }
    if(valFlag) {
      console.log(valFlag);
      stepper.next();
    }

  }

  signUp() {
      if(this.team === undefined || this.team === ""){
          this.snackBar.open("Contact administrator if you don't know your team's name","Done",{
            duration: 2000
          });
      } else {
          this.afAuthService.signUp(this.userName,this.email, this.confirmPassword).then((user)=>{
            if(user && user.emailVerified === false){
            user.sendEmailVerification();
            }
            this.fbService.createUserObject(this.userName, this.team);
          }).catch((error)=>{
            this.snackBar.open("Error signing you up. Contact admin","Done");
          });
    }
  }

  ngOnInit() {

  }

}