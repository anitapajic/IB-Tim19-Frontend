import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IUser, LoginDTO, TwoFactor } from 'src/app/models/IUser';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Token } from 'src/app/models/Token';
import { strRepsonse } from 'src/app/models/strResponse';
import { resetCode } from 'src/app/models/resetCode';

const oauthHeader = {headers: new HttpHeaders({'Content-Type' : 'application/json'})};



@Injectable({
  providedIn: 'root'
})
export class AuthService {


  userId = 0;
  user$ = new BehaviorSubject(null);
  userState$ = this.user$.asObservable();

  constructor(private http : HttpClient) { }

  private headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    skip: 'true',
  });

  getRole(): any {
    if (this.isLoggedIn()) {
      var accessToken: any = localStorage.getItem('user');


      this.userId = JSON.parse(accessToken)['id'];


      const role = JSON.parse(accessToken)['role'];
      return role;
    }
    return null;
  }

  isVerified(): any {
    if (this.isLoggedIn()) {
      var accessToken: any = localStorage.getItem('user');


      this.userId = JSON.parse(accessToken)['id'];


      return this.userId;
    }
    return null;
  }

  getUsername(): any{
    if (this.isLoggedIn()) {
      var accessToken: any = localStorage.getItem('user');
      const helper = new JwtHelperService();
      const username = helper.decodeToken(accessToken).sub;
      return username;
    }
    return null;
  }
  setUser(): void {
    this.user$.next(this.getRole());
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('user') != null) {
      return true;
    }
    return false;
  }

  // Login and Registration

  signIn(user: LoginDTO): Observable<Token> {
    return this.http.post<Token>(
      'http://localhost:8085/api/user/login', user, {headers: this.headers} );
  }

  public google(tokenDTO : Token): Observable<Token>{
    return this.http.post<Token>('http://localhost:8085/api/user/login/google', tokenDTO, {headers: this.headers});
  }

  signUp(user: IUser): Observable<strRepsonse> {
    return this.http.post<any>(
      'http://localhost:8085/api/user/register', user);
  }

  logout(): Observable<string> {
    this.userId = 0;

    return this.http.get('http://localhost:8085/api/user/logout', {
      responseType: 'text',
    });
  }

  getTwoFactoreCode(twoFactor : TwoFactor): Observable<strRepsonse>{
    return this.http.post<strRepsonse>('http://localhost:8085/api/user/twoFactor', twoFactor, {headers: this.headers})

  }
  getResetCode(reset : resetCode): Observable<strRepsonse>{
    return this.http.post<strRepsonse>('http://localhost:8085/api/user/getResetCode', reset, {headers: this.headers})

  }

  resetPassword(reset : resetCode): Observable<strRepsonse>{
    return this.http.post<strRepsonse>('http://localhost:8085/api/user/resetPassword', reset, {headers: this.headers})

  }
  // Phone verification

  getVerificationCode(telephone : string): Observable<strRepsonse>{
    return this.http.get<strRepsonse>('http://localhost:8085/api/user/verify/' + telephone)

  }

  verify(code : string): Observable<strRepsonse>{
    return this.http.post<strRepsonse>('http://localhost:8085/api/user/verify/' + code, null);

  }


    // verify(user : IUser): Observable<string> {
    //   this.userId = 0;

    //   return this.http.get('http://localhost:8085/api/user/logout', {
    //     responseType: 'text',
    //   });
    // }


}
