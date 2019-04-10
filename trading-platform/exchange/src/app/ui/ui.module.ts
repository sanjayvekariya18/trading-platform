import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header/header.component";
import { ContentComponent } from "./content/content.component";
import { LoaderComponent } from "./loader/loader.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
@NgModule({
  declarations: [HeaderComponent, ContentComponent, LoaderComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [HeaderComponent, ContentComponent, LoaderComponent]
})
export class UiModule {}
