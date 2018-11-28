import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Lawfirm} from "../../../models/lawfirm";
import {LawfirmService} from 'app/services/lawfirm.service';
import {ProfileService} from 'app/services/profile.service';
import {FormValidation} from "app/common_modules/form_validation";
import {Notification} from "../../../common_modules/notification";
import {Common} from "../../../common";

declare let $;
declare let App;

@Component({
  selector: 'app-lawfirm-profile',
  templateUrl: './lawfirm-profile.component.html',
  styleUrls: ['./lawfirm-profile.component.css'],
  providers: [
    LawfirmService,
    ProfileService,
  ]
})

export class LawfirmProfileComponent implements OnInit {
  static instance: LawfirmProfileComponent;
  private lawfirm: Lawfirm = new Lawfirm();

  constructor(private _lawfirmService: LawfirmService) {
    LawfirmProfileComponent.instance = this;
  }

  ngOnInit() {
    this.getLawfirm();
  }

  ngAfterViewInit() {
    FormValidation.validate('lawfirm_profile', function () {
      LawfirmProfileComponent.instance.updateLawfirm();
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

  getLawfirm() {
    $('.loading').show();

    this._lawfirmService.getMyLawfirm()
      .subscribe(data => {
        $('.loading').fadeOut();

        this.lawfirm = data.lawfirm;
        $('#stateSelector').val(this.lawfirm.state);
      });
  }

  updateLawfirm() {
    if (!this.lawfirm) {
      return;
    }
    this.lawfirm.state = $('#stateSelector').val();
    if (this.lawfirm.state == '') {
      Notification.notifyAny({message: 'The state field is required.', type: 'error'});
      return;
    }
    $('.loading').show();

    this._lawfirmService.updateLawfirm(this.lawfirm)
      .subscribe(data => {
        $('.loading').fadeOut();

        let message = data.success.message;
        Notification.notifyAny({message: message});
      }, error => {
        $('.loading').fadeOut();
      });
  }
}
