import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import Pusher from 'pusher-js';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { HttpService } from "./http.service";

@Injectable({
    providedIn: 'root',
})
export class PusherService {
    pusher: any;
    ch_chart: any;
    ch_confirm_order: any;
    ch_currency_pair: any;
    ch_pending_order: any;
    ch_my_order: any;
    ch_trade_history: any;
    ch_daily_exchange: any;
    ch_wallet_amount: any;
    constructor(private http: HttpClient, public httpService: HttpService) {
        this.pusher = new Pusher('7b488ce6d8fea3f95cc6', {
            cluster: 'ap2',
            encrypted: true
        });
        this.ch_chart = this.pusher.subscribe('chart');
        this.ch_confirm_order = this.pusher.subscribe('confirm_order');
        this.ch_currency_pair = this.pusher.subscribe('currency_pair');
        this.ch_pending_order = this.pusher.subscribe('pending_order');
        this.ch_my_order = this.pusher.subscribe('my_order');
        this.ch_trade_history = this.pusher.subscribe('trade_history');
        this.ch_daily_exchange = this.pusher.subscribe('daily_exchange');
        this.ch_wallet_amount = this.pusher.subscribe('wallet_amount');
    }
}