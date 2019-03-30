<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded=[];
    
    public function orders(){
      return $this->belongsTo('\App\User');
    }
}
