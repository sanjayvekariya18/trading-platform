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

        $currency_pairs = Currency_pair::with('fromAsset')->with('toAsset')->get();
        foreach ($currency_pairs as $key => $currency_pair) {
            $currentTrade = Order::orderBy('id','desc')
                                        ->where('currency_pair_id',$currency_pair->id)
                                        ->where('order_status','Confirmed')
                                        ->whereDate('updated_at',date('Y-m-d'))
                                        ->limit(1)
                                        ->get()->first();
            
            $previousTrade = Order::orderBy('id','desc')
                                        ->where('currency_pair_id',$currency_pair->id)
                                        ->where('order_status','Confirmed')
                                        ->whereDate('updated_at',date('Y-m-d',strtotime("-1 days")))
                                        ->limit(1)
                                        ->get()->first();

            if($currentTrade){
                if($previousTrade){
                    $price = (($currentTrade->price - $previousTrade->price)/$previousTrade->price)*100;
                    $currency_pairs[$key]->change = $price;
                }else{
                    $currency_pairs[$key]->change = $currentTrade->price;
                }
                $currency_pairs[$key]->price = $currentTrade->price;
            }else{
                if($previousTrade){
                    $currency_pairs[$key]->change = $previousTrade->price;
                }else{
                    $currency_pairs[$key]->change = 0.00000000;
                }
                $currency_pairs[$key]->price = 0.00000000;
            }
        }
        return response()->json(['currency_pairs' => $currency_pairs], 200);
    }

    public function getTradeHistory($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Confirmed")
                ->get();
        return response()->json(['orders' => $orders], 200);
    }

    public function getSellOrders($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Pending")
                ->where('side',"SELL")
                ->orderBy('price')
                ->get();
        return response()->json(['orders' => $orders], 200);
    }

    public function getBuyOrders($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Pending")
                ->where('side',"BUY")
                ->orderBy('price','DESC')
                ->get();
        return response()->json(['orders' => $orders], 200);
    }
}
