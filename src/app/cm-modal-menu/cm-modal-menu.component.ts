import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { CmService } from '../cm.service';


@Component({
  selector: 'app-cm-modal-menu',
  templateUrl: './cm-modal-menu.component.html',
  styleUrls: ['./cm-modal-menu.component.css']
})
export class CmModalMenuComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AlertModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private cmService:CmService) { }

  ngOnInit() {}

  setInlineEdit() {
    this.dialogRef.close(true);
  }

  toggleFullscreen(){
    this.cmService.toggleFullscreen(this.data.cm);
    this.dialogRef.close();
  }

  toggleEditMode(){
    this.cmService.toggleEditMode(this.data.cm);
    this.dialogRef.close();
  }

  getInlineEdits(){
    this.cmService.getInlineEdits(this.data.cm, this.data.postId);
    this.dialogRef.close();
  }
}
