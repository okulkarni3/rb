import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-creat-new-post-dialog',
  templateUrl: './creat-new-post-dialog.component.html',
  styleUrls: ['./creat-new-post-dialog.component.css',
  '../../../node_modules/codemirror/lib/codemirror.css',
  '../../../node_modules/codemirror/theme/yeti.css']
})
export class CreatNewPostDialogComponent implements OnInit {

  ngOnInit() {
  }

  
  constructor(
    public dialogRef: MatDialogRef<CreatNewPostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
