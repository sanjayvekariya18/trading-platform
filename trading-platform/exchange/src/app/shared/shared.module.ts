import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from "ngx-perfect-scrollbar/dist/ngx-perfect-scrollbar";
import { Common } from "./common";
import { EightDigitDirective, NumberOnlyDirective } from "./directive";
import {
  DateFormatPipe,
  DynamicDigitPipe,
  FilterArrayPipe,
  SplitString,
  TradeDatePipe,
  ZeroFilterPipe
} from "./pipes";
import "./common/array-extensions";
import "./common/date-extensions";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

const pipes = [
  DateFormatPipe,
  DynamicDigitPipe,
  TradeDatePipe,
  FilterArrayPipe,
  SplitString,
  ZeroFilterPipe
];

const directives = [EightDigitDirective, NumberOnlyDirective];

@NgModule({
  declarations: [],
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: "never" })
    // 3rd party
  ],
  // declarations: [...pipes, ...directives],
  exports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    Common
  ]
})
export class SharedModule {}
