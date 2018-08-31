import { TestBed, inject } from '@angular/core/testing';

import { HandleAuthService } from './handle-auth.service';

describe('HandleAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HandleAuthService]
    });
  });

  it('should be created', inject([HandleAuthService], (service: HandleAuthService) => {
    expect(service).toBeTruthy();
  }));
});
