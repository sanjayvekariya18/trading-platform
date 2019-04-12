import { Component, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ReCaptchaComponent } from "angular2-recaptcha/angular2-recaptcha";
import { environment } from "../../../environments/environment";
import { AuthenticationService, ToastService } from "../../core/service";
import { Login, VerifyTwoFactor } from "../../shared/model";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent {
  public loginForm: FormGroup;
  public userId: number;
  isLoginSubmitted = false;
  isLoading = false;
  public email: string;

  constructor(
    public authenticationService: AuthenticationService,
    public toast: ToastService,
    public router: Router
  ) {
    this.BindForm();
  }

  BindForm() {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required])
    });
  }

  Login(obj: Login, isValid: boolean) {
    debugger;
    this.isLoginSubmitted = true;
    this.email = obj.email;
    if (isValid) {
      debugger;
      this.isLoading = true;
      this.authenticationService.Login(obj).subscribe((res: any) => {
        if (res !== null) {
          this.SetLogin(res.data);
        } else {
          this.toast.error(res.errors.email.toString());
        }
        this.isLoading = false;
      });
    }
  }

  SetLogin(data) {
    localStorage.setItem("buucurrentUser", JSON.stringify(data));
    this.authenticationService.CheckUserLoggedIn();
    window.location.href = "/user/market";
  }
}
