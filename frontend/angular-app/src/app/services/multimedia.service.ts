import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MediaFileDTO {
  id?: number;
  messageId: number;
  mediaType: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  originalFilename: string;
  fileSize: number;
  mimeType?: string;
  videoPlatform?: string;
  videoIdentifier?: string;
  transcription?: string;
  uploadDate?: Date;
  uploaderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MultimediaService {
  private apiUrl = 'http://localhost:8082/api/forum/multimedia';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, messageId: number, uploaderId: number): Observable<MediaFileDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId.toString());
    formData.append('uploaderId', uploaderId.toString());
    return this.http.post<MediaFileDTO>(`${this.apiUrl}/upload/image`, formData);
  }

  uploadAudio(file: File, messageId: number, uploaderId: number): Observable<MediaFileDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId.toString());
    formData.append('uploaderId', uploaderId.toString());
    return this.http.post<MediaFileDTO>(`${this.apiUrl}/upload/audio`, formData);
  }

  uploadDocument(file: File, messageId: number, uploaderId: number): Observable<MediaFileDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId.toString());
    formData.append('uploaderId', uploaderId.toString());
    return this.http.post<MediaFileDTO>(`${this.apiUrl}/upload/document`, formData);
  }

  embedVideo(videoUrl: string, messageId: number, uploaderId: number): Observable<MediaFileDTO> {
    const params = { videoUrl, messageId: messageId.toString(), uploaderId: uploaderId.toString() };
    return this.http.post<MediaFileDTO>(`${this.apiUrl}/embed/video`, null, { params });
  }

  getFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/file/${fileId}`, { responseType: 'blob' });
  }

  getThumbnail(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/thumbnail/${fileId}`, { responseType: 'blob' });
  }

  deleteFile(fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/file/${fileId}`);
  }

  getGallery(forumId: number): Observable<MediaFileDTO[]> {
    return this.http.get<MediaFileDTO[]>(`${this.apiUrl}/gallery/${forumId}`);
  }

  getMediaByMessage(messageId: number): Observable<MediaFileDTO[]> {
    return this.http.get<MediaFileDTO[]>(`${this.apiUrl}/message/${messageId}`);
  }

  getTranscription(fileId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/transcription/${fileId}`);
  }

  validateImageFormat(file: File): boolean {
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedFormats.includes(file.type);
  }

  validateAudioFormat(file: File): boolean {
    const allowedFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    return allowedFormats.includes(file.type);
  }

  validateDocumentFormat(file: File): boolean {
    const allowedFormats = [
      'application/pdf',
      'application/zip',
      'application/x-rar-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return allowedFormats.includes(file.type);
  }

  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}
