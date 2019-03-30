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


Route::get('all_orders','ExchangeController@getAllOrders');
Route::get('active_order','ExchangeController@getActiveOrders');
Route::get('close_order','ExchangeController@getCloseOrders');
Route::get('currencies','ExchangeController@getCurrencies');
Route::get('currency_pairs','ExchangeController@getCurrencyPairs');
Route::post('logout','Auth\LoginController@userLogout');  

Route::middleware('auth:api')->prefix('private')->group(function() {
    Route::get('orders','OrderController@index');
    Route::get('orders/{id}','OrderController@show');
    Route::post('orders','OrderController@store');
    Route::put('orders/{id}','OrderController@update');
    Route::delete('orders/{id}','OrderController@destroy');
    Route::get('wallets','WalletController@getWallets');    
    Route::get('wallet/{wallet_id}/{currency_id}','WalletController@getWallet');  
    
});