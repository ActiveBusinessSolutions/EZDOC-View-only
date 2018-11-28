import {Component, OnInit, AfterViewInit} from '@angular/core';
import {User} from "../../../models/user";
import {Profile} from "../../../models/profile";
import {Common} from "../../../common";
import {UserService} from "../../../services/user.service";
import {Router} from "@angular/router";
import {ProfileService} from "../../../services/profile.service";
import {LawfirmService} from "../../../services/lawfirm.service";
import {Notification} from "../../../common_modules/notification";
import {InviteService} from "../../../services/invite.service";

import "../../../../assets/plugins/jqwidgets/jqxdata.js"
import "../../../../assets/plugins/jqwidgets/jqxbuttons.js"
import "../../../../assets/plugins/jqwidgets/jqxscrollbar.js"
import "../../../../assets/plugins/jqwidgets/jqxlistbox.js"
import "../../../../assets/plugins/jqwidgets/jqxcombobox.js"

declare let $;
declare let bootbox;
declare let App;
declare let faker;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: [
    './signup.component.css',
  ],
  providers: [
    UserService,
    ProfileService,
    LawfirmService,
    InviteService
  ],
})
export class SignupComponent implements OnInit {
  static instance: SignupComponent;
  private role;

  private captcha_image;
  private captcha_key;
  private captcha_value;

  private retype_password;
  private user: User;
  private profile: Profile;
  private lawfirm_password;

  constructor(private _userService: UserService,
              private _router: Router,
              private _profileService: ProfileService,
              private _lawfirmService: LawfirmService,
              private _inviteService: InviteService) {
    SignupComponent.instance = this;
  }

  ngOnInit() {
    this.captcha_image = "";
    this.captcha_key = "";
    this.captcha_value = "";

    this.role = "attorney";
    this.user = new User();
    this.profile = new Profile();
    this.profile.gender = "male";
    this.profile.birthday = Common.getPhpDate(new Date());

    // DEBUG: Test code here
    this.profile.first_name = faker.name.findName().split(" ")[0];
    this.profile.last_name = faker.name.findName().split(" ")[1];
    this.profile.phone = faker.phone.phoneNumber();
    this.user.password = '123456';
    this.retype_password = '123456';
    this.profile.EOIR = 'abc123456';
    this.profile.state_bar_number = 'abc123456';
    this.lawfirm_password = '123456';

    this.getLawfirms();
    this.getCaptcha();
    this.getAllInvites();
  }

  ngAfterViewInit() {
    this.profile.lawfirm_id = 1;

    InitWidgets();
    InitEvents();

    function InitWidgets() {
      $('#lawfirmSelector').jqxDropDownList({
        theme: 'metro',
        width: '100%',
        height: 33,
        itemHeight: 30,
      });

      $('#emailSelector').jqxComboBox({
        theme: 'metro',
        displayMember: "email",
        valueMember: "email",
        width: '100%',
        height: 33
      });
    }

    function InitEvents() {
      $('#emailSelector').on('select', function (event) {
        SignupComponent.instance.emailChanged();
      });
    }
  }

  SelectRole(role) {
    this.role = role;
  }

  getLawfirms() {
    this._lawfirmService.getLawfirms()
      .subscribe(data => {
        let source =
          {
            datatype: "json",
            datafields: [
              {name: 'id'},
              {name: 'name'}
            ],
            localData: data.data,
          };
        let dataAdapter = new $.jqx.dataAdapter(source);

        $('#lawfirmSelector').jqxDropDownList({
          source: dataAdapter,
          displayMember: "name",
          valueMember: "id"
        });
        $('#lawfirmSelector').jqxDropDownList('selectIndex', 0);
      });
  }

  onSubmit(form) {
    this._userService.checkCaptcha(this.captcha_value, this.captcha_key)
      .subscribe(data => {
        if (data.json().success) {
          let lawfirm = {
            id: $('#lawfirmSelector').val(),
            password: this.lawfirm_password
          };
          this.profile.lawfirm_id = lawfirm.id;
          if (this.user.password != this.retype_password) {
            Notification.notifyAny({message: "Retype password exactly."});
            return;
          }

          this._lawfirmService.confirmLawfirm(lawfirm)
            .subscribe(success => {
              this.user.email = $('#emailSelector').val();
              console.log(this.user.email);
              $('.loading').show();

              this._userService.signup(this.user.email, this.user.password, this.role, this.profile)
                .subscribe(success => {
                  $('.loading').fadeOut();

                  let html =
                    '<div class="center">\n' +
                    '  <b>Account registration processed.</b><br>\n' +
                    '  [' + this.profile.last_name + ', ' + this.profile.first_name + ' - ' + this.user.email + ']\n' +
                    '</div><br>\n' +
                    '<p>\n' +
                    '  Congratulations, you have registered successfully!\n' +
                    '</p>\n' +
                    '<p>\n' +
                    '  You are now not available to login.\n' +
                    '</p>\n' +
                    '<p>\n' +
                    '  Please check your email inbox now for verification.\n' +
                    '</p>';
                  bootbox.alert(html, function () {
                    SignupComponent.instance._router.navigate(['/']);
                  });
                }, error => {
                  $('.loading').fadeOut();
                });
            });
        }
        else {
          this.captcha_image = data.json().img;
          this.captcha_key = data.json().key;
          Notification.notifyAny({message: 'Type the correct captcha.'});
          $('#captcha').val('');
        }
      });
  }

  back() {
    window.history.back();
  }

  getCaptcha() {
    this._userService.getCaptcha()
      .subscribe(data => {
        this.captcha_image = data.json().img;
        this.captcha_key = data.json().key;
      });
  }

  emailChanged() {
    let email = $('#emailSelector').val();
    this.user.email = email;

    this._inviteService.getInvitesByEmail(email)
      .subscribe(data => {
        if (data.length > 0) {
          let lawfirm_id = data[0].lawfirm_id;
          $('#lawfirmSelector').val(lawfirm_id);
        }
      });
  }

  getAllInvites() {
    this._inviteService.getAllInvites()
      .subscribe(data => {
        let source =
          {
            datatype: "json",
            datafields: [
              {name: 'email'},
            ],
            localdata: data,
          };
        let dataAdapter = new $.jqx.dataAdapter(source);

        $('#emailSelector').jqxComboBox({source: dataAdapter});
      });
  }
}
