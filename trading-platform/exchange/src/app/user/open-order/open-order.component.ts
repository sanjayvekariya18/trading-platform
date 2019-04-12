import { Component } from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";
import Swal from "sweetalert2";
import { ExchangeService, ToastService, UserService } from "../../core/service";
import { ApiResponseStatus } from "../../shared/common";
import { Response } from "../../shared/model";

@Component({
  selector: "app-open-order",
  templateUrl: "./open-order.component.html"
})
export class OpenOrderComponent {
  openOrderlist: any;
  stopLimit: any;
  public config: PerfectScrollbarConfigInterface = {};
  loading = false;
  constructor(
    private userService: UserService,
    private toast: ToastService,
    private exchangeService: ExchangeService
  ) {
    this.GetOpenOrders();
    this.GetStopLimit();
  }

  GetOpenOrders() {
    this.loading = true;
    this.userService.GetOpenOrderList().subscribe((res: any) => {
      if (res !== null) {
        this.openOrderlist = res.data;
      } else {
        this.toast.error(res.message);
      }
      this.loading = false;
    });
  }

  GetStopLimit() {
    this.loading = true;
    this.userService.GetStopLimit().subscribe((res: any) => {
      if (res !== null) {
        this.stopLimit = res.data;
      } else {
        this.toast.error(res.Message);
      }
      this.loading = false;
    });
  }

  CancelOrder(row) {
    Swal({
      cancelButtonText: "No, keep it",
      confirmButtonText: "Yes, cancel it!",
      showCancelButton: true,
      text: "You will not be able to recover this data!",
      title: "Are you sure?",
      type: "warning"
    }).then(result => {
      if (result.value) {
        this.exchangeService.CancelOrder(row.Id).subscribe((data: Response) => {
          if (data.Message !== null) {
            this.GetOpenOrders();
            this.toast.success(data.Message);
          } else {
            this.toast.error(data.Message);
          }
        });
      } else {
        this.toast.success("Your data is safe :)");
      }
    });
  }

  CancelStopLimitOrder(row) {
    Swal({
      cancelButtonText: "No, keep it",
      confirmButtonText: "Yes, cancel it!",
      showCancelButton: true,
      text: "You will not be able to recover this data!",
      title: "Are you sure?",
      type: "warning"
    }).then(result => {
      if (result.value) {
        this.exchangeService
          .CancelStopLimitOrder(row.Id)
          .subscribe((data: Response) => {
            if (data.Message !== null) {
              this.GetStopLimit();
              this.toast.success(data.Message);
            } else {
              this.toast.error(data.Message);
            }
          });
      } else {
        this.toast.success("Your data is safe :)");
      }
    });
  }
}
