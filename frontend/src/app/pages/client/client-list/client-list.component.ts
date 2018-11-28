import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {Client} from "../../../models/client";
import {ClientService} from "../../../services/client.service";
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import {Router} from "@angular/router";
import {Notification} from "../../../common_modules/notification";
import {Common} from "../../../common";

declare let $: any;
declare let App: any;

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: [
    './client-list.component.css',
  ],
  providers: [ClientService]
})

export class ClientListComponent implements OnInit {
  private clients: Client[];
  private selected_ids = [];
  private clientsTable;

  constructor(private _clientService: ClientService, private _router: Router, private _cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getClients();
  }

  ngAfterViewInit() {
    let self = this;

    $(document).ready(function () {
      InitWidgets();
      InitEvents();

      function InitWidgets() {
        self.clientsTable = $("#clientsTable").DataTable({
          'paging': true,
          'data': [],
          'bLengthChange': false,
          'columns': [
            {
              'title': 'Name',
              'data': 'name'
            }, {
              'title': 'Phone Number',
              'data': 'residence_telephone_num'
            }, {
              'title': 'Gender',
              'data': 'gender'
            }, {
              'title': 'Date of Birth',
              'data': 'american_birth_date',
            }, {
              'title': 'Date of Birth',
              'data': 'american_dash_birth_date',
            }
          ], "columnDefs": [
            {
              "targets": [4],
              "visible": false
            }
          ]
        });

        $('.dataTables_filter').hide();
      }

      function InitEvents() {
        self.clientsTable.on('draw', function () {
          $('#clientsTable tbody tr').unbind('click');
          $('#clientsTable tbody tr').click(function () {
            var id = this.id;
            var index = $.inArray(id, self.selected_ids);

            if (index === -1 && id != "") {
              self.selected_ids.push(id);
            } else {
              self.selected_ids.splice(index, 1);
            }

            if(id != "") $(this).toggleClass('selected');

            // Update button enable status
            if (self.selected_ids.length == 0) {
              $('#detailButton, #formsButton, #deleteButton').addClass('disabled');
            } else if (self.selected_ids.length == 1) {
              $('#detailButton, #formsButton, #deleteButton').removeClass('disabled');
            } else {
              $('#detailButton, #formsButton').addClass('disabled');
              $('#deleteButton').removeClass('disabled');
            }
          });
        });

        $('#detailButton').click(function () {
          self._router.navigate(['/pages/client/detail/' + self.selected_ids[0] + '/1']);
        });

        $('#formsButton').click(function () {
          self._router.navigate(['/pages/client/finish/' + self.selected_ids[0]]);
        });

        $('#deleteButton').click(function (event) {
          self.deleteClients(self.selected_ids);
        });

        $('#searchInput').change('keyup', function () {
          self.clientsTable.search(this.value).draw();
        });
      }
    });
  }

  getClients() {
    $('.loading').show();
    let self = this;

    this._clientService.getLawfirmClients()
      .subscribe(data => {
        $('.loading').fadeOut();

        this.clients = data;

        for (let i in data) {
          let row = data[i];
          row.DT_RowId = row.id;
          row.name = row.first_name + ' ' + row.last_name;
          row.american_birth_date = Common.americanDate(row.birth_date);
          row.american_dash_birth_date = Common.americanDate(row.birth_date, "-");
        }
        console.log('clients', this.clients);

        let page = this.clientsTable.page();
        this.clientsTable.clear();
        $.each(this.clients, function (index, value) {
          self.clientsTable.row.add(value);
        });
        this.clientsTable.draw();
        this.clientsTable.page(page).draw('page');

        this._cd.detectChanges();

      }, error => {
        $('.loading').fadeOut();
      });
  }

  deleteClients(client_ids) {
    let self = this;

    Common.confirm("Are you sure to delete selected clients?", function () {
      $('.loading').show();

      self._clientService.deleteClients(client_ids)
        .subscribe(data => {
          $('.loading').fadeOut();

          let message = data.success.message || '';
          Notification.notifyAny({message: message, title: 'Server'});
          self.getClients();
          NavbarComponent.instance.refreshNotifications();
        }, error => {
          $('.loading').fadeOut();
        });
    });
  }
}

