import { Component, OnInit } from '@angular/core';
import { HandleAuthService } from '../handle-auth.service';
import { Subscription } from 'rxjs';
import { HandFbService } from '../hand-fb.service';
import { MatSnackBar } from '@angular/material';
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

  constructor(private authServ: HandleAuthService, 
    private handleFbService: HandFbService, private snackBar: MatSnackBar,private router: Router,
    private route:ActivatedRoute) { }

  getPostsRoute() {
    return this.route.snapshot.queryParamMap.get("posts");
  }

  ngOnInit() {
    if(this.authServ.afAuth.auth.currentUser != undefined) {
      this.id = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
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

  ngOnDestroy() {
    if(this.userSub != undefined) {
      this.userSub.unsubscribe();
      if(this.handleFbService.invitedPostsSub != undefined){
        this.handleFbService.invitedPosts = new Array();
        this.handleFbService.invitedPostsSub.unsubscribe();
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