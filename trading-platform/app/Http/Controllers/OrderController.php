<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Config;
use App\Currency_pair;
use App\Currency;
use App\Order;
use App\Order_stop_limit;
use App\User;
use App\Wallets;
use DB;
use Ixudra\Curl\Facades\Curl;
class OrderController extends Controller
{

    public function data()
    {
        // $response = Curl::to('https://webapi.listerexchange.com/api/Exchange/GetOrder?currency=LTCC/BTC')->get();
        $response = Curl::to('https://webapi.listerexchange.com/api/Exchange/GetUserTrade?id=2')->get();
        echo "<pre>";
        $json = json_decode($response);
        print_r($json);
       /*  echo $this->getOrderNo();
        die; */
        foreach ($json->Data as $order) {
        // foreach ($json->Data->sellList as $order) {
        // foreach ($json->Data->buyList as $order) {
        $data = array(
                'order_no' => $this->getOrderNo(),
                'user_id' => 2,
                'currency_pair_id' => 3,
                'amount' => $order->Amount,
                'price' => $order->Price,
                'side' => "SELL",
                'order_type' => "Market",
                // 'order_status' => "Pending",
                'order_status' => "Confirmed",
            );
            Order::insert($data);
        }
    }

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
        
        DB::beginTransaction();
        DB::enableQueryLog();

            // Get Currency Pair For Buyer
            $currencyPair = Currency_pair::find($request->currency_pair_id);

            // Get Currency Pair For Seller
            $sellerCurrencyPair = Currency_pair::where('from_asset',$currencyPair->to_asset)->where('to_asset',$currencyPair->from_asset)->get()->first();

            // Get Currency Symbol For Insert Note into Remark 
            $fromCurSym = $currencyPair->fromAsset->asset; 
            $toCurSym = $currencyPair->toAsset->asset;

            // Get Configuration Setting
            $charge = Config::where('name','trade_fee')->get()->first()->value;
            $minTrade = Config::where('name','min_trade')->get()->first()->value;
            
            // Get User Wallet for Given Currency
            $walletAmount = Wallets::where('user_id',\Auth::user()->id)
                            ->where('currency_id',$currencyPair->from_asset)
                            ->get()->first();

             // Check User Wallet is Exist or Not
            if(!$walletAmount){
                $output .= "Wallet Not Found For Currency[".$currencyPair->fromAsset->asset."]";
                return response()->json(['output' => $output], 200);
            } 

            // Check Request Quantity and Price is Greater Then 0
            if($request->price <= 0 || $request->amount <= 0){
                $output .= "Please enter valid amount.";
                return response()->json(['output' => $output], 200);
            }

            // Check Trade Value is Greater or Equal Min. Trade
            if(($request->price * $request->amount) < $minTrade){
                $output .= 'Please enter mininum price :'.$minTrade;
                return response()->json(['output' => $output], 200);
            }

            // Check User Wallet Balance is Greater Then Trade Value For Buyer and Seller
            if(($request->side == "BUY" && $walletAmount->balance < ($request->price * $request->amount)) || 
                ($request->side == "SELL" && $walletAmount->balance < $request->amount)){

                    $output .= 'You have not sufficient fund to do this trade.';
                    return response()->json(['output' => $output], 200);
            }

            // Get Reuqested Quantity Into Another Variable
            $Remaining = $request->amount;

            // Loop continue till total quantities are buy or sell.
            while($Remaining > 0){
                
                if($request->side == "BUY"){ // For Buy Order
                    $toOrderId = NULL;
                    $order = Order::where('side','!=',$request->side)
                            ->where('price','<=',$request->price)
                            ->where('order_status',"Pending")
                            ->where('amount','>' ,0)
                            ->where('currency_pair_id',$request->currency_pair_id)
                            ->orderBy('price')
                            ->orderBy('id')
                            ->limit(1)
                            ->get()->first();
                    if($order){
                        $availableAmount = $order->amount;
                        $toOrderId = $order->id;
                        $toUserId = $order->user_id;
                        $price1 = $order->price;
                    }else{
                        $toOrderId = 0;
                    }
                }else{ // For Sell Order
                    $toOrderId = NULL;
                    $order = Order::where('side','!=',$request->side)
                            ->where('price','>=',$request->price)
                            ->where('order_status',"Pending")
                            ->where('amount','>' ,0)
                            ->where('currency_pair_id',$request->currency_pair_id)
                            ->orderBy('price','DESC')
                            ->orderBy('id')
                            ->limit(1)
                            ->get()->first();
                    if($order){
                        $availableAmount = $order->amount;
                        $toOrderId = $order->id;
                        $toUserId = $order->user_id;
                        $price1 = $order->price;
                    }else{
                        $toOrderId = 0;
                    }
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
                        $order->user_id = \Auth::user()->id;
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
                            'user_id' => \Auth::user()->id,
                            'source' => "Order",
                            'context_id' => $order->id,
                            'transaction_type' => "SUB",
                            'amount' => $total,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        // Update Previous Order
                        DB::table('orders')
                                ->where('id',$toOrderId)
                                ->update(
                                    [
                                        'order_status' => DB::raw("CASE WHEN amount <=".$givenAmount." THEN 'Confirmed' ELSE 'Pending' END"),
                                        'amount' => DB::raw('amount - '.$givenAmount)
                                    ]
                                );
                        
                        $walletParam = array(
                            'currency_id' => $currencyPair->to_asset,
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "ADD",
                            'amount' => $givenAmount,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        $remark1 = "Charge buy for order no. : ".$order->order_no;
                        $walletParam = array(
                            'currency_id' => $currencyPair->to_asset,
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "SUB",
                            'amount' => $chargeAmount,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        $output .= "Your Order(".$order->order_no." is confirmed for ".$givenAmount." ".$fromCurSym." of ".$price1." ".$toCurSym." <br />";

                        $chargeAmount = $total * $charge / 100;

                        // Create New Order Entry For Seller Trade.
                        $order = new Order;
                        $order->order_no = $this->getOrderNo();
                        $order->user_id = $toUserId;
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
                        $this->manageWallet($walletParam);

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
                        $this->manageWallet($walletParam);
                    
                    }else{ // Sell Order

                        $total = $givenAmount * $price1;
                        $chargeAmount = $total * $charge / 100;

                        $order = new Order;
                        $order->order_no = $this->getOrderNo();
                        $order->user_id = \Auth::user()->id;
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
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "SUB",
                            'amount' => $givenAmount,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        DB::table('orders')
                                ->where('id',$toOrderId)
                                ->update(
                                    [
                                        'amount' => DB::raw('amount - '.$givenAmount),
                                        'order_status' => DB::raw("CASE WHEN amount <=".$givenAmount." THEN 'Confirmed' ELSE 'Pending' END")
                                    ]
                                );

                        $walletParam = array(
                            'currency_id' => $currencyPair->to_asset,
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "ADD",
                            'amount' => $total,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        $remark1  = 'Charge sell order no :'.$order->order_no;
                        $walletParam = array(
                            'currency_id' => $currencyPair->to_asset,
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "SUB",
                            'amount' => $chargeAmount,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        $output .= 'Your Order(' .$order->order_no .') is confirmed for '.$givenAmount.' '.$fromCurSym.' of '.$price1.' '.$toCurSym .' .<br />';

                        $chargeAmount = $givenAmount * $charge / 100;

                        $order = new Order;
                        $order->order_no = $this->getOrderNo();
                        $order->user_id = $toUserId;
                        $order->currency_pair_id = $sellerCurrencyPair->id;
                        $order->amount = $givenAmount;
                        $order->price = $price1;
                        $order->side = ($request->side == "BUY") ? "SELL" : "BUY";
                        $order->order_type = $request->order_type;
                        $order->order_status = "Confirmed";
                        $order->fee = $chargeAmount;
                        $order->fee_remark = "Charge:($charge)% $fromCurSym";
                        $order->save();

                        $remark1 ='Trade buy confirmed order no :'.$order->order_no;    
                        $walletParam = array(
                            'currency_id' => $currencyPair->from_asset,
                            'user_id' => $toUserId,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "ADD",
                            'amount' => $givenAmount,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);

                        $remark1  = 'Charge buy order no :'.$order->order_no;
                        $walletParam = array(
                            'currency_id' => $currencyPair->from_asset,
                            'user_id' => $toUserId,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "SUB",
                            'amount' => $chargeAmount,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);
                    }
                }else{
                    
                    $order = new Order;
                    $order->order_no = $this->getOrderNo();
                    $order->user_id = \Auth::user()->id;
                    $order->currency_pair_id = $currencyPair->id;
                    $order->amount = $Remaining;
                    $order->price = $request->price;
                    $order->side = $request->side;
                    $order->order_type = $request->order_type;
                    $order->order_status = "Pending";
                    $order->save();
                    
                    if($request->side == "BUY"){
                        $total = $Remaining * $request->price;

                        $remark1 = ' Trade buy confirmed order no :'.$order->order_no;
                        $walletParam = array(
                            'currency_id' => $currencyPair->from_asset,
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "SUB",
                            'amount' => $total,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);
                    }else{
                        $remark1 = ' Trade sell confirmed order no :'. $order->order_no;
                        $walletParam = array(
                            'currency_id' => $currencyPair->from_asset,
                            'user_id' => \Auth::user()->id,
                            'context_id' => $order->id,
                            'source' => "Order",
                            'transaction_type' => "SUB",
                            'amount' => $Remaining,
                            'remark' => $remark1
                        );
                        $this->manageWallet($walletParam);
                    }

                    $toOrderId = 0;
                    $Remaining = 0;
                    $output .= 'Your Order(' .$order->order_no .') is pending.';    
                }
            }
            
            DB::table('orders')->where('amount', '<=',0 )->delete();
        DB::commit();
        return response()->json(['output' => $output], 201);
    }

    public function manageWallet($walletParam)
    {
        if($walletParam['user_id'] > 0 && $walletParam['transaction_type'] == "ADD"){
            // Lock Row by PostgreSql when Updating Wallet Balance
            DB::table('wallets')
                ->where('user_id',$walletParam['user_id'])
                ->where('currency_id',$walletParam['currency_id'])
                ->update(['balance' => DB::raw('balance + '.$walletParam['amount'])]);

            // Track Wallet Transaction
            DB::insert('INSERT INTO wallet_histories(user_id,source,context_id,transaction_type,amount,remark) VALUES(?, ?, ?, ?, ?, ?)', [$walletParam['user_id'],$walletParam['source'], $walletParam['context_id'], $walletParam['transaction_type'], $walletParam['amount'], $walletParam['remark']]);

        }else if($walletParam['user_id'] > 0 && $walletParam['transaction_type'] == "SUB"){

            // Lock Row by PostgreSql when Updating Wallet Balance
            DB::table('wallets')
                ->where('user_id',$walletParam['user_id'])
                ->where('currency_id',$walletParam['currency_id'])
                ->update(['balance' => DB::raw('balance - '.$walletParam['amount'])]);
           /*  print_r(DB::getQueryLog());
            die; */
            // Track Wallet Transaction
            DB::insert('INSERT INTO wallet_histories(user_id,source,context_id,transaction_type,amount,remark) VALUES(?, ?, ?, ?, ?, ?)', [$walletParam['user_id'],$walletParam['source'], $walletParam['context_id'], $walletParam['transaction_type'], $walletParam['amount'], $walletParam['remark']]);
        }
    }

    public function getOrderNo($table = "orders",$prefix="T")
    {
        $prefix =  "T";
        $datePart = date('Ym');
        $order = DB::table($table)->orderBy('id','DESC')->limit(1)->get()->first();
        if($order){
            $incrementPart =  str_pad(substr($order->order_no,7)+1, 8, "0", STR_PAD_LEFT);                
        }else{
            $incrementPart =  str_pad(1, 8, "0", STR_PAD_LEFT);
        }
        $orderNo = $prefix.$datePart.$incrementPart;
        return $orderNo;
    }

    public function CreateOrderStopLimit(Request $request)
    {
        $total = 0.00000000;
        $remark = "";

        // Get Currency Pair For Buyer
        $currencyPair = Currency_pair::find($request->currency_pair_id);

        // Get Currency Pair For Seller
        $sellerCurrencyPair = Currency_pair::where('from_asset',$currencyPair->to_asset)->where('to_asset',$currencyPair->from_asset)->get()->first();

        // Get Currency Symbol For Insert Note into Remark 
        $fromCurSym = $currencyPair->fromAsset->asset; 
        $toCurSym = $currencyPair->toAsset->asset;

        if($request->stop < 0 || $request->limit < 0 || $request->amount < 0){
            $output = 'Please enter valid amount.';
            return response()->json(['output' => $output], 200);
        }

        if($request->side == "BUY"){
            $orderStopLimit = new Order_stop_limit;
            $orderStopLimit->user_id = \Auth::user()->id;
            $orderStopLimit->order_no = $this->getOrderNo("order_stop_limits","SL");
            $orderStopLimit->currency_pair_id = $request->currency_pair_id;
            $orderStopLimit->stop = $request->stop;
            $orderStopLimit->limit = $request->limit;
            $orderStopLimit->amount = $request->amount;
            $orderStopLimit->side = $request->side;
            $orderStopLimit->order_status = "Pending";
            $orderStopLimit->save();

            $remark = "Stop/Limit buy order no:".$orderStopLimit->order_no;
            $walletParam = array(
                'currency_id' => $currencyPair->from_asset,
                'user_id' => \Auth::user()->id,
                'context_id' => $orderStopLimit->id,
                'source' => "STOP-LIMIT",
                'transaction_type' => "SUB",
                'amount' => $total,
                'remark' => $remark
            );
            $this->manageWallet($walletParam);
        }else{
            $orderStopLimit = new Order_stop_limit;
            $orderStopLimit->user_id = \Auth::user()->id;
            $orderStopLimit->order_no = $this->getOrderNo("order_stop_limits","SL");
            $orderStopLimit->currency_pair_id = $sellerCurrencyPair->id;
            $orderStopLimit->stop = $request->stop;
            $orderStopLimit->limit = $request->limit;
            $orderStopLimit->amount = $request->amount;
            $orderStopLimit->side = $request->side;
            $orderStopLimit->order_status = "Pending";
            $orderStopLimit->save();

            $remark = "Stop/Limit sell order no:".$orderStopLimit->order_no;
            $walletParam = array(
                'currency_id' => $currencyPair->to_asset,
                'user_id' => \Auth::user()->id,
                'context_id' => $orderStopLimit->id,
                'source' => "STOP-LIMIT",
                'transaction_type' => "SUB",
                'amount' => $total,
                'remark' => $remark
            );
            $this->manageWallet($walletParam);
        }
        $output = $remark;
    }

    public function CreateOrderStopLimitConvert(Request $request)
    {
        $orderStopLimits = Order_stop_limit::where('order_status','Pending')->get();
        foreach ($orderStopLimits as $orderStopLimit) {
            while($fetchStatus = 0){
                $order = Order::where('side',$orderStopLimit->side)
                    ->where('order_status',"Confirmed")
                    ->where('currency_pair_id',$request->currency_pair_id)
                    ->orderBy('id','DESC')
                    ->limit(1)
                    ->get()->first();
                $lastPrice = $order->price;

                if($lastPrice > 0){
                    
                }
            }
        }

    }

    public function getChart()
    {
        $currencyPairId = 1;
        $internval = 1440;
    }
}
