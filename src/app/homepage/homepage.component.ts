import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HandleAuthService } from '../handle-auth.service';
import { Subscription, Subject } from 'rxjs';
import { HandFbService } from '../hand-fb.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatMenuTrigger } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from '../messaging.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { CmModalMenuComponent } from '../cm-modal-menu/cm-modal-menu.component';
import { CmService } from '../cm.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css',
    '../../../node_modules/codemirror/lib/codemirror.css',
    '../../../node_modules/codemirror/theme/elegant.css']
})
export class HomepageComponent implements OnInit {

  loggedInUser: {};
  usersPosts;
  suggested;
  suggestionsByPost = new Map();
  id: string;
  suggestion: string;
  invitedPosts: [any];
  invitedPostIds: Set<any>;
  userSub: Subscription;
  postsSub: Subscription;
  suggestionSub: Subscription;
  reviewers: any;
  message;
  isFs: boolean = false;
  inlineEditsByPostId = new Map();
  pushIds = new Map();
  @ViewChild('cmMenuTrigger') cmMenuTrigger: MatMenuTrigger;
  cmMenuPosition = { x: '0px', y: '0px' };
  inlineEditsToSave = new Subject<{}>();
  inlineEditsToSaveObs = this.inlineEditsToSave.asObservable();
  inlineEditShown: boolean = false;


  constructor(private authServ: HandleAuthService, public dialog: MatDialog,
    private handleFbService: HandFbService, private snackBar: MatSnackBar, private router: Router,
    private route: ActivatedRoute, private messaging: MessagingService, private cmService: CmService) { }

  getPostsRoute() {
    return this.route.snapshot.queryParamMap.get("posts");
  }

  ngOnInit() {
    this.inlineEditShown = false;
    if (this.authServ.afAuth.auth.currentUser != undefined) {
      this.id = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
      this.handleFbService.setLoggedInUserName();
    }
    if (this.id != undefined) {
      this.getUserDetails();
      this.postsSub = this.handleFbService.queryLoggedinUsersPosts().subscribe((post) => {
        this.usersPosts = post;
        this.usersPosts.sort((a, b) => { a.timestamp - b.timestamp }).reverse();
        post.forEach(element => {
          if (element["postId"] != undefined) {
            this.handleFbService.getSuggestionsByPostId(element["postId"]).subscribe(sugg => {
              this.suggestionsByPost.set(element["postId"], sugg);
            });
          }
        });
      });
      this.messaging.getPermission();
      this.messaging.messaging.onMessage((message) => {
        console.log("Received Message");
        if (message != null) {
          let snackBarRef = this.snackBar.open("Your invited posts have changed.", "Show me", {
            duration: 3000
          });
          snackBarRef.afterDismissed().subscribe((action) => {
            if (action.dismissedByAction) {
              this.router.navigateByUrl("/homepage?posts=invitedPosts");
            }
          });
        }
      });
    }
    this.inlineEditsToSave.subscribe((edit) => {
      console.log(edit);
      this.handleFbService.saveInlineEdit(edit);
    });
  }

  getUserDetails() {
    this.userSub = this.handleFbService.getObject('Users/' + this.id).subscribe((user) => {
      this.loggedInUser = user;
      this.handleFbService.loggedInUser = user;
    });
  }

  addSuggestion(post, suggestion) {
    if (suggestion.value != "" && suggestion.value != undefined && suggestion.value != null) {
      this.handleFbService.addSuggestionForPostId(post.postId, suggestion.value);
      suggestion.value = "";
      this.suggested = false;
    } else {
      this.snackBar.open("Not a valid suggestion", "Done", {
        duration: 2000
      })
    }
  }

  addRecommend(sugg: any) {
    this.handleFbService.increaseRecommendBySuggId(sugg);
  }

  deletePostById(postId: string) {
    const dialogRef = this.dialog.open(AlertModalComponent, {
      width: '100%',
      data: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleFbService.deletePostById(postId);
      }
    });
  }

  getReviewers(postId: string) {
    var userNames = new Set<any>();
    this.handleFbService.queryAllUsersByLoggedInUserTeam();
    this.handleFbService.usersOfSameTeam.subscribe((users) => {
      users.forEach((user) => {
        if (user.id != JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid) {
          userNames.add(user);
        }
      });
    });
    const dialogRef = this.dialog.open(AddReviewerDialog, {
      width: '100%',
      data: { postId: postId, users: userNames },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined || result == "") {
        this.snackBar.open("It may take some time to update", "OK", {
          duration: 3000
        });
      }
    });
  }

  //-------------Code mirror edit functions-----------------

  contextMenuCall(cm, postId, event){
    event.preventDefault();
    let cmDialogRef = this.dialog.open(CmModalMenuComponent, {
      width: '20%',
      data: {cm: cm, postId: postId},
    });
    cmDialogRef.afterClosed().subscribe((result)=>{
      if(result){
        this.createLineWidget(cm,postId);
      }
    });
  }

  toggleFullscreen(mpcm, postId) {
    if(this.cmService.toggleFullscreen(mpcm)){
      this.getInlineEdits(mpcm,postId);
    }
  }

  createLineWidget(mpcm, postId) {
    if (!mpcm.codeMirror.getOption("readOnly")) {
      let doc = mpcm.codeMirror.getDoc();
      if (doc.somethingSelected()) {
        var suggestion = document.createElement("div");
        let inlineEdit = doc.getSelection();
        suggestion.appendChild(document.createTextNode(this.handleFbService.loggedInUser.name + " => " + inlineEdit));
        suggestion.className = "widget";
        suggestion.style.backgroundColor = "yellow";
        //add close button
        suggestion.appendChild(document.createElement("button"));
        let clsBtn = suggestion.getElementsByTagName("button")[0];
        clsBtn.className = "delBtn";
        var delFun = this.deleteInlineEdit;
        delFun.bind(this.deleteInlineEdit, doc);
        clsBtn.onclick = this.deleteInlineEdit.bind(null, doc);
        clsBtn.appendChild(document.createTextNode("x"));
        clsBtn.style.borderRadius = "50%";
        clsBtn.style.backgroundColor = "#ed705a";
        clsBtn.style.color = "white";
        clsBtn.style.position = "absolute";
        clsBtn.style.right = "0";
        clsBtn.style.textDecoration = "none";
        clsBtn.style.display = "inline-block";
        //end
        //add save button
        suggestion.appendChild(document.createElement("button"));
        let saveBtn = suggestion.getElementsByTagName("button")[1];
        saveBtn.className = "saveBtn";
        saveBtn.appendChild(document.createElement("div"));
        let matIcon = saveBtn.getElementsByTagName("div")[0];
        matIcon.appendChild(document.createTextNode("L"));
        matIcon.style.transform = "scaleX(-1) rotate(-35deg)";
        saveBtn.style.borderRadius = "50%";
        saveBtn.style.backgroundColor = "#4CAF50";
        saveBtn.style.color = "white";
        saveBtn.style.position = "absolute";
        saveBtn.style.right = "2%";
        saveBtn.style.textDecoration = "none";
        saveBtn.style.display = "inline-block";
        let edit = {
          postId: postId,
          line: doc.getCursor(true).line - 1,
          edit: inlineEdit,
          byName: this.handleFbService.loggedInUser.name
        }

        saveBtn.onclick = this.addInlineEdit.bind(null, doc, edit, this.inlineEditsToSave);
        //end
        doc.replaceSelection("");
        doc.addLineWidget(doc.getCursor(true).line - 1, suggestion, { coverGutter: true });
      }
    }
  }

  //Javascript methods
  addInlineEdit(doc, edit, inlineEditsToSave, event) {
    let cm = doc.getEditor();
    edit.line = cm.coordsChar({ left: event.clientX, top: event.clientY }, "window").line + 1;
    inlineEditsToSave.next(edit);

    let widgetNode = doc.lineInfo(cm.coordsChar({ left: event.clientX, top: event.clientY }, "window").line).widgets[0].node;
    widgetNode.removeChild(widgetNode.getElementsByClassName("saveBtn")[0]);
    widgetNode.removeChild(widgetNode.getElementsByClassName("delBtn")[0]);
  }

  deleteInlineEdit(doc, event) {
    let cm = doc.getEditor();
    doc.lineInfo(cm.coordsChar({ left: event.clientX, top: event.clientY }, "window").line).widgets[0].clear();
  }
  //End
  getInlineEdits(cm, postId) {
    this.cmService.getInlineEdits(cm,postId);
  }

  toggleEditMode(mpcm) {
    this.toggleEditMode(mpcm);
  }

  ngOnDestroy() {
    if (this.userSub != undefined) {
      this.userSub.unsubscribe();
      if (this.handleFbService.invitedPostsSub != undefined) {
        this.handleFbService.invitedPosts = new Array();
        this.handleFbService.invitedPostsSub.unsubscribe();
        this.handleFbService.loggedInUser = null;
        this.handleFbService.loggedInUserName = null;
      }
      if (this.handleFbService.invitedPostSuggSub != undefined) {
        this.handleFbService.invitedPostSuggestions = new Map();
        this.handleFbService.invitedPostSuggSub.unsubscribe();
      }
    }
    if (this.handleFbService.invitedReviewersSub != undefined) {
      this.handleFbService.invitedReviewersSub.unsubscribe();
    }
    if (this.handleFbService.uninvitedReviewersSub != undefined) {
      this.handleFbService.uninvitedReviewersSub.unsubscribe();
    }
    if (this.postsSub != undefined) {
      this.postsSub.unsubscribe();
    }
    if (this.suggestionSub != undefined) {
      this.suggestionSub.unsubscribe();
    }
  }

}

@Component({
  selector: 'Add-Reviewer-Dialog',
  templateUrl: 'Add-Reviewer-Dialog.html'
})
export class AddReviewerDialog {

  selectedReviewers = new Set();
  deselectedReviewers = new Set();
  postId: string;
  constructor(
    private handleFbService: HandFbService,
    public dialogRef: MatDialogRef<AddReviewerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  addSelectedReviewer(id: string, postId: string, checked: boolean) {
    this.postId = postId;
    if (checked) {
      this.selectedReviewers.add(id);
      this.deselectedReviewers.delete(id);
    } else {
      this.deselectedReviewers.add(id);
      this.selectedReviewers.delete(id);
    }
  }

  onNoClick(): void {
    this.selectedReviewers = new Set();
    this.postId = null;
    this.dialogRef.close();
  }

  inviteReviewers() {
    if (this.selectedReviewers.size > 0 && this.postId != null) {
      this.handleFbService.inviteReviewers(this.selectedReviewers, this.postId);
    }
    if (this.deselectedReviewers.size > 0 && this.postId != null) {
      this.handleFbService.uninviteReviewers(this.deselectedReviewers, this.postId);
    }
    this.selectedReviewers = new Set();
    this.postId = null;
    this.deselectedReviewers = new Set();
    this.dialogRef.close();
  }
}