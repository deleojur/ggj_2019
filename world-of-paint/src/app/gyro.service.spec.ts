import { TestBed } from '@angular/core/testing';

import { GyroService } from './gyro.service';

describe('GyroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GyroService = TestBed.get(GyroService);
    expect(service).toBeTruthy();
  });
});
