import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { ModalDirective } from "ngx-bootstrap/modal";
import {
  AuthenticationService,
  ExchangeService,
  ToastService,
  TradeService
} from "../../core/service";
import { ApiResponseStatus, Common } from "../../shared/common";
import { Validator } from "../../shared/common/common.validator";
import { Exchange, Response, MarketExchangeModal } from "../../shared/model";

@Component({
  selector: "app-market-exchange",
  templateUrl: "./market-exchange.component.html",
  styles: []
})
export class MarketExchangeComponent implements OnInit, OnChanges {
  @ViewChild(ModalDirective) public modal: ModalDirective;
  exchange = new MarketExchangeModal();
  buyForm: FormGroup;
  sellForm: FormGroup;
  isBuyLoading = false;
  isSellLoading = false;
  pairName: string;
  isSellSubmitted = false;
  isBuySubmitted = false;
  buysellmsg = "";
  isOpen = false;
  isLogin: boolean;
  isWalletBal = false;

  @Input() baseCurrency: string;
  @Input() mainCurrency: string;
  @Input() pairId: string;
  @Input() orderType: number;
  @Input() price: number;
  @Input() amount: number;
  @Input() total: number;
  @Input() buyModel: any;
  @Input() sellModel: any;
  arrBalPerc = [25, 50, 75, 100];

  constructor(
    public authenticationService: AuthenticationService,
    public exchangeService: ExchangeService,
    public fb: FormBuilder,
    public toast: ToastService,
    public tradeService: TradeService,
    public common: Common
  ) {
    this.authenticationService.isLoginChanged.subscribe((isLogin: any) => {
      setTimeout(() => (this.isLogin = isLogin), 0);
    });
  }

  ngOnInit() {
    this.BindData();
    this.authenticationService.CheckUserLoggedIn();
  }

  BindData() {
    this.buyForm = new FormGroup({
      amount: new FormControl("", [Validator.checkAmountValid])
    });
    this.sellForm = new FormGroup({
      amount: new FormControl("", [Validator.checkAmountValid])
    });
  }

  ngOnChanges(change: any) {
    if (change.pairId !== undefined) {
      this.pairId =
        change.pairId !== undefined ? change.pairId.currentValue : this.pairId;
    }

    if (
      change.baseCurrency !== undefined ||
      change.mainCurrency !== undefined
    ) {
      this.exchange.BaseCurrency =
        change.baseCurrency !== undefined
          ? change.baseCurrency.currentValue
          : this.baseCurrency;
      this.exchange.MainCurrency =
        change.mainCurrency !== undefined
          ? change.mainCurrency.currentValue
          : this.mainCurrency;
      this.pairName = `${this.mainCurrency}/${this.baseCurrency}`;
      this.GetExchange(change);
      this.getOrderFirstRow(this.pairName);
    }
  }

  GetExchange(change): void {
    this.ResetForm();
    const obj = {
      BaseCurrency: this.baseCurrency,
      MainCurrency: this.mainCurrency
    };
    this.exchangeService.GetWalletBalance(obj).subscribe((res: any) => {
      if (res != null) {
        this.BindExchange(res);
      }
    });
  }

  BindExchange(res: any) {
    this.exchange.BaseValue = res.data.BaseCurrencyValue;
    this.exchange.MainValue = res.data.MainCurrencyValue;
  }

  BuyMarket(model: Exchange, isValid: boolean) {
    this.isBuySubmitted = true;
    if (isValid) {
      this.isBuyLoading = true;
      const obj = {
        currency_pair_id: this.pairId,
        amount: model.amount,
        order_type: "MARKET",
        side: "BUY"
      };
      this.exchangeService.BuyMarketTrade(obj).subscribe((res: any) => {
        if (res != null) {
          this.isBuySubmitted = false;
          this.ResetForm();
          this.GetExchange(null);
          this.buysellmsg = res.output;
          this.RefreshMarket(this.pairId);
          this.ShowPopUp();
        } else {
          this.toast.error(res.output);
        }
        this.isBuyLoading = false;
      });
    }
  }

  SellMarket(model: Exchange, isValid: boolean) {
    this.isSellSubmitted = true;
    const minVal = parseFloat(this.exchange.MainValue.toString()).toFixed(8);
    if (isValid) {
      if (model.amount >= minVal) {
        this.isWalletBal = true;
        return false;
      }
      this.isSellLoading = true;
      const obj = {
        currency_pair_id: this.pairId,
        amount: model.amount,
        order_type: "MARKET",
        side: "SELL"
      };
      this.exchangeService.SellMarketTrade(obj).subscribe((res: any) => {
        if (res !== null) {
          this.isSellSubmitted = false;
          this.ResetForm();
          this.GetExchange(null);
          this.buysellmsg = res.output;
          this.RefreshMarket(this.pairId);
          this.ShowPopUp();
        } else {
          this.toast.error(res.data.message);
        }
        this.isSellLoading = false;
      });
    }
  }

  RefreshMarket(pairId) {
    // const baseMarketId = localStorage.getItem("BaseMarketId");
    // this.tradeService.MarketRefresh(baseMarketId);
    // this.tradeService.ChartRefresh();
    // this.tradeService.GetDailyExchange(pairId);
    // this.tradeService.TradeHistory(pairId);
  }

  calcBalance(value, type) {
    this.getOrderFirstRow(this.pairName);
    for (let i = 0; i < this.arrBalPerc.length; i++) {
      const element = this.arrBalPerc[i];
      if (value === element) {
        if (type === "buy") {
          const newTotalAmt = parseFloat(
            ((this.exchange.BaseValue * value) / 100).toString()
          ).toFixed(8);
          this.exchange.BuyAmount =
            this.exchange.SellPrice == null
              ? 0
              : this.common.toFixedCustom(
                parseFloat(newTotalAmt) / this.exchange.SellPrice,
                8
              );
        } else {
          const newTotalAmt = parseFloat(
            ((this.exchange.MainValue * value) / 100).toString()
          ).toFixed(8);
          this.exchange.SellAmount = parseFloat(newTotalAmt);
        }
      }
    }
  }

  getOrderFirstRow(pair: any) {
    /* this.exchangeService.GetOrder(pair).subscribe((res: any) => {
      if (res != null) {
        const dtList = res.data;

        if (dtList.sellList.length !== 0) {
          this.exchange.SellPrice = this.common.toFixedCustom(
            dtList.sellList.first().Price,
            8
          );
        } else {
          this.exchange.SellPrice = 0;
        }
      }
    }); */
  }

  setAmtValid() {
    this.isWalletBal = false;
  }
  ClosePopUp() {
    this.modal.hide();
    this.isOpen = false;
  }

  ShowPopUp() {
    this.modal.show();
    this.isOpen = true;
  }

  ResetForm() {
    this.exchange.BuyAmount = null;
    this.exchange.SellAmount = null;
    this.isBuySubmitted = false;
    this.isSellSubmitted = false;
  }
}
