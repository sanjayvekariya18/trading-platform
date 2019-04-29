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
  openloading = false;
  myorderloading = false;
  buyloading = false;
  sellloading = false;
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
    this._pusherService.ch_confirm_order.bind('App\\Events\\ConfirmOrder', data => {
      this.GetUserConfirmOrders("Confirmed", this.pairId);
      this.GetSellOrder(this.pairId);
      this.GetBuyOrder(this.pairId);
    });
    this._pusherService.ch_order_cancel.bind('App\\Events\\OrderCancel', data => {
      this.GetUserPendingOrders("Confirmed", this.pairId);
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
    this.openloading = true;
    this.exchangeService.GetUserTrade(obj).subscribe((res: any) => {

      if (res.success == true) {
        this.openOrderlist = res.data;
      } else {
        if (res.output != undefined && res.output != "")
          this.toast.error(res.output);
      }
      this.openloading = false;
    });
  }

  GetUserConfirmOrders(orderstatus: string, id: number) {
    const obj = { order_status: orderstatus, currency_pair_id: id };
    this.myorderloading = true;
    this.exchangeService.GetUserTrade(obj).subscribe((res: any) => {

      if (res.success == true) {
        this.tradeHisList = res.data;
      } else {
        if (res.output != undefined && res.output != "")
          this.toast.error(res.output);
      }
      this.myorderloading = false;
    });
  }

  GetSellOrder(id: any) {
    this.sellloading = true;
    this.exchangeService.GetSellOrder(id).subscribe((res: any) => {

      if (res.success == true) {
        if (res.data !== null && res.data.length > 0) {
          this.sellModelChange.emit(res.data[0]);
        }
        this.sellOrderList = res.data;
      } else {
        if (res.output != undefined && res.output != "")
          this.toast.error(res.output);
      }
      this.sellloading = false;
    });
  }

  GetBuyOrder(id: any) {
    this.buyloading = true;
    this.exchangeService.GetBuyOrder(id).subscribe((res: any) => {

      if (res.success == true) {
        if (res.data !== null && res.data.length > 0) {
          this.buyModelChange.emit(res.data[0]);
        }
        this.buyOrderList = res.data;
      } else {
        if (res.output != undefined && res.output != "")
          this.toast.error(res.output);
      }
      this.buyloading = false;
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
        this.openloading = true;
        this.exchangeService.CancelOrder(id).subscribe((res: any) => {
          if (res.success == true) {
            this.GetUserPendingOrders("Pending", this.pairId);
            if (res.output != undefined && res.output != "")
              this.toast.success(res.output);
          } else {
            if (res.output != undefined && res.output != "")
              this.toast.error(res.output);
          }
        });
      } else {
        this.toast.success('Your data is safe :)');
      }
      this.openloading = false;
    });
  }

  getRowBuyOrder(item: any) {
    this.buyModelChange.emit(item);
  }
  getRowSellOrder(item: any) {
    this.sellModelChange.emit(item);
  }
}
