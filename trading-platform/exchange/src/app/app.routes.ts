import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotfoundComponent } from "./ui/notfound/notfound.component";
import { TradeComponent } from "./trade/trade.component";

const routes: Routes = [
  { path: "", redirectTo: "/", pathMatch: "full" },
  { path: 'trade', component: TradeComponent },
  {
    path: "account",
    loadChildren: "src/app/account/account.module#AccountModule"
  },
  { path: "**", component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
