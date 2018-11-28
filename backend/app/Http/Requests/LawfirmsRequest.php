<?php

namespace App\Http\Requests;

use App\Http\Requests\Request;

class LawfirmsRequest extends Request
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */

    public function authorize()
    {
        // since we're handling user authentication via middleware, we can simply switch this to return trueinstead
		    return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */

    public function rules()
    {
      return [
        'name' => 'required|min:2',
        'address' => 'required|min:2',
        'city' => 'required|min:2',
        'state' => 'required|min:2',
        'zip' => 'required|min:2',
        'phone_number' => 'required|min:2',
        'fax_number' => 'required|min:2',
      ];
    }
}
