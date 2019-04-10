import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-buy-sell",
  templateUrl: "./buy-sell.component.html",
  styleUrls: ["./buy-sell.component.css"]
})
export class BuySellComponent implements OnInit {
  @Input() baseCurrency: string;
  @Input() mainCurrency: string;
  @Input() pairId: string;
  @Input() orderType: number;
  @Input() price: number;
  @Input() amount: number;
  @Input() total: number;
  @Input() buyModel: any;
  @Input() sellModel: any;
  constructor() {}

  ngOnInit() {}
}
