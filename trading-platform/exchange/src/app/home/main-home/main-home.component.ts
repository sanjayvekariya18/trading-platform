import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/service/authentication.service';
import { ApiResponseStatus } from '../../shared/common';
import { Response } from '../../shared/model/Response';
import { Common } from '../../shared/common/common.utility';

@Component({
  selector: 'app-main-home',
  templateUrl: './main-home.component.html',
  styleUrls: ['./main-home.component.css']
})
export class HomeComponent implements OnInit {
  public loginDisable = false;
  public registerDisable = false;
  constructor(
    public authenticationService: AuthenticationService,
    public toast: ToastrService,
    public router: Router,
    public common: Common
  ) {}

  ngOnInit() {
    // this.GetSetting();
  }

  GetSetting() {
    this.authenticationService.GetSetting().subscribe((data: Response) => {
      if (data.ResponseStatus === ApiResponseStatus.Ok) {
        this.loginDisable =
          this.common.filterArrObj(data.Data, 'IsLogin') === 'YES'
            ? true
            : false;
        this.registerDisable =
          this.common.filterArrObj(data.Data, 'IsRegister') === 'YES'
            ? true
            : false;
      }
    });
  }

  // Login() {
  //   if (this.loginDisable === false) {
  //     this.toast.warning(
  //       'Currently login are not available, Please try after some time !...'
  //     );
  //   } else {
  //     this.router.navigate(['/account/login']);
  //   }
  // }

  // Register() {
  //   if (this.registerDisable === false) {
  //     this.toast.warning(
  //       'Currently register are not available, Please try after some time !...'
  //     );
  //   } else {
  //     this.router.navigate(['/account/register']);
  //   }
  // }
}
