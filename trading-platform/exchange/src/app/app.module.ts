import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routes";
import { CoreModule } from "./core";
import { SharedModule } from "./shared";
import { UiModule } from "./ui";
import { HomeComponent } from "./home/main-home/main-home.component";

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    // Angular
    BrowserAnimationsModule,
    BrowserModule,

    // Core & Shared
    CoreModule,
    SharedModule,

    // Feature
    UiModule,

    // app
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
