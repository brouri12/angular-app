import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Category = 'KIDS' | 'LITERATURE' | 'SCIENCE' | 'HISTORY' | 'TECHNOLOGY';
export type BookType = 'PHYSICAL' | 'PDF';

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  coverImageUrl: string;
  category: Category;
  bookType: BookType;
  price: number;
  totalCopies: number;
  availableCopies: number;
  pdfUrl: string;
}

// Centralised — change here if port changes
export const LIBRARY_BASE = 'http://localhost:8078/library';

@Injectable({ providedIn: 'root' })
export class LibraryAdminService {
  private booksUrl = `${LIBRARY_BASE}/books`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.booksUrl);
  }

  getOne(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.booksUrl}/${id}`);
  }

  create(book: Book): Observable<Book> {
    return this.http.post<Book>(this.booksUrl, book);
  }

  // Backend BookController uses POST /library/books for both create and update (JPA save)
  update(id: number, book: Book): Observable<Book> {
    return this.http.post<Book>(this.booksUrl, { ...book, id });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.booksUrl}/${id}`);
  }
}
