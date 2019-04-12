import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import {
  DisableTwoFactor,
  ForgotPassword,
  Login,
  Register,
  ResetPassword,
  VerifyTwoFactor,
  VerifyWithdraw
} from "../../shared/model/authentication";
import { HttpService } from "./http.service";

@Injectable()
export class AuthenticationService {
  isUserNameChanged: EventEmitter<string> = new EventEmitter<string>();
  isLoginChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private http: HttpClient, public httpService: HttpService) {}

  Register(obj: Register) {
    return this.http.post(`${environment.apiUrl}/register`, obj);
  }

  GetSetting() {
    return this.http.get(`${environment.apiUrl}Setting`);
  }

  Login(obj: Login) {
    return this.http.post(
      `${environment.apiUrl}login`,
      `email=${obj.email}&password=${obj.password}`,
      this.httpService.GetHttpCommon()
    );
  }

  Forgot(obj: ForgotPassword) {
    return this.http.post(
      `${environment.apiUrl}User/ForgotPassword/${obj.email}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  ConfirmEmail(code: string) {
    return this.http.get(
      `${environment.apiUrl}User/ConfirmUser?code=${code}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  Reset(obj: ResetPassword) {
    return this.http.post(
      `${environment.apiUrl}User/ResetPassword`,
      JSON.stringify(obj),
      this.httpService.GetAuthHttpCommon()
    );
  }

  CheckUserLoggedIn(): boolean {
    if (localStorage.getItem("buucurrentUser")) {
      const currentUser = JSON.parse(localStorage.getItem("buucurrentUser"));

      const setDate: any = new Date(Date.parse(currentUser.SetDate));
      const currentDate: any = new Date();
      const hourdiff: number = currentDate - setDate;
      const hours = Math.floor(hourdiff / 3600 / 1000);

      if (hours >= 2) {
        this.isUserNameChanged.emit("");
        this.isLoginChanged.emit(false);
        localStorage.removeItem("buucurrentUser");
        window.location.href = "/user/market";
        return false;
      }

      const name =
        `${currentUser.Firstname}${currentUser.Lastname}` === ""
          ? currentUser.Email
          : `${currentUser.Firstname} ${currentUser.Lastname}`;
      this.isUserNameChanged.emit(name);
      this.isLoginChanged.emit(true);
      return true;
    }
    this.isUserNameChanged.emit("");
    this.isLoginChanged.emit(false);
    return false;
  }

  GetUserName(): string {
    if (localStorage.getItem("buucurrentUser")) {
      const currentUser = JSON.parse(localStorage.getItem("buucurrentUser"));
      return currentUser.Firstname === null || currentUser.Lastname === null
        ? currentUser.Email
        : `${currentUser.Firstname} ${currentUser.Lastname}`;
    }
    return "";
  }

  Logout() {
    localStorage.removeItem("buucurrentUser");
    localStorage.removeItem("buuBaseMarketId");
    localStorage.removeItem("buuMarketList");
    localStorage.removeItem("buuselectedMarket");
    localStorage.removeItem("chartInterval");
    this.CheckUserLoggedIn();
  }
}
