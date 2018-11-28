import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Router} from "@angular/router";
import {Common} from "../../../common";
import {UserService} from "../../../services/user.service";
import {FormValidation} from "app/common_modules/form_validation";
import {Notification} from '../../../common_modules/notification';

declare let $;
declare let App;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.css',
  ],
  providers: [UserService],
})

export class LoginComponent implements OnInit {

  private email;
  private password;

  constructor(private router: Router, private _userService: UserService, private http: Http) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let self = this;

    FormValidation.loginValidate(function () {
      self.login();
    });

    $(document).ready(function () {
      $('#emailInput').keyup(function (event) {
        if (event.keyCode == 13) {
          if($('#passwordInput').val() == '') {
            $('#passwordInput').focus();
          } else {
            self.login();
          }
        }
      });

      $('#passwordInput').keyup(function (event) {
        if (event.keyCode == 13) {
          self.login();
        }
      });
    });
  }

  onSubmit() {

  }

  login() {
    $('.loading').show();

    this._userService.login(this.email, this.password)
      .subscribe(
        (success: any) => {
          if (success.code == '201') {
            Common.SetUser(success);
            Common.login();
            window.history.back();
          }
          else {
            this.router.navigate(['/account/login']);
          }

          $('.loading').fadeOut();
        },
        (error: any) => {
          Notification.notifyErrors(error);

          $('.loading').fadeOut();
        }
      );
  }
}

