import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SdkService {
  private securityApiUrl = 'http://localhost:3006';
  private clientsApiUrl = 'http://localhost:3004';

  constructor(private http: HttpClient) { }

  generateSecurityToken(): Observable<any> {
    return this.http.post(`${this.securityApiUrl}/generate-token`, {});
  }

  registerClient(data: any): Observable<any> {
    return this.http.post(`${this.clientsApiUrl}/register-client`, data);
  }
}
