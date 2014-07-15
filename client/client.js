/*
 Set title with Meteor.settings.public.appName
 Allow to change name for test, dev, prod environments
*/
Meteor.startup(function () {
    Meteor.autorun(function () {
        document.title = Meteor.settings.public.appName;
    });
});


/*

Override accounts-ui-bootstrap-3

*/

// Override forgot password access
Template._loginButtonsLoggedOutPasswordService.inLoginFlow = function() {
    return false;
};

// Override changing password ui for CAS user
Template._loginButtonsLoggedInDropdownActions.allowChangingPassword = function() {
    var user = Meteor.user();
    var cas;
    if( typeof(user.services) !== 'undefined') {
        cas = (typeof(user.services.cas) === 'undefined');
    };
    return ( cas &&  (user.emails && user.emails[0] && user.emails[0].address));
};


/*
 Hooks
*/

AutoForm.addHooks(null, {
        onSubmit: function () {
        //  close modal form on submit;
          $('#updateAppForm').modal('hide');
        }
}); 

/* appName helper

Usage : header, inline content editing

*/
UI.registerHelper('appName', function (opts) {
    return Meteor.settings.public.appName;
});


/* Helper to set context of content field for inline editing

 Usage :

 {{#with Message n="zzz"}}
  {{content}}
 {{/with}}

*/
UI.registerHelper('Message', function (opts) {
    if (!opts) return '';
    var hash = opts.hash;// (opts || {}).hash || {};

    var obj = Apps.findOne({"nom":hash.n});
    //  console.log("Mess : ", obj.name);
    return (obj) ? obj : '';
});


/* Helper to format dates

  Usage: 

  {{dateFormat creation_date}} 
  or
  {{dateFormat creation_date format="MMMM YYYY"}}

*/
UI.registerHelper('dateFormat', function(context, block) {
    if (window.moment) {
      var f = block.hash.format;// || "MMM DD, YYYY hh:mm:ss A";
      //return (f) ? moment(context).format(f) : moment(context).toISOString(); 
      return moment(context).format(f);
    }else{
      return context;   //  moment plugin not available. return data as is.
    };
  });

/* 
Helpers for start page
*/

Template.start.tables = function () {
        return Apps.find();
}

// reactive table settings
Template.start.helpers({
    settings: function () {
        return {
            rowsPerPage: 10,
            showFilter: true,
            useFontAwesome: true,
            showNavigation: 'auto',
            fields: [
                { key : 'nom', label: 'Nom'}, 
                { key : 'usage', label: 'Usage'},
                { key : 'owner', label: 'Contacts'},
                { key : 'domaine', label: 'Domaine'},
                { key : 'content', label: 'Description',  tmpl: Template.desciptionTmpl}, 
                //{ key : 'filtre', label: 'Filtres×',  tmpl: Template.filtresTmpl}, 
                { key : 'filtre', label: 'Filtres'}, 
                { key : 'dataperso', label: "Données perso"},
                { key : 'ips', label: 'IPs sources'},
                { key : 'status', label: 'État', fn: statushtml },
                { key : 'compte', label: 'Compte'},
                { key : 'serveurs', label: 'Serveurs'},
                { key: 'ctl', label: ' ', tmpl: Template.actionTmpl}
              ]
        };
    }
});


var statusLabel =  {
    0: "Demande",
    1: "Compte",
    2: "ACL réseau",
    3: "ACL ldap",
    4: "Attente Validation",
    5: "Ok",
    6: "Suppression"};

var statushtml = function (value) {
    var html;

    if (value === null || value === undefined || value === 0) {
      html = 'style="color: #994848; font-weight: bold"><i class="fa fa-spinner fa-spin"></i>'  + statusLabel[0];
    } else {
      if (value === 1)
        html = 'style="color: orange">&#10004; ' + statusLabel[1];
      else if (value === 2)
        html = 'style="color: orange">&#10004; ' + statusLabel[2];
      else if (value === 3)
        html = 'style="color: orange">&#10004; ' + statusLabel[3];
      else if (value === 4)
        html = 'style="color: orange">'  + statusLabel[4] + '<i class="fa fa-spinner fa-spin"></i>';
      else if (value === 5)
        html = 'style="color: green">&#10004;';
      else if (value === 6)
        html = 'style="color: #994848;">&#10008; '  + statusLabel[6] + '<i class="fa fa-spinner fa-spin"></i>';
      else 
        html = 'style="color: lightblue"> ?? ' ;
      }
    return new Spacebars.SafeString('<span class="status" '+html+'</span>');
  };

// JS events
Template.start.events ({
    // edit reactive table cells
    'click .reactive-table tr': function(e, t) {
      e.preventDefault();
      AutoForm.resetForm("updateAppForm");

      var select = $(e.target).attr("class");
      if (select === 'glyphicon glyphicon-pencil clickable docEdit')
         select = 'full';
      Session.set("selectedOp", select);
      Session.set("selectedDoc", this._id);
      //console.log("Click -- ", select);
      //console.log("Click -- ", this._id);
 
      var title = Apps.findOne(this._id).nom;
      if (select === 'glyphicon glyphicon-trash clickable docClear') {
        var result = confirm(i18n('confirm', title ));
        Session.set("selectedDoc", null);
        Session.set("selectedOp", null);
        if ( result === true ) 
          Apps.remove(this._id);
      }
      else if (select === 'glyphicon glyphicon-info-sign clickable docInfo') {
        Session.set("selectedDoc", null);
        Session.set("selectedOp", null);
          return Router.go('/appinfo/'+this._id);
      }
      else if (select !== 'full')  {
          $('#updateAppForm').modal('show');
      }
    },
    // for Message editing
   'click .edit .docEdit': function(e, t) {
      e.preventDefault();
      Session.set("selectedDoc", this._id);
      Session.set("selectedOp", 'content');
    }

  });


// Helpers for update modal form

Template.updateAppForm.selectedDoc = function(t) {
    return Apps.findOne(Session.get("selectedDoc"));
};


Template.updateAppForm.docFields = function(t) {
    var field = Session.get("selectedOp");
    return (field !== 'full') ? field : '';
};


Template.updateAppForm.testField = function(t) {
    var field = Session.get("selectedOp");
    return (t === field);
};

// Helpers for appinfo

Template.appInfo.statushtml = function(t) {
        return  statushtml(this.status);
};

// Event for signin  

Template.signin.events({
    'click .login-btn': function (event, template) {
        event.preventDefault();
        Meteor.loginWithCas();
    }
});


