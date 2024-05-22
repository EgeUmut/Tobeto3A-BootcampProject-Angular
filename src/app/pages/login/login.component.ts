import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserForLoginRequest } from '../../features/models/requests/auth/user-for-login-request';
import { AuthService } from '../../features/services/concretes/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { UserForLoginWithVerifyRequest } from '../../features/models/requests/auth/user-for-loginWithVerify-request';
import { DarkModeService } from '../../features/services/dark-mode.service';
import { ForgotPasswordRequest } from '../../features/models/requests/auth/forgot-password-request';
import { EmailService } from '../../features/services/concretes/email.service';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule,ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!:FormGroup;
  showAuthenticatorCodeInput:boolean = false;
  showForgotPassword: boolean = false; 
  forgotPasswordEmail!: ForgotPasswordRequest;
  forgotPassword!:FormGroup;

  constructor(private formBuilder:FormBuilder,private authService:AuthService,private router:Router,private toastrService:ToastrService){}

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm(){
    this.loginForm=this.formBuilder.group({
      email:["",[Validators.required, Validators.email]],
      password:["",Validators.required],
      authenticatorCode:[null]
    })
  }

  createForgotPasswordMail(){
    this.forgotPassword=this.formBuilder.group({
      email:["",[Validators.required, Validators.email]]})
  }


  
  // login() {
  //   if (this.loginForm.valid) {
  //     let loginModel: UserForLoginRequest = Object.assign({}, this.loginForm.value);

  //     this.authService.login(loginModel).subscribe({
  //       error:(error)=>{
  //         this.toastrService.error('Giriş Başarısız','Giriş İşlemi');
  //       },
  //       next:()=>{
  //         if(!localStorage.getItem('token')){
  //           this.toastrService.success('Doğrulama kodu mail adresinize gönderildi','Doğrulama Kodu');
  //           this.showAuthenticatorCodeInput = true;
  //         }
  //       }
  //     })
  //   }
  // }


  // Kullanıcının girdiği bilgileri apiye post isteği atar (email,password olarak sadece 2 parametre gönderir)
  // Kullanıcın EmailVerify yaptığı durumlarda token dönmez 2FA pop-up açılır ve kullanıcıya mail gönderilir
  // EmailVerify yapılmadı ise response olarak accesstoken döner
  login() {
    if (this.loginForm.valid) {
      let loginModel: UserForLoginRequest = Object.assign({}, this.loginForm.value);
      console.log(loginModel.email + " " + loginModel.password);
      
      this.authService.login(loginModel).subscribe({
        next: (response) => {
          if (response.accessToken) {
            localStorage.setItem('token', response.accessToken.token);
            this.toastrService.success('Giriş Başarılı', 'Giriş İşlemi');
            this.showAuthenticatorCodeInput = false;
            console.log('component if',response);
          } 
          else {
            this.toastrService.success('Doğrulama kodu mail adresinize gönderildi', 'Doğrulama Kodu');
            this.showAuthenticatorCodeInput = true;
            console.log('component else',response);
          }
        },
        error: (error) => {
          console.log('component error',error);
          this.toastrService.error('Giriş Başarısız', 'Giriş İşlemi');
          //this.showAuthenticatorCodeInput = false;
        }
      });
    }
  }

  // girilen doğrulama kodunu apiye gönderir (email,password,activationKey olarak 3 parametre gönderir) başarılı olursa tokeni kaydeder
  verifyCode() {
      let loginModel: UserForLoginWithVerifyRequest = Object.assign({}, this.loginForm.value);
      this.authService.loginWithVerify(loginModel).subscribe({
        next:()=>{
          this.toastrService.success('Giriş Başarılı', 'Giriş işlemi');
          this.onCancel();
        },
        error:() => {
          this.toastrService.error('Giriş Başarısız');
          this.onCancel();

          //console.log(error.message);
        },
        complete:() => {
          this.onCancel();
        },
      });
  }

  // sendForgotPasswordEmail() {
  //   if (this.forgotPassword.valid) {
  //     let ForgotPasswordModel: ForgotPasswordRequest = Object.assign({}, this.forgotPassword.value);
  //     this.authService.sendForgotPasswordEmail(ForgotPasswordModel);
  //       }
  //     }

  sendForgotPasswordEmail() {
    if (this.forgotPassword.valid) {
      const forgotPasswordModel: ForgotPasswordRequest = Object.assign({}, this.forgotPassword.value);
      this.authService.sendForgotPasswordEmail(forgotPasswordModel).subscribe({
        next: (response) => {
          console.log('Mail gönderildi');
        },
        error: (error) => {
          console.error('Hata yanıtı:', error);
        }
      });
    } else {
      // Eğer form geçerli değilse toastr ile uyarı göster
      this.toastrService.error('Lütfen geçerli bir e-posta adresi girin.', 'Hata');
    }
  }
  

  // Doğrulama kodu girilen pop-up'ı kapatır
  onCancel() {
    this.showAuthenticatorCodeInput = false;
  }

  darkModeService: DarkModeService = inject(DarkModeService);
  // Şifremi unuttum Cardını açar Logini kapatır
  showForgotPasswordForm() {
    this.showForgotPassword = true;
    this.createForgotPasswordMail();
    this.loginForm.reset(); 
  }

  //Şifremi unuttum kısmından login ekranına geri döner
  goBack() {
    this.showForgotPassword = false;
  }
}  
