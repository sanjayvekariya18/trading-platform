import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { UiModule } from "./ui/ui.module";
import { HomeComponent } from "./home/home.component";
import { ChartComponent } from "./chart/chart.component";
import { OrdersComponent } from "./orders/orders.component";
import { TradeHistoryComponent } from "./trade-history/trade-history.component";
import { BuySellComponent } from "./buy-sell/buy-sell.component";
import { SharedModule } from "./shared";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChartComponent,
    OrdersComponent,
    TradeHistoryComponent,
    BuySellComponent
  ],
  imports: [BrowserModule, SharedModule, AppRoutingModule, UiModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
