import { TestBed, inject } from '@angular/core/testing';

import { HandFbService } from './hand-fb.service';

describe('HandFbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HandFbService]
    });
  });

  it('should be created', inject([HandFbService], (service: HandFbService) => {
    expect(service).toBeTruthy();
  }));
});
