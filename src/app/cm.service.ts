import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { HandFbService } from './hand-fb.service';

@Injectable({
  providedIn: 'root'
})
export class CmService {

  constructor(private handleFbService: HandFbService, private snackBar: MatSnackBar) { }

  /*
    Returns true if screen is in fullscreen mode else false
    @return boolean
  */
  public toggleFullscreen(mpcm): boolean {
    if (mpcm.codeMirror.getOption("fullScreen")) {
      mpcm.codeMirror.setOption("readOnly", true);
      mpcm.codeMirror.setOption("fullScreen", false);
      return false;
    } else {
      mpcm.codeMirror.setOption("fullScreen", true);
      mpcm.codeMirror.setSize("100%", "100%");
      mpcm.codeMirror.setOption("readOnly", false);
      return true;
    }
  }

  public getInlineEdits(cm, postId) {
    this.handleFbService.getInlineEditsByPostId(postId).subscribe((inlineEdit) => {
      if (inlineEdit[0] !== undefined && inlineEdit[0]["line"] !== undefined) {
        cm.codeMirror.scrollIntoView({ line: inlineEdit[0]["line"], ch: 0 });
        inlineEdit.forEach((edit) => {
          this.addInlineEditToCm(cm, edit);
        });
      } else {
        this.snackBar.open("No inline edits found", "", {
          duration: 1000
        });
      }
    });
  }

  public toggleEditMode(mpcm) {
    if (mpcm.codeMirror.getOption("readOnly")) {
      mpcm.codeMirror.setOption("readOnly", false);
    } else {
      mpcm.codeMirror.setOption("readOnly", true);
    }
  }

  private addInlineEditToCm(cm, inlineEdit) {
    cm.codeMirror.refresh();
    let doc = cm.codeMirror.getDoc();
    if (doc.lineInfo(inlineEdit.line - 1).widgets === undefined) {
      this.addLineWidgetToCm(cm, inlineEdit);
    } else {
      let uniqueFlag = true;
      doc.lineInfo(inlineEdit.line - 1).widgets.forEach(widget => {
        if (uniqueFlag && widget.node.outerText.replace(/(\r\n\t|\n|\r\t)/gm, "") !== (inlineEdit.byName + " => " + inlineEdit.edit.replace(/(\r\n\t|\n|\r\t)/gm, ""))) {
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
}