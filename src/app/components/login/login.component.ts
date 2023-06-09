import { Component, OnInit } from '@angular/core';
import { IUser, LoginDTO, TwoFactor, twoFactorType } from '../../models/IUser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { resetCode } from 'src/app/models/resetCode';
import { HttpErrorResponse } from '@angular/common/http';
import {GoogleLoginProvider, SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";
import {Token} from "src/app/models/Token";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userForm!: FormGroup;
  resetForm!: FormGroup;
  resetPass : Boolean = false;
  codeIsSent: Boolean = false;
  twoFactorCodeIsSent: Boolean = false;
  socialUser!: SocialUser;
  loggedIn!: boolean;

  public constructor(private authService : AuthService, private router : Router,private socialAuthService: SocialAuthService){}

  ngOnInit() {


    const signUpButton = document.getElementById('signUp') as HTMLElement | any;
    const signInButton = document.getElementById('signIn') as HTMLElement | any;
    const container = document.getElementById('container') as HTMLElement | any;

    signUpButton.addEventListener('click', () => {
      container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
      container.classList.remove("right-panel-active");
    });
    this.userForm = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('', [Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-_])[A-Za-z\d@$!%*?&-_]{8,}$/)]),
      confirmedPassword: new FormControl(''),
      name: new FormControl(''),
      lastname: new FormControl(''),
      telephone: new FormControl('', [Validators.required, Validators.pattern(/^\+38[0-9][1-9]{1}[0-9]{7}([0-9]{1})?$/)]),
      code: new FormControl(''),
      type : new FormControl('0')
    });

    this.resetForm = new FormGroup({
      type: new FormControl('1'),
      username: new FormControl(''),
      telephone: new FormControl('', [Validators.required, Validators.pattern(/^\+38[0-9][1-9]{1}[0-9]{7}([0-9]{1})?$/)]),
      newPassword: new FormControl('', [Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-_])[A-Za-z\d@$!%*?&-_]{8,}$/)]),
      newConfirmed: new FormControl(''),
      code: new FormControl(''),
    });

    this.socialAuthService.authState.subscribe((user) => {
      this.socialUser = user;
      this.loggedIn = (user != null);
      console.log(this.socialUser);
      const tokenGoogle : Token = {
        "token" : this.socialUser.idToken,
      }
      this.authService.google(tokenGoogle).subscribe({
          next: (result) => {
            console.log(result)
            localStorage.setItem('user', JSON.stringify(result));
            this.authService.setUser();
            console.log(this.authService.getRole())
            this.router.navigate(['/home']);
          },
          error:(error) => {
            console.log(error)
          }
        }
      )

    });

  }

  refreshToken(): void {
    this.socialAuthService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

    signIn(){
      const user: IUser = this.userForm.value;
      const login : LoginDTO = {
        username : user.username,
        password : user.password,
        code : user.code,
        type : twoFactorType.EMAIL
      }

      this.authService.signIn(login).subscribe({
        next: (result) => {
          
          localStorage.setItem('user', JSON.stringify(result));
          this.authService.setUser();
          console.log(this.authService.getRole())
          this.router.navigate(['/home']);
        },
        error:(error) => {
          if(error['error'] == "You need to change your password!"){
            alert(error['error'])
            this.forgotPass();
          }
          if(error['error'] == "Incorrect password or username!"){
            alert(error['error'])
          }
          else{
            console.log(error)

          }
        }
      })
    }

    signUp(){
      const user: IUser = this.userForm.value;
      if(!this.userForm.valid){
        alert('phone number must be +38x xx xxx xxx(x)')
        return;
      }
      if(user.password != user.confirmedPassword){
        alert('Passwords do not match!');
        return;
      }
      this.authService.signUp(user).subscribe({
        next: (result) => {
          alert("Check your email!")
          this.userForm.reset();

        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            alert(error.error['response'])
            console.error(error.error['response']);
          }

        }
      })

    }

    forgotPass() {
      this.resetPass = !this.resetPass;
      this.codeIsSent = false;
    }

    getResetCode(){
      const reset : resetCode = this.resetForm.value;
      this.authService.getResetCode(reset).subscribe({
        next: (result) => {
          this.codeIsSent = true;
          alert(result.response)
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            alert(error.error['response'])
            console.error(error.error['response']);


          }
        }
      })

    }

    getTwoFactoreCode(){
      const user : IUser = this.userForm.value;

      const twoFactor : TwoFactor = {
        type : user.type,
        username : user.username
      }

      this.authService.getTwoFactoreCode(twoFactor).subscribe({
        next: (result) => {
          this.twoFactorCodeIsSent = !this.twoFactorCodeIsSent;
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            alert(error.error['response'])
            console.error(error.error['response']);
          }
        }
      })
      
    }

    isInvalidPassword() {
      const passwordControl = this.userForm.get('password');
      return passwordControl?.touched && passwordControl?.invalid;
    }

    resetPassword(){
      const reset : resetCode = this.resetForm.value;
      if (!this.resetForm.get('newPassword')!.valid) {
        alert('Password must contaion number, upper and lower character and be minimum 8 charactesrs long')
        return;
      }

      if(reset.newPassword != reset.newConfirmed){
        alert('New and confirmed password do not match')
        return;
      }

      this.authService.resetPassword(reset).subscribe({
        next: (result) => {
          this.codeIsSent = false;
          this.resetPass = false;
          this.twoFactorCodeIsSent = false;
          alert(result.response)
          this.userForm.get('password')!.reset();
        },
        error: (error) => {
          alert(error.error['response'])
          console.error(error.error['response']);
        }
      })
    }


}

