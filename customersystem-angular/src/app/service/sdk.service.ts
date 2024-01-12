import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SdkService {
  private securityApiUrl = 'http://localhost:3006';
  private customersApiUrl = 'http://localhost:3004';

  constructor(private http: HttpClient) { }

  generateSecurityToken(): Observable<any> {
    return this.http.post(`${this.securityApiUrl}/generate-token`, {});
  }

  registerCustomer(data: any): Observable<any> {
    return this.http.post(`${this.customersApiUrl}/register-customer`, data);
  }
}
