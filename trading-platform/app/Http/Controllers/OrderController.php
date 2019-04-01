<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Config;
use App\Currency_pair;
use App\Currency;
use App\Order;
use App\User;
use App\Wallets;

class OrderController extends Controller
{
    /**
     * Display a listing of the Order By Status.
     *
     * @return \Illuminate\Http\Response
     */
    public function tradeOrders(Request $request)
    {
        $orders = Order::where('user_id',\Auth::user()->id)
                        ->where('order_status',$request->order_status)
                        ->orderBy('updated_at','DESC')
                        ->get();
        return response()->json(['orders' => $orders], 200);
    }

    /**
     * Store a newly created Order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $currencyPair = Currency_pair::find($request->currency_pair_id);   
        $walletAmount = Wallet::where('user_id',\Auth::user()->id)
                        ->where('currency_id',$currencyPair->from)
                        ->get()->first();
        
        $charge = Config::where('name','trade_fee')->value;
        $minTrade = Config::where('name','min_trade')->value;
        
        $fromCurSym = $currencyPair->from_asset->asset; 
        $toCurSym = $currencyPair->to_asset->asset; 

        if($request->price > 0 AND $request->amount > 0){
            if(($request->price * $request->amount) >= $minTrade){
                if(($walletAmount >= ($request->price * $request->amount) && $request->side = "BUY") || 
                    ($request->side = "SELL" && $walletAmount >= $request->amount)){
                        $Remaining = $request->amount;
                        while($Remaining > 0){
                            
                            if($request->side == "BUY"){ // For Buy Order
                                $toOrderId = NULL;
                                $order = Orders::where('side','!=',$request->side)
                                        ->where('price','<=',$request->price)
                                        ->where('order_status',"Pending")
                                        ->where('amount',' >' ,0)
                                        ->where('currency_pair_id',$request->currency_pair_id)
                                        ->orderBy('price','DESC')
                                        ->orderBy('id')
                                        ->limit(1)
                                        ->get();
                                $availableAmount = $order->amount;
                                $toOrderId = $order->id;
                                $toUserId = $order->user_id;
                                $price1 = $order->price;
                            }else{ // For Sell Order
                                $toOrderId = NULL;
                                $order = Orders::where('side','!=',$request->side)
                                        ->where('price','>=',$request->price)
                                        ->where('order_status',"Pending")
                                        ->where('amount',' >' ,0)
                                        ->where('currency_pair_id',$request->currency_pair_id)
                                        ->orderBy('price','DESC')
                                        ->orderBy('id')
                                        ->get();
                                $availableAmount = $order->amount;
                                $toOrderId = $order->id;
                                $toUserId = $order->user_id;
                                $price1 = $order->price;
                            }

                            if($toOrderId > 0){
                                if($availableAmount >= $Remaining){ /* If order is less then available trade */
                                    $givenAmount = $Remaining;
                                    $Remaining = 0;
                                }else{
                                    $givenAmount = $availableAmount;
                                    $Remaining = $Remaining - $availableAmount;
                                }

                                if($request->side == "BUY"){ // For Buyer Order
                                    $total = $givenAmount * $price1;
                                    $chargeAmount = $givenAmount * $charge / 100;

                                    /* Insert Confirm Trade With Charge */
                                    $order = new Order;
                                    $order->order_no = "T2019030004";
                                    $order->user_id = $request->user_id;
                                    $order->currency_pair_id = $request->currency_pair_id;
                                    $order->amount = $givenAmount;
                                    $order->price = $price1;
                                    $order->side = $request->side;
                                    $order->order_type = $request->order_type;
                                    $order->order_status = "Confirmed";
                                    $order->fee_remark = "Charge:($charge)% $fromCurSym";
                                    $order->save();

                                    $remark1 = "Trade buy confirmed order no. : ".$order->order_no;
                                    $total = $givenAmount * $price1;
                                    $this->manageWallet($request->user_id,$currencyPair->from_asset,"SUB",$total,$order->id,$remark1);
                                }
                            }

                        }
                }
            }
        }
        $order =  Order::create($request->all());
        return response()->json(['order' => $order], 201);
    }

    public function manageWallet($userId,$fromAsset,$type,$total,$orderId,$remark)
    {
        
    }
}
