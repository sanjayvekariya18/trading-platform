import { LocationStrategy } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  AuthenticationService,
  ExchangeService,
  ToastService,
  TradeService
} from "../../core/service";
import { ApiResponseStatus, Common } from "../../shared/common";
import { Response } from "../../shared/model";

declare var $: any;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
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
  clsSection = "";
  result: any;
  isExchange = true;
  staticCurrency: { Id: number; Name: string }[] = [
    { Id: 1, Name: "BTC" },
    { Id: 2, Name: "ETH" },
    { Id: 3, Name: "USDT" }
  ];
  buyFirstRowPrice: any;
  sellFirstRowPrice: any;
  newYorkTime: any;
  londonTime: any;
  moscowTime: any;
  isLogin: false;

  constructor(
    private url: LocationStrategy,
    public authenticationService: AuthenticationService,
    public exchangeService: ExchangeService,
    public toast: ToastService,
    public router: Router,
    public common: Common,
    public tradeService: TradeService
  ) {
    this.router.events.subscribe((path: any) => {
      this.route = path.url;
    });
    this.authenticationService.isLoginChanged.subscribe(isLogins => {
      this.isLogin = isLogins;
    });
  }

  ngOnInit() {
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
      localStorage.getItem("buuMarketList") &&
      localStorage.getItem("buuBaseMarketId")
    ) {
      if (localStorage.getItem("buuselectedMarket")) {
        this.result = JSON.parse(localStorage.getItem("buuselectedMarket"));
      } else {
        const marketList = JSON.parse(localStorage.getItem("buuMarketList"));
        this.dataList = marketList;
        this.result = this.dataList.first();
      }
      this.selectedItem = localStorage.getItem("buuBaseMarketId");
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

    const currentUser = JSON.parse(localStorage.getItem("buucurrentUser"));
    this.email = currentUser.email;
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
    localStorage.setItem("buuBaseMarketId", this.selectedItem);
    this.exchangeService.GetMarketList(paramValue).subscribe((res: any) => {
      this.loading = false;
      this.dataList = res.data;
      localStorage.setItem("buuMarketList", JSON.stringify(this.dataList));
    });
  }

  GetRowDetail(item) {
    console.log(item);
    this.selectedRow = item.name;
    this.pairId = item.id;
    const data = item.name.split("/");
    this.baseCurrency = data[1];
    this.mainCurrency = data[0];
    localStorage.setItem("buuselectedMarket", JSON.stringify(item));
    localStorage.setItem("buuMarketList", JSON.stringify(this.dataList));
    this.router.navigate(["/user/market"]);
  }

  receiveAvtar($event) {
    this.avtarImg = $event;
  }

  fullNameEve($event) {
    this.fullName = $event === "null null" ? "" : $event;
  }

  Logout() {
    this.authenticationService.Logout();
    this.router.navigate(["/account/login"]);
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
