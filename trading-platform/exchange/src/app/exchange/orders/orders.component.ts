import {
  Component,
  Input,
  OnChanges,
  EventEmitter,
  Output
} from "@angular/core";
import {
  ExchangeService,
  TradeService,
  UserService,
  ToastService
} from "../../core/service";
import { Response } from "../../shared/model";
import { ApiResponseStatus, OrderType } from "../../shared/common";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html"
})
export class OrdersComponent implements OnChanges {
  tradeHisList: any;
  openOrderlist: any;
  buyData = [];
  sellData = [];
  totalBuy: string;
  totalSell: string;
  buyCount = 0;
  loading = false;
  hisloading = false;
  config: PerfectScrollbarConfigInterface = {};

  @Input() baseCurrency: string;
  @Input() mainCurrency: string;
  @Input() pairId: number;
  @Output() orederTypeChange = new EventEmitter<number>();
  @Output() priceChange = new EventEmitter<string>();
  @Output() amountChange = new EventEmitter<string>();
  @Output() totalChange = new EventEmitter<string>();
  @Output() buyModelChange = new EventEmitter<string>();
  @Output() sellModelChange = new EventEmitter<string>();

  constructor(
    public exchangeService: ExchangeService,
    public tradeService: TradeService,
    private userService: UserService,
    private toast: ToastService
  ) { }

  GetOrder(): void {
    this.loading = true;
    const pair = `${this.mainCurrency}/${this.baseCurrency}`;
    /* this.exchangeService.GetOrder(pair).subscribe((data: Response) => {
      if (data.ResponseStatus === ApiResponseStatus.Ok) {
        this.buyData = data.Data.buyList;
        this.sellData = data.Data.sellList;
        this.buyModelChange.emit(this.buyData.first());
        this.sellModelChange.emit(this.sellData.first());
        this.totalBuy = parseFloat(data.Data.buyTotal).toFixed(8);
        this.totalSell = parseFloat(data.Data.sellTotal).toFixed(8);
        this.loading = false;
      }
    }); */
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

    this.GetUserPendingOrders("Pending", this.pairId);
    // this.GetUserConfirmOrders("Confirmed", this.pairId);
  }

  SellRowClick(item): void {
    const sellFilter = this.sellData.filter(x => x.RowNum <= item.RowNum);
    const amountSum = sellFilter.sum("Amount");
    const amountTotal = sellFilter.sum("Total");
    this.orederTypeChange.emit(OrderType.Sell);
    this.priceChange.emit(item.Price);
    this.amountChange.emit(amountSum.toString());
    this.totalChange.emit(amountTotal.toString());
  }

  BuyRowClick(item): void {
    const buyFilter = this.buyData.filter(x => x.RowNum <= item.RowNum);
    const amountSum = buyFilter.sum("Amount");
    const amountTotal = buyFilter.sum("Total");
    this.orederTypeChange.emit(OrderType.Buy);
    this.priceChange.emit(item.Price);
    this.amountChange.emit(amountSum.toString());
    this.totalChange.emit(amountTotal.toString());
  }

  GetUserPendingOrders(orderstatus: string, id: number) {
    const obj = { order_status: orderstatus, currency_pair_id: id };
    this.loading = true;
    this.exchangeService.GetUserTrade(obj).subscribe((res: any) => {
      if (res !== null) {
        this.openOrderlist = res.data;
      } else {
        this.toast.error(res.message);
      }
      this.loading = false;
    });
  }

  GetUserConfirmOrders(orderstatus: string, id: number) {
    const obj = { order_status: orderstatus, currency_pair_id: id };
    this.hisloading = true;
    this.exchangeService.GetUserTrade(obj).subscribe((res: any) => {
      if (res !== null) {
        this.tradeHisList = res.data;
      } else {
        this.toast.error(res.message);
      }
      this.hisloading = false;
    });
  }
}
