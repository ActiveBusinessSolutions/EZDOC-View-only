import {Lawfirm} from "./lawfirm";

export class Profile {
  constructor() {
  }
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  birthday: string;
  gender: string;
  EOIR: string;
  state_bar_number: string;
  avatar: string;
  //status: string;
  user_id: number;
  lawfirm_id: number;
  email: string;
  lawfirm: Lawfirm;
  user: Object;
}
