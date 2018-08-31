import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth }     from 'angularfire2/auth';
import * as firebase from 'firebase';

import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  messaging = firebase.messaging();
  currentMessage = new BehaviorSubject(null);

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth, private snackBar: MatSnackBar) { }

  private updateToken(token) {
    this.afAuth.authState.pipe(take(1)).subscribe(user => {
      if (!user) return;
      this.db.object('Users/'+[user.uid]).update({fcmToken:token});
    })
  }

  public getPermission() {
    this.messaging.requestPermission()
        .then(()=>{
          return this.messaging.getToken()
        })
        .then((token)=>{
          this.updateToken(token);
        })
        .catch((error)=>{
          console.log("error occurred "+ error);
        })
  }

  public receiveMessage() {
    this.messaging.onMessage((payload)=>{
      console.log("Message received "+JSON.stringify(payload));
      this.currentMessage.next(payload);
    });
  }


}
