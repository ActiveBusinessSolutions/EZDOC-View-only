<?php

namespace App\Transformers;

use App\Models\Profile;
use Appkr\Api\TransformerAbstract;
use League\Fractal\ParamBag;

class ProfileTransformer extends TransformerAbstract
{
  /**
   * List of resources possible to include using url query string.
   * e.g. collection case -> ?include=comments:limit(5|1):order(created_at|desc)
   *      item case       -> ?include=author
   *
   * @var  array
   */
  protected $availableIncludes = ['user', 'lawfirm'];

  /**
   * List of resources to be included always.
   *
   * @var  array
   */
  // protected $defaultIncludes = ['user', 'lawfirm'];
  /**
   * Transform single resource.
   *
   * @param  \App\Models\Profile $profile
   * @return  array
   */
  public function transform(Profile $profile)
  {
    $payload = [
      'id' => (int)$profile->id,
      'first_name' => $profile->first_name,
      'last_name' => $profile->last_name,
      'phone' => $profile->phone,
      'birthday' => $profile->birthday,
      'gender' => $profile->gender,
      'EOIR' => $profile->EOIR,
      'avatar' => $profile->avatar,
      'user_id' => $profile->user_id,
      'lawfirm_id' => $profile->lawfirm_id,
      'status' => $profile->status,
      'state_bar_number' => $profile->state_bar_number,
      'created' => $profile->created_at->toIso8601String(),
      'link' => [
        'rel' => 'self',
        'href' => route('api.v1.profiles.show', $profile->id),
      ],
    ];

    if ($fields = $this->getPartialFields()) {
      $payload = array_only($payload, $fields);
    }

    return $payload;
  }

  /**
   * Include user.
   *
   * @param  \App\Models\Profile $profile
   * @param  \League\Fractal\ParamBag|null $params
   * @return  \League\Fractal\Resource\Item
   */
  public function includeUser(Profile $profile, ParamBag $params = null)
  {
    return $this->item($profile->user, new \App\Transformers\UserTransformer($params));
  }

  /**
   * Include lawfirm.
   *
   * @param  \App\Models\Profile $profile
   * @param  \League\Fractal\ParamBag|null $params
   * @return  \League\Fractal\Resource\Item
   */
  public function includeLawfirm(Profile $profile, ParamBag $params = null)
  {
    return $this->item($profile->lawfirm, new \App\Transformers\LawfirmTransformer($params));
  }
}
