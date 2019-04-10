import {
  Component,
  OnInit,
  Input,
  OnChanges,
  EventEmitter,
  Output
} from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces";
@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.css"]
})
export class OrdersComponent implements OnInit {
  @Input() baseCurrency: string;
  @Input() mainCurrency: string;
  @Input() pairId: string;
  config: PerfectScrollbarConfigInterface = {};
  constructor() {}

  ngOnInit() {}
}
