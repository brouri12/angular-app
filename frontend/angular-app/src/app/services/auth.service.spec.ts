import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should POST to backend', () => {
    const payload = {
      email: 'a@b.com',
      password: 'secret',
      firstName: 'A',
      lastName: 'B',
      username: 'ab',
    };
    service.register(payload as any).subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/auth/register'));
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });
});
