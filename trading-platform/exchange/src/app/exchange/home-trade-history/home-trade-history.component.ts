import { Component, OnChanges, Input, OnInit } from "@angular/core";
import { ExchangeService } from "../../core/service/exchange.service";
import { ApiResponseStatus } from "../../shared/common";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";
import { TradeService, PusherService } from "../../core/service";
import { ToastrService } from "ngx-toastr";
import { Response } from "../../shared/model";

@Component({
  selector: "app-home-trade-history",
  templateUrl: "./home-trade-history.component.html",
  styles: []
})
export class HomeTradeHistoryComponent implements OnInit, OnChanges {
  tradeHisList: any;
  tradeListLoading = false;
  @Input() baseCurrency: number;
  @Input() mainCurrency: number;
  @Input() pairId: number;
  config: PerfectScrollbarConfigInterface = {};

  constructor(
    private exchangeService: ExchangeService,
    public tradeService: TradeService,
    public toast: ToastrService,
    public _pusherService: PusherService,

  ) {
    this.GetTradeObservable();
  }

  ngOnInit() {
    this._pusherService.ch_confirm_order.bind('App\\Events\\ConfirmOrder', data => {
      this.GetUserHistory(this.pairId);
    });
  }

  ngOnChanges(change: any) {
    this.pairId =
      change.pairId !== undefined ? change.pairId.currentValue : this.pairId;
    this.baseCurrency =
      change.baseCurrency !== undefined
        ? change.baseCurrency.currentValue
        : this.baseCurrency;
    this.mainCurrency =
      change.mainCurrency !== undefined
        ? change.mainCurrency.currentValue
        : this.mainCurrency;
    this.GetUserHistory(this.pairId);
  }

  GetTradeObservable() {
    this.tradeService.tradeHistoryAll$().subscribe((data: any) => {
      this.tradeHisList = data;
    });
  }

  GetUserHistory(id: number) {
    this.tradeListLoading = true;
    this.exchangeService.GetUserHistory(id).subscribe((res: any) => {

      if (res.success == true) {
        this.tradeHisList = res.data;
      } else {
        if (res.output != undefined && res.output != "")
          this.toast.error(res.output);
      }
      this.tradeListLoading = false;
    });
  }
}
