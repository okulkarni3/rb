import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MagnifiedCodeModalComponent } from './magnified-code-modal.component';

describe('MagnifiedCodeModalComponent', () => {
  let component: MagnifiedCodeModalComponent;
  let fixture: ComponentFixture<MagnifiedCodeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MagnifiedCodeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MagnifiedCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
