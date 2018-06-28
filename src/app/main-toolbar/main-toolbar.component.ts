import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HandleAuthService } from '../handle-auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { HandFbService } from '../hand-fb.service';
import { CreatNewPostDialogComponent } from '../creat-new-post-dialog/creat-new-post-dialog.component';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.css']
})
export class MainToolbarComponent implements OnInit {

  pText: string;
  pTitle: string;

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
    public dialog: MatDialog, private fbServ: HandFbService) {
   }

   signOut() {
     this.authServ.logout();
   }
  fbAuth: AngularFireAuth = this.authServ.afAuth;
  ngOnInit() {
  }

  createPost(pTitle: string, pText: string){
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

