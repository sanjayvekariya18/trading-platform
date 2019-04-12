import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/main-home/main-home.component";
import { NotfoundComponent } from "./ui/notfound/notfound.component";

const routes: Routes = [
  { path: "", redirectTo: "user/market", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  {
    path: "account",
    loadChildren: "src/app/account/account.module#AccountModule"
  },
  { path: "user", loadChildren: "src/app/user/user.module#UserModule" },
  { path: "**", component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
