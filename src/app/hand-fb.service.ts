import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { HandleAuthService } from './handle-auth.service';
import { take, switchMap } from 'rxjs/operators';
import { Observable, of, observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandFbService {

  public loggedInUser: any;
  public usersOfSameTeam: any;
  public loggedInUserName: any = undefined;
  public invitedPostIds: any;
  public invitedPostsById: Map<string, any> = new Map();
  public invitedPostSuggestions = new Map();
  public invitedPosts: Array<any> = new Array();
  public invitedPostIdsSub;
  public invitedPostsSub;
  public invitedPostSuggSub;
  public invitedReviewersSub;
  public uninvitedReviewersSub;
  public invitedPostsToDelete;
  public invitedPostsToDeleteObs;


  constructor(private fb: AngularFireDatabase, private authServ: HandleAuthService) {
  }

  getObject(path: string) {
    return this.fb.object(path).valueChanges();
  }


  createUserObject(name, team) {
    const newUser = this.fb.object("Users/" + JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid);
    newUser.set({ "name": name, team: team, "peerPoints": "0", id: JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid, invitedPosts: "", invitedPostToAdd: "", invitedPostToRemove: "" });
  }

  queryLoggedinUsersPosts() {
    this.setInvitedPostIds();
    this.deleteInvitedPosts();
    return this.fb.list("/Posts", ref => ref.orderByChild("by")
      .equalTo(JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid))
      .valueChanges();
  }

  queryAllUsersByLoggedInUserTeam() {
    this.usersOfSameTeam = this.fb.list('/Users', ref => ref.orderByChild("team").equalTo(
      this.loggedInUser.team
    )).valueChanges().pipe(take(1));
  }

  createPostForLoggedinUser(pTitle: string, pText: string) {
    this.setLoggedInUserName();
    var pushedPost = this.fb.list('Posts').push({
      by: JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid,
      title: pTitle,
      pText: pText,
      byName: this.loggedInUser.name,
      byFcmToken: this.loggedInUser.fcmToken,
      timestamp: Date.now()
    });
    this.fb.object('Posts/' + pushedPost.key).update({ postId: pushedPost.key });
  }

  increaseRecommendBySuggId(sugg) {
    this.fb.object("Suggestions/" + sugg.suggKey).update({ recommended: sugg.recommended + 1 })
  }

  setLoggedInUserName() {
    if (this.authServ.afAuth.auth.currentUser != null) {
      var uid = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
      if (this.loggedInUserName === undefined) {
        this.fb.object("/Users/" + uid + "/name").valueChanges().subscribe((name) => {
          this.loggedInUserName = name;
        });
      }
    }
  }

  setInvitedPostIds() {
    if (this.invitedPostIds === undefined) {
      var uid = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
      this.invitedPostIdsSub = this.fb.object("/Users/" + uid + "/invitedPosts").valueChanges().subscribe((id) => {
        this.invitedPostsToDelete = id;
        JSON.parse(JSON.stringify(id)).split(";").forEach((postId) => {
          if (postId !== "") {
            this.invitedPostSuggestions = new Map();
            this.invitedPostsById = new Map();
            this.invitedPostsSub = this.getObject("Posts/" + postId).subscribe((post) => {
              if (post != null) {
                this.invitedPostsById.set(postId, post);
                this.invitedPosts = Array.from(this.invitedPostsById.values());
                this.invitedPostSuggSub = this.getSuggestionsByPostId(postId).subscribe((sugg) => {
                  this.invitedPostSuggestions.set(postId, sugg);
                });
              } else {
                this.invitedPostsToDelete = this.invitedPostsToDelete.replace(postId, "").replace(";;", ";");
              }
            });
          }
        })
      });
    }
  }

  addSuggestionForPostId(postId: string, suggestion: string) {
    this.setLoggedInUserName();
    var key = this.fb.list("/Suggestions").push({
      by: this.loggedInUser.name,
      postId: postId,
      recommended: 0,
      suggestion: suggestion,
      timestamp: Date.now()
    }).key;
    this.fb.object("/Suggestions/" + key).update({ suggKey: key });
  }

  getSuggestionsByPostId(postId: string) {
    return this.fb.list('/Suggestions', ref => ref.orderByChild('postId')
      .equalTo(postId))
      .valueChanges();
  }

  deletePostById(postId: string) {
    this.fb.object('Posts/' + postId).remove();
    //delete post suggestions
    var suggSub = this.fb.list('Suggestions/', ref => ref.orderByChild('postId')
      .equalTo(postId)).valueChanges();
    suggSub.subscribe((suggestions) => {
      suggestions.forEach((sugg) => {
        this.fb.object("Suggestions/" + JSON.parse(JSON.stringify(sugg)).suggKey).remove();
      });
    });
  }

  inviteReviewers(reviewers: Set<any>, postId: string) {
    reviewers.forEach((id) => {
      this.fb.object("Users/" + id).query.once("value").then(user => {
        const jsonUser = JSON.parse(JSON.stringify(user));
        const invitedPosts = jsonUser.invitedPosts;
        if (!invitedPosts.includes(postId)) {
          const updatedInvitedPosts = invitedPosts + ";" + postId;
          this.fb.object("Users/" + id).update({ invitedPosts: updatedInvitedPosts });
        }
      }).catch(error => {
        console.log("error" + error);
      });
    });
  }

  uninviteReviewers(reviewers: Set<any>, postId: string) {
    reviewers.forEach((id) => {
      this.fb.object("Users/" + id).query.once("value").then(user => {
        const jsonUser = JSON.parse(JSON.stringify(user));
        let invitedPosts = jsonUser.invitedPosts;
        if (invitedPosts.includes(postId)) {
          const updatedInvitedPosts = invitedPosts.replace(postId, "").replace(";;", ";");
          this.fb.object("Users/" + id).update({ invitedPosts: updatedInvitedPosts });
        }
      }).catch(error => {
        console.log("error" + error);
      });
    });
  }

  deleteInvitedPosts() {
    if (this.invitedPostsToDelete != null && this.invitedPostsToDelete !== "") {
      this.fb.object("Users/" + JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid)
        .update(
          {
            invitedPosts: this.invitedPostsToDelete
          }
        ).catch((error)=>{
          console.log(error);
        });
    }
  }
}