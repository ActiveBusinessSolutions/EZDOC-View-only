import {Component, OnInit} from '@angular/core';
import {Lawfirm} from "../../../models/lawfirm";
import {LawfirmService} from "app/services/lawfirm.service";
import {ProfileService} from "app/services/profile.service";
import {FormValidation} from "app/common_modules/form_validation";
import {Notification} from "../../../common_modules/notification";
import {Common} from "../../../common";
import "../../../../assets/plugins/jqwidgets/jqxbuttons.js"
import "../../../../assets/plugins/jqwidgets/jqxscrollbar.js"
import "../../../../assets/plugins/jqwidgets/jqxlistbox.js"
import "../../../../assets/plugins/jqwidgets/jqxcombobox.js"
import "../../../../assets/plugins/jqwidgets/jqxpanel.js"
import "../../../../assets/plugins/jqwidgets/jqxcheckbox.js"

declare let App;
declare let $;

@Component({
  selector: 'app-lawfirm-create',
  templateUrl: './lawfirm-create.component.html',
  styleUrls: ['./lawfirm-create.component.css'],
  providers: [LawfirmService, ProfileService]
})
export class LawfirmCreateComponent implements OnInit {
  static instance: LawfirmCreateComponent;
  lawfirm: Lawfirm = new Lawfirm();

  constructor(private _lawfirmService: LawfirmService) {
    LawfirmCreateComponent.instance = this;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    FormValidation.validate('lawfirm_create', function () {
      LawfirmCreateComponent.instance.createLawfirm();
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
      Notification.notifyAny({message: 'The state field is required.', type: 'error'});
      return;
    }

    $('.loading').show();

    this._lawfirmService.createLawfirm(this.lawfirm)
      .subscribe(data => {
        $('.loading').fadeOut();

        let message = data.success.message;
        Notification.notifyAny({message: message});
      }, error2 => {
        $('.loading').fadeOut();
      });
  }
}
