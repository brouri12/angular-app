import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GeoResult {
  address: string;
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class GeoService {

  // ✅ Passe par le Gateway
  private api = 'http://localhost:8888/events/geo';

  constructor(private http: HttpClient) {}

  search(address: string): Observable<GeoResult> {
    const params = new HttpParams().set('address', address);
    return this.http.get<GeoResult>(`${this.api}/geocode`, { params });
  }
}