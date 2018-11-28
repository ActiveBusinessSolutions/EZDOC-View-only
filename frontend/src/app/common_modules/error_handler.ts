import {Response} from '@angular/http';
import {Notification} from "app/common_modules/notification";
import {isNullOrUndefined} from "util";
import {Common} from '../common'

export class ErrorHandler {

  static extractData(success: Response) {
    let body = success.json() || '';

    if (body.code == '201' || body.code == '200') {
      Notification.notifySuccess(success);
    }
    else if (isNullOrUndefined(body.code)) {
      Notification.notifyNormals(success);
    }
    else {
      Notification.notifyInfo(success);
    }

    return body;
  }

  static handleError(errors: Response | any) {
    let body = errors.json() || '';
    console.error(body);

    if (isNullOrUndefined(body.code)) {
      Notification.notifyNormals(errors);
    }
    else {
      if (/*body.code === 400 || */body.code === 401) {
        Common.logout();
        window.location.href = 'account/login';
      } else {
        Notification.notifyErrors(errors);
      }
    }

    let errMsg: string;
    if (errors instanceof Response) {
      const body = errors.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${errors.status} - ${errors.statusText || ''} ${err}`;
    } else {
      errMsg = errors.message ? errors.message : errors.toString();
    }
    return Promise.reject(errMsg);
  }
}
