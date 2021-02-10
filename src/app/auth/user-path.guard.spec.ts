import { TestBed } from '@angular/core/testing';

import { UserPathGuard } from './user-path.guard';

describe('UserPathGuard', () => {
  let guard: UserPathGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserPathGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
