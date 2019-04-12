import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar/dist/lib/perfect-scrollbar.interfaces';
import { ExchangeService } from '../../core/service/exchange.service';
import { ApiResponseStatus } from '../../shared/common';
import { Response, TradeHistorySearch } from '../../shared/model';
import { Subject } from 'rxjs/internal/Subject';
import { DataTableDirective } from 'angular-datatables/src/angular-datatables.directive';

import * as $ from 'jquery';
import 'datatables.net';

@Component({
  selector: 'app-trade-history',
  templateUrl: './trade-history.component.html'
})
export class TradeHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  ope = true;
  ope1 = true;
  mainCurrencyList: any;
  baseCurrencyList: any;
  tradeHisList: any;
  avgBuyPrice: number;
  avgSellPrice: number;
  totalBuyPrice: number;
  totalSellPrice: number;
  loading = false;
  hiddenSummaryDiv = true;
  config: PerfectScrollbarConfigInterface = {};
  tradeHistorySearch: TradeHistorySearch;
  tradeType: any = null;
  searchFromDate: any = null;
  searchToDate: any = null;

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtTrigger = new Subject();
  dtOptions: DataTables.Settings = {};

  constructor(private exchangeService: ExchangeService) {
    this.tradeHistorySearch = new TradeHistorySearch();
  }

  ngOnInit() {
    this.BindCurrencyList();
    this.tradeHistorySearch.BuySellType = 0;
    this.tradeHistorySearch.MainCurrency = 0;
    this.tradeHistorySearch.BaseCurrency = 0;
    this.hiddenSummaryDiv = true;
    this.getTradeHis(null);
    const scroll = $('.cr__inner_content').innerHeight() - 192;
    $('.trade__table_scroll').height(scroll);
  }

  // onFilterChanged(evt) {
  //   this.hiddenSummaryDiv = true;
  //   if (this.ope === true) {
  //     this.ope = false;
  //   }
  // }

  OntradeChange(evt) {
    this.tradeType = this.tradeHistorySearch.BuySellType;
    if (this.tradeType === '0') {
      this.tradeType = null;
    }
    this.rerender();
  }

  onfromdateChange(evt) {
    this.hiddenSummaryDiv = true;
    if (this.ope === true) {
      this.ope = false;
    } else {
      this.searchFromDate = evt;
      this.rerender();
    }
  }

  ontodateChange(evt) {
    this.hiddenSummaryDiv = true;
    if (this.ope1 === true) {
      this.ope1 = false;
    } else {
      this.searchToDate = evt;
      this.rerender();
    }
  }

  FnReset() {
    debugger;
    this.tradeHistorySearch = new TradeHistorySearch();
    this.tradeHistorySearch.BuySellType = 0;
    this.tradeHistorySearch.MainCurrency = 0;
    this.tradeHistorySearch.BaseCurrency = 0;
    this.tradeType = null;
    this.searchFromDate = null;
    this.searchToDate = null;
    this.hiddenSummaryDiv = true;
    this.getTradeHis(null);
  }
  BindCurrencyList() {
    this.exchangeService.BindCurrencyList().subscribe((data: Response) => {
      if (data.ResponseStatus === ApiResponseStatus.Ok) {
        this.mainCurrencyList = data.Data.filter(function(el) {
          return el.Type === 'MAIN';
        });
        this.baseCurrencyList = data.Data.filter(function(el) {
          return el.Type === 'BASE';
        });
      }
    });
  }
  // FnAnalyzeUserTradeHistory(event) {
  //   if (event != null) {
  //     this.hiddenSummaryDiv = event.target.id === 'BTNANALYZE' ? false : true;
  //   }
  //   this.loading = true;
  //   const jsonObj = {
  //     BaseCurrency: this.tradeHistorySearch.BaseCurrency,
  //     MainCurrency: this.tradeHistorySearch.MainCurrency
  //   };
  //   this.exchangeService.GetUserTradeAnalyze(jsonObj)
  //     .subscribe((data: any) => {
  //       if (data.ResponseStatus === ApiResponseStatus.Ok) {
  //         this.tradeHisList = data.Data.Table;
  //         const tradeSummary = data.Data.Table1;
  //         this.avgBuyPrice = tradeSummary[0].AvgPrice;
  //         this.totalBuyPrice = tradeSummary[0].Total;
  //         this.avgSellPrice = tradeSummary[1].AvgPrice;
  //         this.totalSellPrice = tradeSummary[1].Total;
  //       }
  //       this.loading = false;
  //     });
  // }

  getTradeHis(event) {
    if (event != null) {
      this.hiddenSummaryDiv = event.target.id === 'BTNANALYZE' ? false : true;
    }
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 17,
      lengthMenu: [15, 25, 50, 100],
      serverSide: true,
      processing: false,
      // scrollY: '60vh',
      scrollCollapse: true,
      searching: false,
      lengthChange: false,
      ordering: false,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.MainCurrency = this.tradeHistorySearch.MainCurrency;
        dataTablesParameters.BaseCurrency = this.tradeHistorySearch.BaseCurrency;
        dataTablesParameters.TradeType = this.tradeType;
        dataTablesParameters.FromDate = this.searchFromDate;
        dataTablesParameters.ToDate = this.searchToDate;
        this.exchangeService
          .GetUserTradeHistory(dataTablesParameters)
          .subscribe((resp: any) => {
            this.tradeHisList = resp.Data.result.Table;
            const tradeSummary = resp.Data.result.Table1;
            this.avgBuyPrice = tradeSummary[0].AvgPrice;
            this.totalBuyPrice = tradeSummary[0].Total;
            this.avgSellPrice = tradeSummary[1].AvgPrice;
            this.totalSellPrice = tradeSummary[1].Total;
            callback({
              recordsTotal: resp.Data.recordsTotal,
              recordsFiltered: resp.Data.recordsFiltered,
              data: []
            });
          });
      },
      columns: [
        { title: 'Market', data: 'Market' },
        { title: 'Type', data: 'Type' },
        { title: 'Price', data: 'Price' },
        { title: 'Amount', data: 'Amount' },
        { title: 'Fee', data: 'Fee' },
        { title: 'Total', data: 'Total' },
        { title: 'TransactionDate', data: 'TransactionDate' }
      ]
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getTradeHisFilter(event) {
    if (event != null) {
      this.hiddenSummaryDiv = event.target.id === 'BTNANALYZE' ? false : true;
      this.rerender();
    }
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
