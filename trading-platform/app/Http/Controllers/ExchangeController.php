<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Order;
use App\Currency;
use App\Currency_pair;
use App\User;
use App\Wallets;
use Carbon\Carbon;
class ExchangeController extends Controller
{
    public function getAllOrders()
    {
        $orders = Order::all();
        if(count($orders) > 0){
            $response['success'] = true;
            $response['data'] = $orders;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getActiveOrders()
    {
        $orders = Order::where('order_status',"Pending")->get();
        if(count($orders) > 0){
            $response['success'] = true;
            $response['data'] = $orders;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCloseOrders()
    {
        $orders = Order::where('order_status',"Confirmed")->get();
        if(count($orders) > 0){
            $response['success'] = true;
            $response['data'] = $orders;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencies()
    {
        $currencies = Currency::all();
        if(count($currencies) > 0){
            $response['success'] = true;
            $response['data'] = $currencies;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencyPair($currencyId)
    {
        if(is_numeric($currencyId)){
            $currency_pairs = Currency_pair::where('from_asset',$currencyId)->with('fromAsset')->with('toAsset')->get();
        }else{
            if($currencyId != "undefined"){
                $pair = explode('_',$currencyId);
                $fromCurency = Currency::where('asset',$pair[1])->first();
                $currency_pairs = Currency_pair::
                                where('from_asset',$fromCurency->id)
                                ->with('fromAsset')->with('toAsset')->get();
            }else{
                $currency_pairs = Currency_pair::
                    where('from_asset',1)
                    ->with('fromAsset')->with('toAsset')->get();
            }
        }
        $response = array();
        $data = array();
        if(count($currency_pairs) > 0){
            $response['success'] = true;
            $response['data'] = $this->getCurrencyChange($currency_pairs);
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencyPairs()
    {
        $data = array();
        $currency_pairs = Currency_pair::with('fromAsset')->with('toAsset')->get();
        if(count($currency_pairs) > 0){
            $response['success'] = true;
            $response['data'] = $this->getCurrencyChange($currency_pairs);
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getCurrencyChange($currency_pairs)
    {
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
            $data[$key]['base_currency_id'] = $currency_pair->from_asset;
            
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
        return $data;
    }

    public function getTradeHistory($pairId)
    {
        $orders = Order::
                where('currency_pair_id',$pairId)
                ->where('order_status',"Confirmed")
                ->get();
        if(count($orders) > 0){
            $response['success'] = true;
            $response['data'] = $orders;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
         return response()->json($response, 200);
    }

    public function getSellOrders($pairId)
    {
        $orders = Order::
                selectRaw('price,SUM(amount) as amount,side')
                ->where('currency_pair_id',$pairId)
                ->where('order_status',"Pending")
                ->where('side',"SELL")
                ->orderBy('price')
                ->groupBy('price')
                ->groupBy('side')
                ->get();
        if(count($orders) > 0){
            $response['success'] = true;
            $response['data'] = $orders;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getBuyOrders($pairId)
    {
        $orders = Order::
                selectRaw('price,SUM(amount) as amount,side')
                ->where('currency_pair_id',$pairId)
                ->where('order_status',"Pending")
                ->where('side',"BUY")
                ->orderBy('price','DESC')
                ->groupBy('price')
                ->groupBy('side')
                ->get();
        if(count($orders) > 0){
            $response['success'] = true;
            $response['data'] = $orders;
        }else{
            $response['success'] = false;
            $response['data'] = null;
        }
        return response()->json($response, 200);
    }

    public function getDailyExchange($curPairId)
    {
       /* 
        Last Price
        Daily Change
        highest24hours
        lowest24hours
        Volume24Hours
       */
        $currentTrade = Order::orderBy('id','desc')
                    ->where('currency_pair_id',$curPairId)
                    ->where('order_status','Confirmed')
                    ->whereDate('updated_at',date('Y-m-d'))
                    ->limit(1)
                    ->get()->first();
            
        $previousTrade = Order::orderBy('id','desc')
                    ->where('currency_pair_id',$curPairId)
                    ->where('order_status','Confirmed')
                    ->whereDate('updated_at',date('Y-m-d',strtotime("-1 days")))
                    ->limit(1)
                    ->get()->first();

        $last24Hour = Order::selectRaw('MIN(price),MAX(price),SUM(price*amount)')
                    ->where('currency_pair_id',$curPairId)
                    ->where('order_status','Confirmed')
                    ->where('created_at', '>=', Carbon::now()->subDay())
                    ->first();

        $data['highest24hours'] = $last24Hour->max;
        $data['lowest24hours'] = $last24Hour->min;
        $data['volume24hours'] = $last24Hour->sum;
        
        if($currentTrade){
            if($previousTrade){
                $price = (($currentTrade->price - $previousTrade->price)/$previousTrade->price)*100;
                $data['dailyChange'] = $price;
            }else{
                $data['dailyChange'] = $currentTrade->price;
            }
            $data['lastPrice'] = $currentTrade->price;
        }else{
            if($previousTrade){
                $data['dailyChange'] = $previousTrade->price;
            }else{
                $data['dailyChange'] = 0.00000000;
            }
            $data['lastPrice'] = 0.00000000;
        }
        
        $response['success'] = true;
        $response['data'] = $data;
        
        return response()->json($response, 200);
    }

    public function getChartData($curPairId,$interval)
    {
        $chart = \DB::select("SELECT  
                        to_timestamp(floor((extract('epoch' from created_at) / $interval )) * $interval) 
                        AT TIME ZONE 'UTC' as time_interval,
                        (array_agg(price ORDER BY created_at ASC))[1] o,
                        (array_agg(price ORDER BY created_at DESC))[1] c,
                        MAX(price) h,
                        MIN(price) l,
                        SUM(amount) vol
                    FROM orders  
                    where currency_pair_id = $curPairId AND
                    order_status = 'Confirmed'
                    GROUP BY time_interval
                    ORDER BY time_interval");
        $response = array('success'=> true,'data'=>$chart);
        return response()->json($response, 200);
    }
}
