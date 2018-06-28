import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatNewPostDialogComponent } from './creat-new-post-dialog.component';

describe('CreatNewPostDialogComponent', () => {
  let component: CreatNewPostDialogComponent;
  let fixture: ComponentFixture<CreatNewPostDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatNewPostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatNewPostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
