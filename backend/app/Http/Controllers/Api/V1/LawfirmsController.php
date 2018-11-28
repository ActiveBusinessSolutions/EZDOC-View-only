<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Lawfirm;
use App\Transformers\LawfirmTransformer;
use App\Http\Requests\LawfirmsRequest;
use App\Http\Controllers\Api\Helper\RespondHelper;

class LawfirmsController extends Controller
{
	public function __construct()
	{
		$this->middleware('admin', ['except' => ['index', 'show', 'store']]);
		parent::__construct();
		$this->respond_helper = new RespondHelper();
	}

	public function index()
	{
		$data = Lawfirm::all();
		
		return json()->withCollection(
			$data,
			new LawfirmTransformer()
		);
	}

	public function store(LawfirmsRequest $request)
	{
		$lawfirm = new Lawfirm();
		$lawfirm->name = $request->name;
		$lawfirm->address = $request->address;
		$lawfirm->city = $request->city;
		$lawfirm->state = $request->state;
		$lawfirm->zip = $request->zip;
		$lawfirm->phone_number = $request->phone_number;
		$lawfirm->fax_number = $request->fax_number;

		if (isset($request->password)) {
			$lawfirm->password = base64_encode($request->password);
		}

		return ($lawfirm->save())
			? json()->success('A new lawfirm has been created.')
			: json()->badRequestError('Failed to create a lawfirm.');
	}

	public function show($id)
	{
		return json()->withItem(
			Lawfirm::findOrFail($id),
			new LawfirmTransformer()
		);
	}

	public function update(LawfirmsRequest $request, $id)
	{
		$lawfirm = Lawfirm::findOrFail($id);
		$lawfirm->name = $request->name;
		$lawfirm->address = $request->address;
		$lawfirm->city = $request->city;
		$lawfirm->state = $request->state;
		$lawfirm->zip = $request->zip;
		$lawfirm->phone_number = $request->phone_number;
		$lawfirm->fax_number = $request->fax_number;

		if (isset($request->password)) {
			$lawfirm->password = base64_encode($request->password);
		}

		return ($lawfirm->save())
			? json()->success('The lawfirm has been updated.')
			: json()->badRequestError('Failed to update the lawfirm.');
	}

	public function destroy($id)
	{
		$lawfirm = Lawfirm::findOrFail($id);

		return ($lawfirm->delete())
			? json()->success('The lawfirm has been deleted.')
			: json()->badRequestError('Failed to delete the lawfirm.');
	}

	public static function getAdmins($lawfirm)
	{
		$profiles = $lawfirm->profiles;
		$admins = [];
		foreach ($profiles as $profile) {
			$user = $profile->user;
			if ($user->is('admin') || $user->is('superadmin')) {
				array_push($admins, $user);
			}
		}

		return $admins;
	}
}
