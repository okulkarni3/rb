import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatInput, MatStepper } from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
  nameFormGroup: FormGroup;
  credFormGroup: FormGroup;

  constructor(public snackBar: MatSnackBar, private formBuilder: FormBuilder) {
   }

   valUserName(stepper) {
    if(this.userName === undefined || this.userName === "") {
      this.snackBar.open("Please provide a username","Done");
    } else {
      stepper.next();
    }
   }

   valConfirmPwd(stepper) {
     var pwdMatch: boolean = false;
    if((this.password === undefined && this.confirmPassword === undefined)
    || (this.password === "" && this.confirmPassword === "")) {
      this.snackBar.open("Please provide valid password","Done");
    }

    if ((this.password != this.confirmPassword)){
      this.snackBar.open("Passwords do not match", "Done");
    } else {
      pwdMatch = true;
    }

    if(this.email === undefined || this.email === "") {
      this.snackBar.open("Email cannot be empty","Done");
    }
    
    if(this.email != undefined && this.email != "" && pwdMatch) {
      stepper.next();
    }

  }
  ngOnInit() {
    this.nameFormGroup = this.formBuilder.group({
      userName: ['', Validators.required]
    });
    /*this.credFormGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });*/
  }

}