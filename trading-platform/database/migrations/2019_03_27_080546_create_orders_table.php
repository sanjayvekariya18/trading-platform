<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('order_no', 10)->unique();
            $table->integer('user_id')->references('id')->on('users');
            $table->integer('currency_pair_id')->references('id')->on('currency_pairs');
            $table->decimal('amount', 15, 8);
            $table->decimal('price', 15, 8);
            $table->string('order_type', 15);
            $table->string('side', 4);
            $table->string('remark', 100)->nullable()->default(NULL);
            $table->string('order_status',10)->default(NULL);
            $table->float('fee', 8, 2);
            $table->string('fee_remark', 100)->nullable()->default(NULL);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
