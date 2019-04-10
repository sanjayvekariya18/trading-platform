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
        if(count($orders) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $orders;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getActiveOrders()
    {
        $orders = Order::where('order_status',"Pending")->get();
        if(count($orders) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $orders;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCloseOrders()
    {
        $orders = Order::where('order_status',"Confirmed")->get();
        if(count($orders) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $orders;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencies()
    {
        $currencies = Currency::all();
        if(count($currencies) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $currencies;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencyPair($currencyId)
    {
        $currency_pairs = Currency_pair::where('from_asset',$currencyId)->with('fromAsset')->with('toAsset')->get();
        $response = array();
        $data = array();
        if(count($currency_pairs) > 0){
            foreach ($currency_pairs as $key => $currency_pair) {
                $data[] = array(
                    'id' => $currency_pair->id,
                    'name' => $currency_pair->toAsset->asset."/".$currency_pair->fromAsset->asset,
                );
            }
            $response['message'] = "SUCCESS";
            $response['data'] = $data;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencyPairs()
    {
        $response = array('message' => "SUCCESS");
        $data = array();
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
            $data[$key]['id'] = $currency_pair->id;
            $data[$key]['name'] = $currency_pair->toAsset->asset."/".$currency_pair->fromAsset->asset;
            if($currentTrade){
                if($previousTrade){
                    $price = (($currentTrade->price - $previousTrade->price)/$previousTrade->price)*100;
                    $data[$key]['change'] = $price;
                }else{
                    $data[$key]['change'] = $currentTrade->price;
                }
                $data[$key]['price'] = $currentTrade->price;
            }else{
                if($previousTrade){
                    $data[$key]['change'] = $previousTrade->price;
                }else{
                    $data[$key]['change'] = 0.00000000;
                }
                $data[$key]['price'] = 0.00000000;
            }
        }
        $response['data'] = $data;
        return response()->json($response, 200);
    }

    public function getTradeHistory($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Confirmed")
                ->get();
        if(count($orders) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $orders;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
         return response()->json($response, 200);
    }

    public function getSellOrders($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Pending")
                ->where('side',"SELL")
                ->orderBy('price')
                ->get();
        if(count($orders) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $orders;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getBuyOrders($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Pending")
                ->where('side',"BUY")
                ->orderBy('price','DESC')
                ->get();
        if(count($orders) > 0){
            $response['message'] = "SUCCESS";
            $response['data'] = $orders;
        }else{
            $response['message'] = "EMPTY";
            $response['data'] = null;
        }
        return response()->json(['orders' => $orders], 200);
    }

    public function getChartData($curPairId)
    {
        $chart = \DB::select("SELECT 	
                    MAX(price) AS high, MIN(price) AS low,
                    COALESCE(        
                    (        
                        SELECT price        
                        FROM orders       
                        WHERE order_status = 'Confirmed' ORDER BY created_at ASC LIMIT 1
                    ),0) as open,
                    COALESCE( 
                    (
                        SELECT price FROM orders 
                        WHERE order_status = 'Confirmed' ORDER BY created_at DESC LIMIT 1 
                    ),0) as close		
                    FROM 
                        orders U       
                    WHERE 
                        order_status = 'Confirmed' 
                        AND currency_pair_id = ".$curPairId
                );
        return response()->json(['data' => $chart], 200);
    }
}
