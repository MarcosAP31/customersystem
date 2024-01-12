// registration-form.component.ts

import { Component, OnInit } from '@angular/core';
import { SdkService } from '../service/sdk.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  token: string = '';
  registrationData: any = {}; // Ajusta el tipo según los campos reales del formulario

  constructor(private sdkService: SdkService) { }

  ngOnInit(): void {
    this.generateSecurityToken();
  }

  generateSecurityToken() {
    this.sdkService.generateSecurityToken().subscribe(
      (response: any) => {
        // Muestra el token en el formulario para que el usuario lo edite
        this.token = response.token;
      },
      (error:any) => {
        console.error('Error generando el token:', error);
      }
    );
  }

  registerCustomer() {
    this.sdkService.registerCustomer(this.registrationData).subscribe(
      (response: any) => {
        console.log('Cliente registrado exitosamente:', response);
      },
      (error:any) => {
        console.error('Error registrando el cliente:', error);
      }
    );
  }
}