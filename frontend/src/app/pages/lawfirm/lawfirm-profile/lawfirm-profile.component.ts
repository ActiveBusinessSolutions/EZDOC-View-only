import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Lawfirm} from "../../../models/lawfirm";
import {LawfirmService} from 'app/services/lawfirm.service';
import {ProfileService} from 'app/services/profile.service';
import {FormValidation} from "app/common_modules/form_validation";
import {Notification} from "../../../common_modules/notification";
import {Common} from "../../../common";
import { StaticData } from 'app/static-data';

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
  private lawfirm: Lawfirm = new Lawfirm();

  constructor(private _lawfirmService: LawfirmService) {
  }

  ngOnInit() {
    this.getLawfirm();
  }

  ngAfterViewInit() {
    let self = this;
    FormValidation.validate('lawfirm_profile', function () {
      self.updateLawfirm();
    });

    $(document).ready(function () {
      $('#countrySelector').jqxComboBox({
        theme: 'metro',
        source: StaticData.countries,
        width: '100%',
        height: 35
      });

      $('#stateSelector').jqxComboBox({
        theme: 'metro',
        source: StaticData.states,
        width: '100%',
        height: 35
      });
    });
  }

  onAptTypeChanged(event, type) {
    event.preventDefault();

    this.lawfirm.apartment = false;
    this.lawfirm.suite = false;
    this.lawfirm.floor = false;

    if (type == "apartment") {
      this.lawfirm.apartment = true;
    } else if (type == "suite") {
      this.lawfirm.suite = true;
    } else {
      this.lawfirm.floor = true;
    }
  }

  onSubmit() {
  }

  getLawfirm() {
    $('.loading').show();

    this._lawfirmService.getMyLawfirm()
      .subscribe(data => {
        $('.loading').fadeOut();

        console.log(data);
        this.lawfirm = data.lawfirm;
        $('#stateSelector').val(this.lawfirm.state);
        $('#countrySelector').val(this.lawfirm.country);
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
    if (this.lawfirm.country == '') {
      Notification.notifyAny({ message: 'The country field is required.', type: 'error' });
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
