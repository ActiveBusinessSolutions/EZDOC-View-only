import {Component, OnInit, Input} from '@angular/core';
import {FormService} from "../../../services/form.service";
import {isNullOrUndefined} from "util";
import {Template} from "../../../models/template";
import {FormHelper} from "../form-helper";
import {ClientService} from "../../../services/client.service";
import {ErrorHandler} from "../../../common_modules/error_handler";
import {Router} from "@angular/router";
import {DocService} from "../../../services/doc.service";
import {Notification} from "../../../common_modules/notification";
import "../../../../assets/global/plugins/bootstrap-wizard/jquery.bootstrap.wizard.min.js"
import "../../../../assets/plugins/jqwidgets/jqxnavigationbar.js"

declare let $: any;
declare let bootbox;
declare let App;
declare let jQuery;

@Component({
  selector: 'app-form-doc',
  templateUrl: './form-doc.component.html',
  styleUrls: [
    './form-doc.component.css',
    '../form.component.css',
  ],
  providers: [
    FormService,
    ClientService,
    DocService,
  ]
})
export class FormDocComponent implements OnInit {
  static instance: FormDocComponent;
  static saving = false;
  @Input() form_id: number;
  @Input() client_id: number;
  @Input() page_index: number;
  @Input() form_wizard: boolean;
  public doc_id: number;
  private form;
  private template;
  private page;
  private pageCount;
  private schema;
  private wizard_inputs = [];

  constructor(private _formService: FormService,
              private _clientService: ClientService,
              private _docService: DocService,
              private _router: Router) {
    FormDocComponent.instance = this;
    this.client_id = 0; // if new client id is zero.
  }

  ngOnInit() {
    this.page_index = 1;
    this.form_wizard = localStorage.getItem('form_wizard') == "1" ? true : false;

    this.onResize();
    let self = this;
    $(document).ready(function() {
      $(window).resize(function() {
        self.onResize();
      });
    });

    if (!FormDocComponent.saving) {
      // Autosave document automatically by 1 min interval
      window.setInterval(function () {
        if (self.client_id != 0 && self._router.url.indexOf('client/detail') > -1) {
          self.submitDoc();
        }
      }, 60000);
      FormDocComponent.saving = true;
    }
  }

  onResize() {
    $('.form-container').height($(window).height() - 100);
  }

  ngOnChanges() {
    this.getForm();
  }

  getForm() {
    $('.loading').show();

    this._formService.getForm(this.form_id)
      .subscribe(data => {
        this.form = data;
        this.extractTemplate();
        if (this.client_id == 0) {
          this.resetDoc();
        }
        this.refreshDocSchema();
        this.getDoc();

        $('.loading').fadeOut();
      }, error => {
        $('.loading').fadeOut();
      });
  }

  extractTemplate() {
    if (this.form.template == "") {
      this.template = new Template();
      return;
    }

    this.template = JSON.parse(this.form.template);

    if (isNullOrUndefined(this.template.pages)) {
      this.template.pages = [];
    }
    this.pageCount = this.template.pages.length;

    if (isNullOrUndefined(this.template.wizards)) {
      this.template.wizards = [];
    }
  }

  refreshDocSchema() {
    if (this.form_wizard) {
      $('#docContainer').hide();
      $('#wizardContainer').show();
      $('#wizardContainer').html(
        '<form class="form-horizontal" action="#" id="wizardForm" method="POST">\n' +
        '  <div class="form-wizard">\n' +
        '    <div class="form-body">\n' +
        '      <ul class="nav nav-pills nav-justified steps" id="wizardNavigator">\n' +
        '      </ul>\n' +
        '      <div id="bar" class="progress progress-striped" role="progressbar">\n' +
        '        <div class="progress-bar progress-bar-success"> </div>\n' +
        '      </div>\n' +
        '      <div id="wizardTabsContainer" class="tab-content">\n' +
        '      </div>\n' +
        '    </div>\n' +
        '    <div class="form-actions" style="padding-top: 15px">\n' +
        '      <div class="row">\n' +
        '        <div class="col-md-12">\n' +
        '          <div class="pull-right">\n' +
        '            <a href="javascript:;" class="btn default button-previous">\n' +
        '              <i class="fa fa-angle-left"></i> Back </a>\n' +
        '            <a href="javascript:;" class="btn btn-outline green button-next"> Continue\n' +
        '              <i class="fa fa-angle-right"></i>\n' +
        '            </a>\n' +
        '            <a href="javascript:;" class="btn green button-submit"> Submit\n' +
        '              <i class="fa fa-check"></i>\n' +
        '            </a>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      </div>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</form>');

      this.buildWizards();
      this.handleSpecialEvents();
    }
    else {
      $('#docContainer').show();
      $('#wizardContainer').hide();
      $('#docContainer').html('');

      this.page = this.template.pages[this.page_index - 1] || [];
      let body = this.page.body || null;
      if (!isNullOrUndefined(body)) {
        this.schema = body.schema || [];
        let page_container = $('<div class="doc-wrapper"></div>');
        FormHelper.buildHtml(page_container, this.page);
        $('#docContainer').append(page_container);
      }
    }
  }

  extractInputs() {
    if (!this.form_wizard) {
      let inputs = {};
      for (let i in this.schema) {
        let item = this.schema[i];
        inputs = FormHelper.extractItem(item, inputs);
      }
      FormHelper.setLocalDoc(this.client_id, this.form_id, this.page_index, inputs);
    } else {
      for (let i in this.template.pages) {
        let index = Number(i) + 1;
        let page = this.template.pages[i];
        let inputs = {};
        for (let j in page.body.schema) {
          let item = page.body.schema[j];
          inputs = FormHelper.extractItem(item, inputs);
        }
        FormHelper.setLocalDoc(this.client_id, this.form_id, index, inputs);
      }
    }
  }

  seedInputs() {
    if (!this.form_wizard) { // seed doc page inputs
      FormHelper.seedPage(this.page, this.client_id, this.form_id, this.page_index);
    } else { // seed wizard inputs
      for (let i in this.template.pages) {
        let index = Number(i) + 1;
        let page = this.template.pages[i];
        FormHelper.seedPage(page, this.client_id, this.form_id, index);
      }
    }
  }

  submitDoc() {
    $('.loading').show();

    this.extractInputs();

    let data = [];
    for (let i = 0; i < this.pageCount; i++) {
      let inputs = FormHelper.getLocalDoc(this.client_id, this.form_id, (i + 1));
      let body = this.template.pages[i].body || {schema: []};
      let schema = body.schema;
      for (let j in schema) {
        let item = schema[j];
        if (FormHelper.isInput(item.type)) {
          let value = inputs[item.key] || null;
          if (value != null) {
            let input = {
              key: item.key,
              value: value,
              foreign_key: item.foreign_key || "",
              type: item.type,
              structure: item.structure,
            };
            data.push(input);
          }
        }
      }
    }

    if (this.form_id == 1) {
      var photo_data = localStorage.getItem('client_photo') || '/assets/common/img/avatar.png';
      let photo = {
        key: 'client_photo',
        value: photo_data,
        foreign_key: 'clients.photo',
        type: 'input',
      };
      data.push(photo);
    }

    if (this.client_id == 0) { // Create client
      this._clientService.createClient(data)
        .subscribe(response => {
          let message = response.message;
          this.client_id = response.client_id;
          Notification.notifyAny({message: message});

          this._docService.createDoc(data, this.client_id, this.form_id)
            .subscribe(data => {
              this._router.navigate(['/pages/client/addForm/' + this.client_id]);
            });

          $('.loading').fadeOut();
        }, error => {
          $('.loading').fadeOut();
        });
    }
    else { // Update client
      this._clientService.updateClient(data, this.client_id)
        .subscribe(data => {
          let message = data.success.message || "";
          if (message != "") {
            Notification.notifyAny({message: message, title: 'Server'});
          }

          $('.loading').fadeOut();
        }, error => {
          $('.loading').fadeOut();
        });

      this._docService.updateDoc(data, this.doc_id)
        .subscribe(data => {

        });
    }
  }

  getDoc() {
    if (this.client_id == 0) return;

    this._docService.getDocByClientForm(this.client_id, this.form_id)
      .subscribe(data => {
        this.doc_id = data.doc.id;
        for (let i in this.template.pages) {
          let schema = FormHelper.getSchema(this.template, i);
          let inputs = FormHelper.buildInputs(schema, data);
          FormHelper.setLocalDoc(this.client_id, this.form_id, Number(i) + 1, inputs);
        }
        this.seedInputs();

        var photo_data = data['clients.photo'];
        $("#clientPhotoImage").attr('src', photo_data);
        localStorage.setItem('photo_data', photo_data);
      });
  }

  resetDoc() {
    for (let i = 0; i < this.pageCount; i++) {
      FormHelper.setLocalDoc(this.client_id, this.form_id, (i + 1), '{}');
    }
  }

  buildWizards() {
    this.initInputsBySection();

    $('#wizardNavigator').html('');
    $('#wizardTabsContainer').html('');
    for (let i in this.template.wizards) {
      let wizard = this.template.wizards[i];
      let index = Number(i) + 1;
      let tab = $('<li>\n' +
        '<a href="#tab' + index + '" data-toggle="tab" class="step">\n' +
        '  <span class="number"> ' + index + ' </span>\n' +
        '  <span class="desc">\n' +
        '    <i class="fa fa-check"></i> ' + wizard.name +
        '  </span>\n' +
        '</a>\n' +
        '</li>');
      $('#wizardNavigator').append(tab);

      let active = index == 1 ? ' active' : '';
      let tab_div = $('<div class="tab-pane' + active + '" id="tab' + index + '"></div>');
      let panel_group = $('<div id="accordion' + index + '">');
      for (let j in wizard.sections) {
        let collapse_key = index + '_' + j;
        let section = wizard.sections[j];
        let panel_header = $('<div class="panel_header">' + section.name + '</div>');
        let panel_body = $('<div class="panel_body"></div>')

        if (!isNullOrUndefined(this.wizard_inputs[wizard.id])) {
          let inputs = this.wizard_inputs[wizard.id][section.id];
          for (let k in inputs) {
            let input = inputs[k];
            if (input.key == '') continue;

            let form_group = $('<div class="' + input.response_class + '"></div>');
            form_group.append($('<label class="label-grey">' + input.label + '</label>'));
            let input_item = this.getInputByItem(input);

            form_group.append(input_item);
            if (input.new_row) {
              let row = $('<div class="row wizard-row"></div>');

              // Create upload input
              if (input.label.includes('Print your complete name.')) {
                console.log('photo input building...');
                row.append($("<div style='margin-bottom: 30px; width: 200px; margin-left: auto; margin-right: auto'><img id='clientPhotoImage' width='180px' height='180px' src='/assets/common/img/avatar.png' /><input style='margin-top: 20px' id='photoInput' type='file'></div>"));
              }

              if (input.group_label != '') {
                row.append($('<div class="col-md-12"><label class="label-grey">' + input.group_label + '</label></div>'))
              }
              row.append(form_group);

              panel_body.append(row);
            } else {
              panel_body.children('.row:last').append(form_group);
            }
          }
        }

        panel_group.append(panel_header);
        panel_group.append(panel_body);
        tab_div.append(panel_group);
      }

      panel_group.jqxNavigationBar({
        width: '100%',
        theme: 'metro',
        showArrow: false,
      });
      panel_group.on('expandedItem', function (event) {
        let expandedItem = event.args.item;
        let index = Number(expandedItem) + 1;
        window.scrollTo(0, $(this).context.offsetTop);
      });


      $('#wizardTabsContainer').append(tab_div);
    }

    this.initWizard();

    // add special events
    $('#normal_is_married_1, #normal_is_married_0, #normal_have_children_0, #normal_have_children_1').change(function () {
      FormDocComponent.instance.handleSpecialEvents();
    });

    // Init upload photo events
    $('#photoInput').change(function (event) {
      var FR = new FileReader();

      FR.addEventListener("load", function (e) {
        let type = e.target['result'].split("/")[0];
        if (type != 'data:image') {
          Notification.notifyAny({ message: "Please upload an image." });
        } else {
          $('#clientPhotoImage').attr('src', e.target['result']);
          localStorage.setItem('client_photo', e.target['result']);
        }
      });

      FR.readAsDataURL(event.target.files[0]);
    });
  }

  handleSpecialEvents() {
    if ($('#normal_is_married_0')[0].checked) {
      $('#accordion1').jqxNavigationBar('disableAt', 2);
    }
    if ($('#normal_is_married_1')[0].checked) {
      $('#accordion1').jqxNavigationBar('enableAt', 2);
    }
    if ($('#normal_have_children_0')[0].checked) {
      $('#accordion1').jqxNavigationBar('disableAt', 3);
    }
    if ($('#normal_have_children_1')[0].checked) {
      $('#accordion1').jqxNavigationBar('enableAt', 3);
    }
  }

  initInputsBySection() {
    this.wizard_inputs = [];
    for (let i in this.template.pages) {
      let page = this.template.pages[i];
      let schema = page.body.schema;
      for (let j in schema) {
        let item = schema[j];
        if (!isNullOrUndefined(item.wizard_id)) {
          if (isNullOrUndefined(this.wizard_inputs[item.wizard_id])) {
            this.wizard_inputs[item.wizard_id] = [];
          }
          if (!isNullOrUndefined(item.section_id)) {
            if (isNullOrUndefined(this.wizard_inputs[item.wizard_id][item.section_id])) {
              this.wizard_inputs[item.wizard_id][item.section_id] = [];
            }
            this.wizard_inputs[item.wizard_id][item.section_id].push(item);
          }
        }
      }
    }
  }

  getInputByItem(item, type = 'normal') {
    let dom;
    let classes = item.classes ? item.classes : '';

    switch (item.type) {
      case 'input':
        dom = $('<input>');
        dom.addClass('form-control');
        break;
      case 'textarea':
        dom = $('<textarea></textarea>');
        dom.addClass('form-control');
        break;
      case 'radio':
        dom = $('<div></div>');
        FormHelper.createBoxes(dom, item, 'radio');
        break;
      case 'checkbox':
        dom = $('<div></div>');
        FormHelper.createBoxes(dom, item, 'checkbox');
        break;
      case 'select':
        dom = $('<select></select>');
        dom.css('width', '100%');
        if (type == 'print') {
          dom = $('<div></div>');
        } else {
          let options = JSON.parse(item.structure);
          for (let i = 0; i < options.length; i++) {
            let option = $('<option value="' + options[i] + '">' + options[i] + '</option>');
            dom.append(option);
          }
        }
        break;
    }
    if (isNullOrUndefined(dom)) {
      return;
    }

    dom.addClass(classes);
    if (FormHelper.isInput(item.type) && !isNullOrUndefined(item.key)) {
      dom.attr('id', type + '_' + item.key);
      dom.attr('dom-id', item.id);
    }

    return dom;
  }

  initWizard() {
    function handleTitle(tab, navigation, index) {
      let total = navigation.find('li').length;
      let current = index + 1;
      // set wizard title
      // $('.step-title', $('#wizardForm')).text('Step ' + (index + 1) + ' of ' + total);
      // set done steps
      jQuery('li', $('#wizardForm')).removeClass("done");
      let li_list = navigation.find('li');
      for (let i = 0; i < index; i++) {
        jQuery(li_list[i]).addClass("done");
      }

      if (current == 1) {
        $('#wizardForm').find('.button-previous').hide();
      } else {
        $('#wizardForm').find('.button-previous').show();
      }

      if (current >= total) {
        $('#wizardForm').find('.button-next').hide();
        $('#wizardForm').find('.button-submit').show();
      } else {
        $('#wizardForm').find('.button-next').show();
        $('#wizardForm').find('.button-submit').hide();
      }
      App.scrollTo($('.page-title'));
    }

    $('#wizardForm').bootstrapWizard({
      'nextSelector': '.button-next',
      'previousSelector': '.button-previous',
      onTabClick: function (tab, navigation, index, clickedIndex) {
        handleTitle(tab, navigation, clickedIndex);
      },
      onNext: function (tab, navigation, index) {
        handleTitle(tab, navigation, index);
      },
      onPrevious: function (tab, navigation, index) {
        handleTitle(tab, navigation, index);
      },
      onTabShow: function (tab, navigation, index) {
        let total = navigation.find('li').length;
        let current = index + 1;
        let $percent = (current / total) * 100;
        $('#wizardForm').find('.progress-bar').css({
          width: $percent + '%'
        });
      }
    });

    $('#wizardForm').find('.button-previous').hide();
    $('#wizardForm .button-submit').click(function () {
      FormDocComponent.instance.submitDoc();
    }).hide();
  }
}
