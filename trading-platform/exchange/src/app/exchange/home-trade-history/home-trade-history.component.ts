import { Component, OnChanges, Input } from "@angular/core";
import { ExchangeService } from "../../core/service/exchange.service";
import { ApiResponseStatus } from "../../shared/common";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";
import { TradeService } from "../../core/service";
import { ToastrService } from "ngx-toastr";
import { Response } from "../../shared/model";

@Component({
  selector: "app-home-trade-history",
  templateUrl: "./home-trade-history.component.html",
  styles: []
})
export class HomeTradeHistoryComponent implements OnChanges {
  tradeHisList: any;
  tradeListLoading = false;
  @Input() baseCurrency: number;
  @Input() mainCurrency: number;
  @Input() pairId: number;
  config: PerfectScrollbarConfigInterface = {};

  constructor(
    private exchangeService: ExchangeService,
    public tradeService: TradeService,
    public toast: ToastrService
  ) {
    this.GetTradeObservable();
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
    this.GetTrade("Confirmed", this.pairId);
  }

  GetTradeObservable() {
    this.tradeService.tradeHistoryAll$().subscribe((data: any) => {
      this.tradeHisList = data;
    });
  }

  GetTrade(orderstatus: string, id: number) {
    const obj = { order_status: orderstatus, currency_pair_id: id };
    this.tradeListLoading = true;
    this.exchangeService.GetUserTrade(obj).subscribe((res: any) => {
      if (res !== null) {
        this.tradeHisList = res.data;
      } else {
        this.toast.error(res.message);
      }
      this.tradeListLoading = false;
    });
  }
}
