<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCurrencyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('currency', function (Blueprint $table) {
            $table->increments('id');
            $table->string('type',25);
            $table->string('name', 25);
            $table->string('name2', 25);
            $table->string('asset', 10);
            $table->boolean('active');
            $table->string('icon_link', 255)->nullable();
            $table->string('symbol', 255)->nullable();
            $table->integer('decimal_after');
            $table->integer('order');
            $table->boolean('has_wallet');
            $table->timestamps();
        });

        DB::table('currency')->insert([
          array(
            'type' => 'bitcoin',
            'name' => 'Bitcoin',
            'name2' => 'Bitcoins',
            'asset' => 'BTC',
            'active' => true,
            'decimal_after' => 8,
            'order' => 1,
            'has_wallet' => true
          ),
          array(
            'type' => 'ethereum',
            'name' => 'Ethereum',
            'name2' => 'Ethereums',
            'asset' => 'ETH',
            'active' => true,
            'decimal_after' => 8,
            'order' => 2,
            'has_wallet' => true
          ),
          array(
            'type' => 'usdt',
            'name' => 'Tether USD',
            'name2' => 'Tether USD',
            'asset' => 'USDT',
            'active' => true,
            'decimal_after' => 2,
            'order' => 3,
            'has_wallet' => true
          )

        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('currency');
    }
}
