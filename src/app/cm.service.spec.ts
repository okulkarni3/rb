import { TestBed, inject } from '@angular/core/testing';

import { CmService } from './cm.service';

describe('CmService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CmService]
    });
  });

  it('should be created', inject([CmService], (service: CmService) => {
    expect(service).toBeTruthy();
  }));
});
