import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as CodeMirror from 'codemirror';

@Component({
  selector: 'app-magnified-code-modal',
  templateUrl: './magnified-code-modal.component.html',
  styleUrls: ['./magnified-code-modal.component.css',
    '../../../node_modules/codemirror/lib/codemirror.css',
    '../../../node_modules/codemirror/theme/elegant.css']
})
export class MagnifiedCodeModalComponent implements OnInit, AfterViewInit {

  constructor(public dialogRef: MatDialogRef<MagnifiedCodeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]) { }

  @ViewChild('codeeditor') private codeEditor: any;

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.codeEditor.refresh();
  }

  startEditing() {
    const editor = this.codeEditor.codeMirror;
    const doc = editor.getDoc();
    if (!doc.somethingSelected()) {
      let currentLine = JSON.parse(JSON.stringify(doc.getCursor()));
      var pos = {
        line: currentLine.line,
        ch: currentLine.ch
      }
      let newText = "//Code changes suggested by " + this.data[1] + " \n";
      doc.replaceRange(newText, pos);
      console.log(newText);
    } else {
      var options = {
        css: "text-decoration: line-through;"
      }
      var from = {
        line: doc.getCursor(true).line,
        ch: doc.getCursor(true).ch
      }
      var to = {
        line: doc.getCursor(false).line,
        ch: doc.getCursor(false).ch
      }
      console.log(doc.markText(from, to, options));
      console.log();
      /* let currentSelection = JSON.parse(JSON.stringify(doc.getSelection()));
      let replacementText = "//Code suggested By - "+ this.data[1] +"\n"+currentSelection+"\nOriginal text \n";
      console.log(replacementText);
      doc.replaceSelection(replacementText); */
    }
  }

  suggest() {
    
  }

  cancel() {
    this.dialogRef.close();
  }
}
