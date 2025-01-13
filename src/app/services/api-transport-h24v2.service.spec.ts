import { TestBed } from '@angular/core/testing';

import { ApiTransportH24v2Service } from './api-transport-h24v2.service';

describe('ApiTransportH24v2Service', () => {
  let service: ApiTransportH24v2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiTransportH24v2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
