import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards';
import { HomeComponent } from './home/home.component';
import { MarketdataComponent } from './marketdata/marketdata.component';
import { OpenOrderComponent } from './open-order/open-order.component';
import { TradeHistoryComponent } from './trade-history/trade-history.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'user', canActivate: [AuthGuard] },
      { path: 'market', component: MarketdataComponent },
      { path: 'openorder', component: OpenOrderComponent },
      { path: 'tradehistory', component: TradeHistoryComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class UserRoutingModule { }

