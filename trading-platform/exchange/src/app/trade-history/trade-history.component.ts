import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";
import { ApiResponseStatus } from "../shared/common";
import { Response, TradeHistorySearch } from "../shared/model";
import { Subject } from "rxjs/internal/Subject";

@Component({
  selector: "app-trade-history",
  templateUrl: "./trade-history.component.html",
  styleUrls: ["./trade-history.component.css"]
})
export class TradeHistoryComponent implements OnInit {
  @Input() baseCurrency: string;
  @Input() mainCurrency: string;
  @Input() pairId: string;
  constructor() {}

  ngOnInit() {}
}
