import {Component} from '@angular/core';
import { Lawfirm } from '../../../models/lawfirm';
import { LawfirmService } from '../../../services/lawfirm.service';
import { FormValidation } from '../../../common_modules/form_validation';
import { Common } from '../../../common';
import { Notification } from '../../../common_modules/notification';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';

declare let $;
declare let App;
declare let bootbox;

@Component({
  selector: 'app-lawfirm-signup',
  templateUrl: './lawfirm-signup.component.html',
  styleUrls: [
    './lawfirm-signup.component.css',
  ],
  providers: [LawfirmService, ProfileService],
})

export class LawfirmSignupComponent {
  static instance: LawfirmSignupComponent;
  lawfirm: Lawfirm = new Lawfirm();

  constructor(private _lawfirmService: LawfirmService,
    private _router: Router) {
    LawfirmSignupComponent.instance = this;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    FormValidation.validate('lawfirm_create', function () {
      LawfirmSignupComponent.instance.createLawfirm();
    });

    $(document).ready(function () {
      $('#stateSelector').jqxComboBox({
        theme: 'metro',
        source: Common.states,
        width: '100%',
        height: 35
      });
    });
  }

  onSubmit() {
  }

  createLawfirm() {
    if (!this.lawfirm) {
      return;
    }
    this.lawfirm.state = $('#stateSelector').val();
    if (this.lawfirm.state == '') {
      Notification.notifyAny({ message: 'The state field is required.', type: 'error' });
      return;
    }

    $('.loading').show();

    this._lawfirmService.createLawfirm(this.lawfirm)
      .subscribe(data => {
        $('.loading').fadeOut();

        let message = data.success.message;
        let self = this;
        bootbox.dialog({
          message: message,
          buttons: {
            ok: {
              label: "OK",
              className: 'btn-primary',
              callback: function () {
                self._router.navigate(['/']);
              }
            }
          }
        });
      }, error2 => {
        $('.loading').fadeOut();
      });
  }

  back() {
    window.history.back();
  }
}

