import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmModalMenuComponent } from './cm-modal-menu.component';

describe('CmModalMenuComponent', () => {
  let component: CmModalMenuComponent;
  let fixture: ComponentFixture<CmModalMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmModalMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmModalMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
