import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Exchange } from "../../shared/model/exchange";
import { HttpService } from "./http.service";

@Injectable()
export class ExchangeService {
  constructor(private http: HttpClient, public httpService: HttpService) { }

  GetOrder(currency: string) {
    return this.http.get(
      `${environment.apiUrl}Exchange/GetOrder?currency=${currency}`,
      this.httpService.GetHttpCommon()
    );
  }

  GetDailyExchange(id: number) {
    return this.http.get(
      `${environment.apiUrl}DailyExchange/${id}`,
      this.httpService.GetHttpCommon()
    );
  }

  GetBuyOrder(currency_pair_id: any) {
    return this.http.get(
      `${environment.apiUrl}buy_orders/${currency_pair_id}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetSellOrder(currency_pair_id: any) {
    return this.http.get(
      `${environment.apiUrl}sell_orders/${currency_pair_id}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  OrderStopLimit(model: any) {
    return this.http.post(
      `${environment.apiUrl}private/orderStopLimit`,
      `currency_pair_id=${model.currency_pair_id}&amount=${model.amount}
      &stop=${model.stop}&limit=${model.limit}&side=${model.side}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  BuyTrade(model: Exchange) {
    return this.http.post(
      `${environment.apiUrl}private/orders/create`,
      `currency_pair_id=${model.currency_pair_id}&amount=${model.amount}&price=${model.price}&order_type=${model.order_type}&side=${model.side}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  SellTrade(model: Exchange) {
    return this.http.post(
      `${environment.apiUrl}private/orders/create`,
      `currency_pair_id=${model.currency_pair_id}&amount=${model.amount}&price=${model.price}&order_type=${model.order_type}&side=${model.side}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  BuyMarketTrade(model: any) {
    return this.http.post(
      `${environment.apiUrl}private/orders/create`,
      `currency_pair_id=${model.currency_pair_id}&amount=${model.amount}&order_type=${model.order_type}&side=${model.side}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  SellMarketTrade(model: any) {
    return this.http.post(
      `${environment.apiUrl}private/orders/create`,
      `currency_pair_id=${model.currency_pair_id}&amount=${model.amount}&order_type=${model.order_type}&side=${model.side}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetExchange() {
    return this.http.post(
      `${environment.apiUrl}Exchange/GetExchange`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetUserTrade(obj: any) {
    return this.http.post(
      `${environment.apiUrl}private/orders`,
      `order_status=${obj.order_status}&currency_pair_id=${
      obj.currency_pair_id
      }`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetUserHistory(currency_pair_id: any) {
    return this.http.get(
      `${environment.apiUrl}trade_history/${currency_pair_id}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetWalletBalance(obj: any) {
    return this.http.post(
      `${environment.apiUrl}private/walletAmount`,
      `BaseCurrency=${obj.BaseCurrency}&MainCurrency=${obj.MainCurrency}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetMarketList(id: any) {
    return this.http.get(
      `${environment.apiUrl}currency_pair/${id}`,
      this.httpService.GetJsonHttpCommon()
    );
  }

  GetBaseCurrency() {
    return this.http.get(`${environment.apiUrl}Currency/GetBaseCurrency`);
  }

  GetVolume() {
    return this.http.get(`${environment.apiUrl}Exchange/GetCurrencyVolume`);
  }

  BindCurrencyList() {
    return this.http.get(
      `${environment.apiUrl}User/BindCurrencyList`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  CancelOrder(id: number) {
    return this.http.post(
      `${environment.apiUrl}private/orders/cancel`,
      `order_id=${id}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetUserTradeAnalyze(obj: any) {
    return this.http.post(
      `${environment.apiUrl}User/GetUserTradeAnalyze`,
      obj,
      this.httpService.GetAuthHttpCommon()
    );
  }

  CancelStopLimitOrder(id: number) {
    return this.http.get(
      `${environment.apiUrl}Exchange/CancelStopLimitOrder/${id}`,
      this.httpService.GetAuthHttpCommon()
    );
  }

  GetUserTradeHistory(dataTablesParameters: any) {
    return this.http.post(
      environment.apiUrl + "User/GetUserTradeAnalyze",
      dataTablesParameters,
      this.httpService.GetAuthHttpCommon()
    );
  }
}
