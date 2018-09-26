import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HandleAuthService } from '../handle-auth.service';
import { Subscription, Observable, of } from 'rxjs';
import { HandFbService } from '../hand-fb.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatMenuTrigger } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from '../messaging.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { MagnifiedCodeModalComponent } from '../magnified-code-modal/magnified-code-modal.component';

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
  @ViewChild(MatMenuTrigger) cmMenu: MatMenuTrigger;

  constructor(private authServ: HandleAuthService, public dialog: MatDialog,
    private handleFbService: HandFbService, private snackBar: MatSnackBar, private router: Router,
    private route: ActivatedRoute, private messaging: MessagingService) { }

  getPostsRoute() {
    return this.route.snapshot.queryParamMap.get("posts");
  }

  ngOnInit() {
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

  openFullCode(pText: string) {
    const dialogRef = this.dialog.open(MagnifiedCodeModalComponent, {
      data: [pText, this.handleFbService.loggedInUser.name]
    });
  }
  //-------------Code mirror edit functions-----------------

  toggleFullscreen(mpcm, postId) {
    console.log(mpcm);
    if (mpcm.codeMirror.getOption("fullScreen")) {
      mpcm.codeMirror.setOption("readOnly", true);
      mpcm.codeMirror.setOption("fullScreen", false);
    } else {
      this.getInlineEdits(mpcm, postId);
      mpcm.codeMirror.setOption("fullScreen", true);
      mpcm.codeMirror.setSize("100%", "100%");
    }
  }

  createLineWidget(mpcm) {
    let doc = mpcm.codeMirror.getDoc();
    if (doc.somethingSelected()) {
      var suggestion = document.createElement("div");
      suggestion.appendChild(document.createTextNode(this.handleFbService.loggedInUser.name + " => " + doc.getSelection()));
      suggestion.className = "widget";
      suggestion.style.backgroundColor = "yellow";
      doc.replaceSelection("");
      doc.addLineWidget(doc.getCursor(true).line - 1, suggestion, { coverGutter: true });
    }
  }

  openCmMenu(event){
    event.preventDefault();
    this.cmMenu.openMenu();
  }

  getInlineEdits(cm, postId) {
    this.handleFbService.getInlineEditsByPostId(postId).subscribe((inlineEdit) => {
      inlineEdit.forEach((edit) => {
        this.addInlineEditToCm(cm, edit);
      });
    });
  }

  private addInlineEditToCm(cm, inlineEdit) {
    cm.codeMirror.refresh();
    let doc = cm.codeMirror.getDoc();
    if (doc.lineInfo(inlineEdit.line - 1).widgets === undefined) {
      this.addLineWidgetToCm(cm, inlineEdit);
    } else {
      let uniqueFlag = true;
      doc.lineInfo(inlineEdit.line - 1).widgets.forEach(widget => {
        if (uniqueFlag && widget.node.outerText !== (inlineEdit.byName + " => " + inlineEdit.edit)) {
          uniqueFlag = true;
        } else {
          uniqueFlag = false;
        }
      });
      if (uniqueFlag) {
        this.addLineWidgetToCm(cm, inlineEdit);
        uniqueFlag = true;
      }
    }
  }

  private addLineWidgetToCm(cm, inlineEdit) {
    let doc = cm.codeMirror.getDoc();
    var suggestion = document.createElement("div");
    suggestion.appendChild(document.createTextNode(inlineEdit.byName + " => " + inlineEdit.edit));
    suggestion.style.backgroundColor = "yellow";
    doc.addLineWidget(inlineEdit.line - 1, suggestion, { coverGutter: true });
  }

  toggleEditMode(mpcm) {
    if (mpcm.codeMirror.getOption("readOnly"))
      mpcm.codeMirror.setOption("readOnly", false);
    else
      mpcm.codeMirror.setOption("readOnly", true);
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