<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Order;
use App\Currency;
use App\Currency_pair;
use App\User;
use App\Wallets;

class ExchangeController extends Controller
{
    public function getAllOrders()
    {
        $orders = Order::all();
        return response()->json(['orders' => $orders], 200);
    }

    public function getActiveOrders()
    {
        $orders = Order::where('order_status',"Active")->get();
        return response()->json(['orders' => $orders], 200);
    }

    public function getCloseOrders()
    {
        $orders = Order::where('order_status',"Close")->get();
        return response()->json(['orders' => $orders], 200);
    }

    public function getCurrencies()
    {
        $currencies = Currency::all();
        return response()->json(['currencies' => $currencies], 200);
    }

    public function getCurrencyPairs()
    {
        $currency_pairs = Currency_pair::all();
        return response()->json(['currency_pairs' => $currency_pairs], 200);
    }

    
}
