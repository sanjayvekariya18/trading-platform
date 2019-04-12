import { NgModule } from '@angular/core';
import { ExchangeModule } from '../exchange';
import { SharedModule } from '../shared';
import { UiModule } from '../ui';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { HomeComponent } from './home/home.component';
import { MarketdataComponent } from './marketdata/marketdata.component';
import { OpenOrderComponent } from './open-order/open-order.component';
import { TradeHistoryComponent } from './trade-history/trade-history.component';
import { UserRoutingModule } from './user.routing';
import { HomeTradeHistoryComponent } from './home-trade-history/home-trade-history.component';

const component = [
  HomeComponent,
  ChangepasswordComponent,
  OpenOrderComponent,
  TradeHistoryComponent,
  MarketdataComponent,
  HomeTradeHistoryComponent,
];

@NgModule({
  exports: [],
  declarations: [...component],
  imports: [SharedModule, UiModule, ExchangeModule, UserRoutingModule]
})
export class UserModule {}
