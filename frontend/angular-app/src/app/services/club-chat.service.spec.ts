import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClubChatService, ClubChatMessage } from './club-chat.service';

describe('ClubChatService', () => {
  let service: ClubChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClubChatService]
    });
    service = TestBed.inject(ClubChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── Test 1 : service créé ──
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Test 2 : getMessages appelle le bon endpoint ──
  it('should call GET /clubs/1/chat/messages with idUser param', () => {
    const mockMessages: ClubChatMessage[] = [
      { id: 1, idClub: 1, idUser: 5, senderName: 'Mahdi', content: 'Hello' }
    ];

    service.getMessages(1, 5).subscribe(messages => {
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Hello');
    });

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:8089/clubs/1/chat/messages' &&
      r.params.get('idUser') === '5'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockMessages);
  });

  // ── Test 3 : postMessage appelle le bon endpoint avec le bon body ──
  it('should call POST with correct body', () => {
    const mockResponse: ClubChatMessage = {
      id: 2, idClub: 1, idUser: 5, content: 'Test message'
    };

    service.postMessage(1, 5, 'Test message').subscribe(msg => {
      expect(msg.content).toBe('Test message');
    });

    const req = httpMock.expectOne('http://localhost:8089/clubs/1/chat/messages');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.content).toBe('Test message');
    expect(req.request.body.idUser).toBe(5);
    req.flush(mockResponse);
  });

  // ── Test 4 : retourne liste vide ──
  it('should return empty array when no messages', () => {
    service.getMessages(1, 5).subscribe(messages => {
      expect(messages).toEqual([]);
    });

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:8089/clubs/1/chat/messages'
    );
    req.flush([]);
  });

  // ── Test 5 : Authorization header ajouté si token présent ──
  it('should add Authorization header when token exists', () => {
    localStorage.setItem('access_token', 'fake-jwt-token');

    service.getMessages(1, 5).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:8089/clubs/1/chat/messages'
    );
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    req.flush([]);

    localStorage.removeItem('access_token');
  });
});
