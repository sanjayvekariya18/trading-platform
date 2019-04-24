import {
  Component,
  Input,
  OnChanges,
  OnInit,
  EventEmitter,
  Output
} from "@angular/core";
import {
  ExchangeService,
  TradeService,
  UserService,
  ToastService,
  PusherService
} from "../../core/service";
import { Response } from "../../shared/model";
import { ApiResponseStatus, OrderType } from "../../shared/common";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";
import Swal from 'sweetalert2';

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html"
})
export class OrdersComponent implements OnInit, OnChanges {
  tradeHisList: any;
  sellOrderList: any;
  buyOrderList: any;
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
    private toast: ToastService,
    public _pusherService: PusherService,

  ) { }


  ngOnInit() {
    this._pusherService.ch_pending_order.bind('App\\Events\\PendingOrder', data => {
      this.GetUserPendingOrders("Pending", this.pairId);
      this.GetSellOrder(this.pairId);
      this.GetBuyOrder(this.pairId);
    });
    /* this.GetSellOrder(this.pairId);
    this.GetBuyOrder(this.pairId); */

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
    this.GetSellOrder(this.pairId);
    this.GetBuyOrder(this.pairId);
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

  GetSellOrder(id: any) {
    this.hisloading = true;
    this.exchangeService.GetSellOrder(id).subscribe((res: any) => {
      if (res !== null) {
        this.sellOrderList = res.data;
      } else {
        this.toast.error(res.message);
      }
      this.hisloading = false;
    });
  }

  GetBuyOrder(id: any) {
    this.hisloading = true;
    this.exchangeService.GetBuyOrder(id).subscribe((res: any) => {
      if (res !== null) {
        this.buyOrderList = res.data;
      } else {
        this.toast.error(res.message);
      }
      this.hisloading = false;
    });
  }



  CancelOrder(id: number) {
    Swal({
      cancelButtonText: 'No, keep it',
      confirmButtonText: 'Yes, cancel it!',
      showCancelButton: true,
      text: 'Are you sure you want to cancel this order?',
      title: 'Are you sure?',
      type: 'warning',
    }).then(result => {
      if (result.value) {
        this.exchangeService.CancelOrder(id).subscribe((res: any) => {
          if (res !== null) {
            this.GetUserPendingOrders("Pending", this.pairId);
            this.toast.success(res.output);
          } else {
            this.toast.error(res.output);
          }
          this.hisloading = false;
        });
      } else {
        this.toast.success('Your data is safe :)');
      }
    });
  }

}
