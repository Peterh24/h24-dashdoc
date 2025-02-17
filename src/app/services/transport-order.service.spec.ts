import { TestBed } from '@angular/core/testing';

import { TransportOrderService } from './transport-order.service';

describe('TransportService', () => {
  let service: TransportOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransportOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
