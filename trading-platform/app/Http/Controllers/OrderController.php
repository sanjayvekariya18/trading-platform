<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Config;
use App\Currency_pair;
use App\Currency;
use App\Order;
use App\User;
use App\Wallets;
use DB;

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
        $output = "";

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
                                        ->get()->first();
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
                                        ->lmit('1')
                                        ->get()->first();
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
                                    $order->order_no = $this->getOrderNo();
                                    $order->user_id = $request->user_id;
                                    $order->currency_pair_id = $request->currency_pair_id;
                                    $order->amount = $givenAmount;
                                    $order->price = $price1;
                                    $order->side = $request->side;
                                    $order->order_type = $request->order_type;
                                    $order->order_status = "Confirmed";
                                    $order->fee = $chargeAmount;
                                    $order->fee_remark = "Charge:($charge)% $fromCurSym";
                                    $order->save();

                                    $remark1 = "Trade buy confirmed order no. : ".$order->order_no;
                                    $total = $givenAmount * $price1;
                                    $walletParam = array(
                                        'currency_id' => $currencyPair->from_asset,
                                        'user_id' => $request->user_id,
                                        'source' => "Order",
                                        'context_id' => $order->id,
                                        'transaction_type' => "SUB",
                                        'amount' => $total,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletParam);

                                    // Update Previous Order
                                    DB::update('UPDATE orders SET amount = amount - ?, order_status = (CASE WHEN amount <='.$givenAmount.' THEN "Confirmed" ELSE "Pending" DONE) WHERE id = ?', [$givenAmount,$toOrderId]);

                                    $walletParam = array(
                                        'currency_id' => $currencyPair->to_asset,
                                        'user_id' => $request->user_id,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "ADD",
                                        'amount' => $givenAmount,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);

                                    $remark1 = "Charge buy for order no. : ".$order->order_no;
                                    $walletParam = array(
                                        'currency_id' => $currencyPair->to_asset,
                                        'user_id' => $request->user_id,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "SUB",
                                        'amount' => $chargeAmount,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);

                                    $output += "Your Order(" + $order->order_no +" is confirmed for ".$givenAmount." ".$fromCurSym." of ".$price1." ".$toCurSym." <br />>";

                                    $chargeAmount = $total * $charge / 100;

                                    // Create New Order Entry For Seller Trade.
                                    $sellerCurrencyPair = Currency_pair::where('from_asset',$currencyPair->to_asset)->where('to_asset',$currencyPair->from_asset)->get()->first();

                                    $order = new Order;
                                    $order->order_no = $this->getOrderNo();
                                    $order->user_id = $request->user_id;
                                    $order->currency_pair_id = $sellerCurrencyPair->id;
                                    $order->amount = $givenAmount;
                                    $order->price = $price1;
                                    $order->side = ($request->side == "BUY") ? "SELL" : "BUY";
                                    $order->order_type = $request->order_type;
                                    $order->order_status = "Confirmed";
                                    $order->fee = $chargeAmount;
                                    $order->fee_remark = "Charge:($charge)% $fromCurSym";
                                    $order->save();

                                    $remark1 = "Trade sell confirmed order no: ".$order->order_no;

                                     $walletParam = array(
                                        'currency_id' => $currencyPair->from_asset,
                                        'user_id' => $toUserId,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "ADD",
                                        'amount' => $total,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);

                                    $remark1 = "Charge sell for order no: ".$order->order_no;

                                     $walletParam = array(
                                        'currency_id' => $currencyPair->from_asset,
                                        'user_id' => $toUserId,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "SUB",
                                        'amount' => $chargeAmount,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);
                                
                                }else{ // Sell Order

                                    $total = $givenAmount * $price1;
                                    $chargeAmount = $total * $charge / 100;

                                    $order = new Order;
                                    $order->order_no = $this->getOrderNo();
                                    $order->user_id = $request->user_id;
                                    $order->currency_pair_id = $currencyPair->id;
                                    $order->amount = $givenAmount;
                                    $order->price = $price1;
                                    $order->side = $request->side;
                                    $order->order_type = $request->order_type;
                                    $order->order_status = "Confirmed";
                                    $order->fee = $chargeAmount;
                                    $order->fee_remark = "Charge:($charge)% $toCurSym";
                                    $order->save();

                                    $remark1 = "Trade sell confirmed order no: ".$order->order_no;
                                    $total = $givenAmount * $price1;

                                    $walletParam = array(
                                        'currency_id' => $currencyPair->from_asset,
                                        'user_id' => $request->user_id,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "SUB",
                                        'amount' => $givenAmount,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);

                                    DB::update('UPDATE orders SET amount = amount - ?, order_status = (CASE WHEN amount <='.$givenAmount.' THEN "Confirmed" ELSE "Pending" DONE) WHERE id = ?', [$givenAmount,$toOrderId]);

                                    $walletParam = array(
                                        'currency_id' => $currencyPair->to_asset,
                                        'user_id' => $request->user_id,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "ADD",
                                        'amount' => $total,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);

                                    $remark1  = 'Charge sell order no :'.$order->order_no;
                                    $walletParam = array(
                                        'currency_id' => $currencyPair->to_asset,
                                        'user_id' => $request->user_id,
                                        'context_id' => $order->id,
                                        'source' => "Order",
                                        'transaction_type' => "SUB",
                                        'amount' => $chargeAmount,
                                        'remark' => $remark1
                                    );
                                    $this->manageWallet($walletAmount);

                                    $output .= 'Your Order(' .$order->order_no .') is confirmed for '.$givenAmount.' '.$fromCurSym.' of '.$price1.' ' + $toCurSym + ' .<br />';

                                    $chargeAmount = $givenAmount * $charge / 100;
                                }
                            }

                        }
                }
            }
        }
        return response()->json(['output' => $output], 201);
    }

    public function manageWallet($walletParam)
    {
        if($walletParam['user_id'] > 0 && $walletAmount['transaction_type'] == "ADD"){
            // Lock Row by PostgreSql when Updating Wallet Balance
            DB::update('UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND currency_id = ?', [$walletParam['amount'], $walletParam['user_id'], $walletParam['currency_id']]);

            // Track Wallet Transaction
            DB::insert('INSERT INTO wallet_histories SET user_id = ?, source = ?, context_id = ?, transaction_type = ?, amount = ?, remark = ?', [$walletAmount['user_id'],$walletAmount['source'], $walletAmount['context_id'], $walletAmount['transaction_type'], $walletAmount['amount'], $walletAmount['remark']]);

        }else if($walletParam['user_id'] > 0 && $walletAmount['transaction_type'] == "SUB"){

            // Lock Row by PostgreSql when Updating Wallet Balance
            DB::update('UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency_id = ?', [$walletParam['amount'], $walletParam['user_id'], $walletParam['currency_id']]);

            // Track Wallet Transaction
            DB::insert('INSERT INTO wallet_histories SET user_id = ?, source = ?, context_id = ?, transaction_type = ?, amount = ?, remark = ?', [$walletAmount['user_id'],$walletAmount['source'], $walletAmount['context_id'], $walletAmount['transaction_type'], $walletAmount['amount'], $walletAmount['remark']]);
        }
    }

    public function getOrderNo()
    {
        $prefix =  "T";
        $datePart = date('Ym');
        $order = Order::orderBy('id','DESC')->limit(1)->get()->first();
        if($order){
            $incrementPart =  str_pad(substr($order->order_no,7)+1, 8, "0", STR_PAD_LEFT);                
        }else{
            $incrementPart =  str_pad(1, 8, "0", STR_PAD_LEFT);
        }
        $orderNo = $prefix.$datePart.$incrementPart;
        return $orderNo;
    }
}
