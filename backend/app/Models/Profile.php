<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Lawfirm;
use App\User;

class Profile extends Model
{
    use SoftDeletes;
    protected $dates = ['deleted_at'];
    protected $table = 'profiles';

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'birthday',
        'gender',
        'EOIR',
        'state_bar_number',
        'user_id',
        'lawfirm_id',
        'avatar',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lawfirm()
    {
        return $this->belongsTo(Lawfirm::class);
    }
}
