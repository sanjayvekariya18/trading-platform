import {
  Component,
  Input,
  OnChanges,
  OnInit,
  EventEmitter,
  Output
} from "@angular/core";
import { environment } from "../../environments/environment";
import { DailyExchange } from "../shared/model/";
import { ApiResponseStatus } from "../shared/common";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit {
  @Input() pairId: string;
  @Input() baseCurrency: string;
  @Input() mainCurrency: string;
  loading = false;
  dailyExchange = new DailyExchange();
  isDailyExchangeLoader = false;
  pairName: string;
  usdPrice: string;
  isOriginal = false;
  constructor() {}

  ngOnInit() {}
}
