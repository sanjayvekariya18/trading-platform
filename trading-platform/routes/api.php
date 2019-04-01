<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/



Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('register','Auth\RegisterController@register');
Route::post('login','Auth\LoginController@login');


// Get Currency Paair List With Change
Route::get('currency_pairs','ExchangeController@getCurrencyPairs');

// Get Trade History For Selected Pair
Route::get('trade_history/{pairId}','ExchangeController@getTradeHistory');

// Get All Sell Order in Descending Order
Route::get('sell_orders/{pairId}','ExchangeController@getSellOrders');
Route::get('buy_orders/{pairId}','ExchangeController@getBuyOrders');

Route::get('all_orders','ExchangeController@getAllOrders');
Route::get('active_order','ExchangeController@getActiveOrders');
Route::get('close_order','ExchangeController@getCloseOrders');
Route::get('currencies','ExchangeController@getCurrencies');
Route::post('logout','Auth\LoginController@userLogout');  

Route::middleware('auth:api')->prefix('private')->group(function() {
    Route::post('orders','OrderController@tradeOrders');
    Route::post('orders/create','OrderController@store');
    Route::get('wallets','WalletController@getWallets');    
    Route::get('wallet/{wallet_id}/{currency_id}','WalletController@getWallet');  
});