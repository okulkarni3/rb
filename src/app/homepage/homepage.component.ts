import { Component, OnInit, inject, Inject } from '@angular/core';
import { HandleAuthService } from '../handle-auth.service';
import { Subscription } from 'rxjs';
import { HandFbService } from '../hand-fb.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css',
'../../../node_modules/codemirror/lib/codemirror.css',
'../../../node_modules/codemirror/theme/yeti.css']
})
export class HomepageComponent implements OnInit {

  loggedInUser: {};
  usersPosts;
  suggested;
  suggestionsByPost = new Map();
  id : string;
  suggestion: string;
  invitedPosts: [any];
  invitedPostIds: Set<any>;
  userSub: Subscription;
  postsSub: Subscription;
  suggestionSub: Subscription;
  reviewers:any;

  constructor(private authServ: HandleAuthService, public dialog: MatDialog,
    private handleFbService: HandFbService, private snackBar: MatSnackBar,private router: Router,
    private route:ActivatedRoute) { }

  getPostsRoute() {
    return this.route.snapshot.queryParamMap.get("posts");
  }

  routeOnEmptyPosts() {
   // this.router.navigate(["/homepage"],{
   //   queryParams:{
    //    posts:"invitedPosts"
     // }
    //});
  }

  ngOnInit() {
    if(this.authServ.afAuth.auth.currentUser != undefined) {
      this.id = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
      this.handleFbService.setLoggedInUserName();
      this.handleFbService.queryAllUsersByLoggedInUserTeam();
    }
    if(this.id != undefined) {
      this.getUserDetails(); 
      this.postsSub = this.handleFbService.queryLoggedinUsersPosts().subscribe((post)=> {
        this.usersPosts = post;
        post.forEach(element => {
          this.handleFbService.getSuggestionsByPostId(element["postId"]).subscribe( sugg => {
            this.suggestionsByPost.set(element["postId"],sugg);
          });
        });
      });
    }
  }

  getUserDetails() {
    this.userSub= this.handleFbService.getObject('Users/'+this.id).subscribe((user)=>{
      this.loggedInUser = user;
      this.handleFbService.loggedInUser = user;
   });
  }

  addSuggestion(post, suggestion){
    if(suggestion.value != "" && suggestion.value != undefined && suggestion.value != null) {
    this.handleFbService.addSuggestionForPostId(post.postId, suggestion.value);
    suggestion.value = "";
    this.suggested = false;
    } else {
      this.snackBar.open("Not a valid suggestion","Done",{
        duration: 2000
      })
    }
  }

  addRecommend(sugg:any){
      this.handleFbService.increaseRecommendBySuggId(sugg);
  }

  deletePostById(postId: string) {
    this.handleFbService.deletePostById(postId);
  }

  getReviewers(postId: string) {
    
      var userNames = new Set<any>();
      this.handleFbService.usersOfSameTeam.subscribe((users)=>{
       users.forEach((user)=>{
        if (user.id != JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid
            && !user.invitedPosts.includes(postId)) {
          userNames.add(user);
        }
       });
    });
    const dialogRef = this.dialog.open(AddReviewerDialog,{
      width:'100%',
      data: {postId:postId, users: userNames},
    });
  }

  ngOnDestroy() {
    if(this.userSub != undefined) {
      this.userSub.unsubscribe();
      if(this.handleFbService.invitedPostsSub != undefined){
        this.handleFbService.invitedPosts = new Array();
        this.handleFbService.invitedPostsSub.unsubscribe();
        this.handleFbService.loggedInUser = null;
        this.handleFbService.loggedInUserName = null;
        console.log("unsubscribed from invitedPosts");
      }
      if(this.handleFbService.invitedPostSuggSub != undefined){
        this.handleFbService.invitedPostSuggestions = new Map();
        this.handleFbService.invitedPostSuggSub.unsubscribe();
        console.log("unsubscribed from invitedPostsSugg");
      }
    }
    if( this.postsSub != undefined){
      this.postsSub.unsubscribe();
      console.log("unsubscribed from Myposts");
    }
    if(this.suggestionSub != undefined) {
    this.suggestionSub.unsubscribe();
    console.log("unsubscribed from MyPostsSugg");
    }
  }
}

@Component({
  selector:'Add-Reviewer-Dialog',
  templateUrl:'Add-Reviewer-Dialog.html'
})
export class AddReviewerDialog {

  selectedReviewers = new Set();
  postId: string;
  constructor(
    private handleFbService: HandFbService,
    public dialogRef: MatDialogRef<AddReviewerDialog>,
    @Inject (MAT_DIALOG_DATA) public data: string[]
  ) {}

  addSelectedReviewer(id: string, postId: string) {
    this.postId = postId;
    if(this.selectedReviewers.has(id)) {
      this.selectedReviewers.delete(id);
    } else {
    this.selectedReviewers.add(id);
    }
  }

  onNoClick(): void {
    this.selectedReviewers = new Set();
    this.postId = null;
    this.dialogRef.close();
  }

  inviteReviewers() {
    if(this.selectedReviewers.size > 0 && this.postId != null) {
      this.handleFbService.inviteReviewers(this.selectedReviewers, this.postId);
      this.selectedReviewers = new Set();
      this.postId = null;
      this.dialogRef.close();
    }
  }
}