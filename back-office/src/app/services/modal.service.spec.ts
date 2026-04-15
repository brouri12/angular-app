import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open login then close', (done) => {
    const values: Array<'login' | 'register' | null> = [];
    const sub = service.modal$.subscribe((v) => {
      values.push(v);
      if (values.length === 3) {
        expect(values).toEqual([null, 'login', null]);
        sub.unsubscribe();
        done();
      }
    });
    service.openLogin();
    service.close();
  });
});
