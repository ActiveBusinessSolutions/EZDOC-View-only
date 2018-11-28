import {Component, OnInit} from '@angular/core';
import {LawfirmService} from "../../../services/lawfirm.service";
import {ProfileService} from "../../../services/profile.service";
import {Notification} from "../../../common_modules/notification";
import {Lawfirm} from "../../../models/lawfirm";
import {Common} from "../../../common";
import "../../../../assets/plugins/jqwidgets/jqxdata.js"
import "../../../../assets/plugins/jqwidgets/jqxbuttons.js"
import "../../../../assets/plugins/jqwidgets/jqxscrollbar.js"
import "../../../../assets/plugins/jqwidgets/jqxlistbox.js"

declare let $;
declare let App;

@Component({
  selector: 'app-admin-lawfirm',
  templateUrl: './admin-lawfirm.component.html',
  styleUrls: [
    './admin-lawfirm.component.css',
    '../../../../assets/common/css/admin.css',
  ],
  providers: [
    LawfirmService,
    ProfileService,
  ]
})
export class AdminLawfirmComponent implements OnInit {
  static instance: AdminLawfirmComponent;
  private lawfirms;
  private count;

  constructor(private _lawfirmService: LawfirmService) {
    AdminLawfirmComponent.instance = this;
  }

  ngOnInit() {
    this.getLawfirms();
  }

  ngAfterViewInit() {
    $(document).ready(function () {
      InitWidgets();
      InitEvents();

      function InitWidgets() {
        $('#lawfirmList').jqxListBox({
          theme: 'metro',
          displayMember: "name",
          valueMember: "id",
          width: '100%',
          height: 400
        });
      }

      function InitEvents() {
        $('#lawfirmList').on('select', function () {
          AdminLawfirmComponent.instance.refreshForm();
        });
      }
    });
  }

  getLawfirms() {
    $('.loading').show();

    this._lawfirmService.getLawfirms()
      .subscribe(data => {
        this.lawfirms = data.data;
        this.count = this.lawfirms.length;

        let source =
          {
            datatype: "json",
            datafields: [
              {name: 'id'},
              {name: 'name'}
            ],
            id: 'id',
            localdata: data
          };
        let dataAdapter = new $.jqx.dataAdapter(source);

        $("#lawfirmList").jqxListBox({
          source: dataAdapter,
          selectedIndex: 0,
        });

        $('.loading').fadeOut();
      });
  }

  getLawfirmById(id) {
    for (let i in this.lawfirms) {
      let lawfirm = this.lawfirms[i];
      if (lawfirm.id == id) {
        return lawfirm;
      }
    }

    return null;
  }

  refreshForm() {
    let id = $('#lawfirmList').val();
    let lawfirm = this.getLawfirmById(id);

    $('#lawfirmNameInput').val(lawfirm.name);
    $('#lawfirmPasswordInput').val('');
    $('#lawfirmAddressInput').val(lawfirm.address);
    $('#lawfirmCityInput').val(lawfirm.city);
    $('#lawfirmStateInput').val(lawfirm.state);
    $('#lawfirmZipInput').val(lawfirm.zip);
    $('#lawfirmPhoneNumberInput').val(lawfirm.phone_number);
    $('#lawfirmFaxNumberInput').val(lawfirm.fax_number);
  }

  resetForm() {
    $('#lawfirmNameInput').val('');
    $('#lawfirmPasswordInput').val('');
    $('#lawfirmAddressInput').val('');
    $('#lawfirmCityInput').val('');
    $('#lawfirmStateInput').val('');
    $('#lawfirmZipInput').val('');
    $('#lawfirmPhoneNumberInput').val('');
    $('#lawfirmFaxNumberInput').val('');
  }

  createLawfirm() {
    let lawfirm = this.getLawfirm();

    this._lawfirmService.createLawfirm(lawfirm)
      .subscribe(data => {
        let message = data.success.message;
        Notification.notifyAny({message: message});
        this.getLawfirms();
      });
  }

  updateLawfirm() {
    let lawfirm = this.getLawfirm();
    lawfirm['id'] = $('#lawfirmList').val();

    this._lawfirmService.updateLawfirm(lawfirm)
      .subscribe(data => {
        let message = data.success.message;
        Notification.notifyAny({message: message});
        this.getLawfirms();
      });
  }

  deleteLawfirm() {
    let id = $('#lawfirmList').val();

    Common.confirm('Do you want to delete the lawfirm?', function () {
      AdminLawfirmComponent.instance._lawfirmService.deleteLawfirm(id)
        .subscribe(data => {
          let message = data.success.message;
          Notification.notifyAny({message: message});
          AdminLawfirmComponent.instance.getLawfirms();
        });
    });
  }

  getLawfirm() {
    let lawfirm = new Lawfirm();
    lawfirm.name = $('#lawfirmNameInput').val();
    lawfirm.password = $('#lawfirmPasswordInput').val();
    lawfirm.address = $('#lawfirmAddressInput').val();
    lawfirm.city = $('#lawfirmCityInput').val();
    lawfirm.state = $('#lawfirmStateInput').val();
    lawfirm.zip = $('#lawfirmZipInput').val();
    lawfirm.phone_number = $('#lawfirmPhoneNumberInput').val();
    lawfirm.fax_number = $('#lawfirmFaxNumberInput').val();

    return lawfirm;
  }
}
