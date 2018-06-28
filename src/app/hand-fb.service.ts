import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { HandleAuthService } from './handle-auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandFbService {

  public loggedInUser: any;
  public loggedInUserName: any=  undefined;
  public invitedPostIds: any;
  public invitedPostsById: Map<string, any> = new Map();
  public invitedPostSuggestions = new Map();
  public invitedPosts: Array<any>= new Array();
  constructor(private fb: AngularFireDatabase, private authServ: HandleAuthService) {
   }

  getObject(path: string) {
    return this.fb.object(path).valueChanges();
  }


  createUserObject(name) {
    const newUser = this.fb.object("Users/"+JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid);
    newUser.set({"name":name,"peerPoints":"0"});
  }

  queryLoggedinUsersPosts(){
    this.setInvitedPostIds();
    return this.fb.list("/Posts", ref => ref.orderByChild("by")
              .equalTo(JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid))
              .valueChanges();
  }

  createPostForLoggedinUser(pTitle: string, pText: string){
    this.setLoggedInUserName();
    var pushedPost = this.fb.list('Posts').push({
      by: JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid,
      title: pTitle,
      pText: pText,
      byName: this.loggedInUserName
    });
    this.fb.object('Posts/'+pushedPost.key).update({postId:pushedPost.key});
  }

  increaseRecommendBySuggId(sugg){
    this.fb.object("Suggestions/"+sugg.suggKey).update({recommended: sugg.recommended+1})
  }

  setLoggedInUserName(){
    var uid = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
    if(this.loggedInUserName === undefined) {
      this.loggedInUserName = this.fb.list("/Users/"+uid+"/name").query.once('value');
        this.loggedInUserName = JSON.parse(JSON.stringify(this.loggedInUserName))["__zone_symbol__value"];
    }
  }

  setInvitedPostIds(){
    if(this.invitedPostIds === undefined) {
    var uid = JSON.parse(JSON.stringify(this.authServ.afAuth.auth.currentUser)).uid;
      this.fb.object("/Users/"+uid+"/invitedPosts").valueChanges().subscribe((id)=>{
        JSON.parse(JSON.stringify(id)).split(";").forEach((postId)=>{
          this.getObject("Posts/"+postId).subscribe((post)=>{
            this.invitedPostsById.set(postId,post);
            this.invitedPosts = Array.from(this.invitedPostsById.values());
            this.getSuggestionsByPostId(postId).subscribe((sugg)=>{
              this.invitedPostSuggestions.set(postId,sugg);
              console.log(this.invitedPostSuggestions);
            });
          });
        })
      });
    }
  }

  addSuggestionForPostId(postId: string, suggestion: string) {
    this.setLoggedInUserName();
    var key = this.fb.list("/Suggestions").push({
      by:this.loggedInUserName,
      postId: postId,
      recommended:0,
      suggestion:suggestion
    }).key;
    this.fb.object("/Suggestions/"+key).update({suggKey:key});
  }

  getSuggestionsByPostId(postId: string){
    return this.fb.list('/Suggestions', ref=> ref.orderByChild('postId')
                                  .equalTo(postId))
                                  .valueChanges();
  }
}