import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HandleAuthService } from '../handle-auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { HandFbService } from '../hand-fb.service';
import { MessagingService } from '../messaging.service';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.css']
})
export class MainToolbarComponent implements OnInit {

  pText: string;
  pTitle: string;
  userSub: any;
  fbAuth: AngularFireAuth;
  user: any;
  message: any;

  openDialog(): void {
    let dialogRef = this.dialog.open(CreatNewPostDialog, {
      width: '100%',
      data: { pText: this.pText, pTitle: this.pTitle }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('pTitle '+result.pTitle);
      this.createPost(result.pTitle, result.pText);
    }); 
  }
  
  constructor( private router: Router, public authServ: HandleAuthService,
    public dialog: MatDialog, private fbServ: HandFbService, public snackBar: MatSnackBar) {
   }

   getUserDetails() {
    this.userSub = this.fbServ.getObject('Users/'+JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid).subscribe(user=>{
        this.user = user;
    });
  }


   signOut() {
     this.authServ.logout();
   }
  

  ngOnInit() {
    this.fbAuth = this.authServ.afAuth;
    this.fbServ.setLoggedInUserName();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  createPost(pTitle: string, pText: string){
    this.fbServ.setLoggedInUserName();
    if(this.fbServ.loggedInUserName === "" || this.fbServ.loggedInUserName === undefined) {
      this.snackBar.open("Something went wrong please try again!","Okay",{
        duration: 2000
      });
    }
    this.fbServ.createPostForLoggedinUser(pTitle,pText);
  }

}

@Component({
  selector: 'newpost-dialog',
  templateUrl: 'newpost-dialogue.html',
})
export class CreatNewPostDialog {

  constructor(
    public dialogRef: MatDialogRef<CreatNewPostDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}