import { LocationStrategy } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  AuthenticationService,
  ExchangeService,
  ToastService,
  TradeService,
  PusherService
} from "../core/service";
import { ApiResponseStatus, Common } from "../shared/common";
import { Response } from "../shared/model";

declare var $: any;

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
})
export class TradeComponent implements OnInit {
  public baseCurrencyData = [];
  public pair: string;
  public baseCurrency: string;
  public mainCurrency: string;
  public pairId: number;
  public orderType: number;
  public price: number;
  public amount: number;
  public total: number;
  public buyModel: any;
  public sellModel: any;
  public fullName: string;
  public email: string;
  public avtarImg: string;
  loading: boolean;
  selectedItem: string;
  dataList: any;
  selectedRow: any;
  route: string;
  result: any;
  isExchange = true;
  buyFirstRowPrice: any;
  sellFirstRowPrice: any;
  isLogin: false;

  constructor(
    private url: LocationStrategy,
    public authenticationService: AuthenticationService,
    public exchangeService: ExchangeService,
    public toast: ToastService,
    public router: Router,
    public common: Common,
    public tradeService: TradeService,
    public _pusherService: PusherService,

  ) {
    this.router.events.subscribe((path: any) => {
      this.route = path.url;
    });
    this.authenticationService.isLoginChanged.subscribe(isLogins => {
      setTimeout(() => {
        this.isLogin = isLogins;
      }, 10);
    });
  }

  ngOnInit() {
    this._pusherService.ch_currency_pair.bind('App\\Events\\CurrencyPair', data => {
      this.GetMarketList(this.selectedItem);
    });

    this.router.events.subscribe((event: any) => {
      if (
        event != null &&
        (event.url != null || event.url !== undefined) &&
        event.url.split("/").length >= 2 &&
        event.url.split("/")[2]
      ) {
        const data = event.url.split("/")[2];
        // this.displayMarket(data);
      }
    });

    // this.GetBaseCurrency();
    if (
      localStorage.getItem("MarketList") &&
      localStorage.getItem("BaseMarketId")
    ) {
      if (localStorage.getItem("selectedMarket")) {
        this.result = JSON.parse(localStorage.getItem("selectedMarket"));
      } else {
        const marketList = JSON.parse(localStorage.getItem("MarketList"));
        this.dataList = marketList;
        this.result = this.dataList.first();
      }
      this.selectedItem = localStorage.getItem("BaseMarketId");
      const baseName = this.result.name.split("/");
      this.baseCurrency = baseName[1];
      this.mainCurrency = baseName[0];
      this.pairId = this.result.id;
      this.selectedRow = this.result.name;
    } else {
      this.baseCurrency = "BTC";
      this.mainCurrency = "ETH";
      this.pairId = 1;
      this.selectedItem = "1";
      this.selectedRow = "ETH/BTC";
    }
    this.GetMarketList(this.selectedItem);

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) this.email = currentUser.email;
  }

  // GetBaseCurrency() {
  //   this.exchangeService.GetBaseCurrency().subscribe((data: Response) => {
  //     if (data.ResponseStatus === ApiResponseStatus.Ok) {
  //       this.baseCurrencyData = data.Data;
  //     }
  //   });
  // }

  GetMarketList(paramValue) {
    this.loading = true;
    this.selectedItem = paramValue;
    localStorage.setItem("BaseMarketId", this.selectedItem);
    this.exchangeService.GetMarketList(paramValue).subscribe((res: any) => {
      this.loading = false;
      this.dataList = res.data;
      localStorage.setItem("MarketList", JSON.stringify(this.dataList));
    });
  }

  GetRowDetail(item) {
    this.selectedRow = item.name;
    this.pairId = item.id;
    const data = item.name.split("/");
    this.baseCurrency = data[1];
    this.mainCurrency = data[0];
    localStorage.setItem("selectedMarket", JSON.stringify(item));
    localStorage.setItem("MarketList", JSON.stringify(this.dataList));
    this.router.navigate(["/trade"]);
  }

  receiveAvtar($event) {
    this.avtarImg = $event;
  }

  fullNameEve($event) {
    this.fullName = $event === "null null" ? "" : $event;
  }

  Logout() {
    this.authenticationService.Logout();
    this.router.navigate(["/login"]);
  }

  changeBaseCurrency($event) {
    this.baseCurrency = $event;
  }

  changeMainCurrency($event) {
    this.mainCurrency = $event;
  }

  changePair($event) {
    this.pairId = $event;
  }

  changeOrderType($event) {
    this.orderType = $event;
  }

  changePrice($event) {
    this.price = $event;
  }

  changeAmount($event) {
    this.amount = $event;
  }

  changeTotal($event) {
    this.total = $event;
  }

  changeBuyModel($event) {
    this.buyModel = $event;
  }

  changeSellModel($event) {
    this.sellModel = $event;
  }
}

