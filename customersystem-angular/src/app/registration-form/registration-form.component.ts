// registration-form.component.ts

import { Component, OnInit } from '@angular/core';
import { Customer } from '../models/customer';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SdkService } from '../service/sdk.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {
  token: string = '';
  registrationData: any = {}; // Ajusta el tipo según los campos reales del formulario
  formCustomer: FormGroup;
  constructor(private sdkService: SdkService,
    public form: FormBuilder) {
      this.formCustomer = this.form.group({
        Name: [''],
        Email: [''],
        Phone: ['']
      });
     }

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
    var customer=new Customer();
    customer.Name=this.formCustomer.value.Name;
    customer.Name=this.formCustomer.value.Email;
    customer.Name=this.formCustomer.value.Phone;
    this.sdkService.registerCustomer(customer).subscribe(
      (response: any) => {
        console.log('Cliente registrado exitosamente:', response);
      },
      (error:any) => {
        console.error('Error registrando el cliente:', error);
      }
    );
  }
}