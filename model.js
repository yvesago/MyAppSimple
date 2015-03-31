
/////////////////////////////
// Apps model

Apps = new Meteor.Collection("apps");

Apps.allow ({
    insert: function (userId, doc) {
        return (userId)
        },
    update: function (userId, doc) {
        if (userId && Roles.userIsInRole(userId, ['admin']) )
            return true;
        return (userId && _.contains(doc.owner, Meteor.user().emails[0].address) )
        },
    remove: function (userId, doc) {
        // limite par role
        if ( Roles.userIsInRole(userId, ['admin']) === false ) {
           throw new Meteor.Error(404, "Not admin");
           return false;
        }
        return true;
        },

    });

/////////////////////////////
// Hooks

if (Meteor.isServer) {
    // protect admin fields
    Apps.before.update(function(userId, doc, fieldNames, modifier, options) {
      if ( (_.contains(fieldNames, 'compte') || _.contains(fieldNames, 'serveurs') )
          && Roles.userIsInRole(userId, ['admin']) === false) {
          return false;
      }
    });

    // send mail after insert
    Apps.after.insert(function(userId, doc) {
        var adminmails = 
        _.map(_.pluck(Roles.getUsersInRole('admin').fetch(), 'emails'), 
            function(user){ return _.pluck(user,'address'); }).join(',');
        if (Meteor.settings.environment === 'prod') {
            Email.send({
            to: adminmails + ',' + Meteor.user().emails[0].address,
            from: Meteor.settings.mail.from,
            subject: "["+ Meteor.settings.public.appName +"] Nouvelle demande",
            text: Meteor.user().emails[0].address + " a créé une demande pour " + doc.nom +
            "\n\nVous pouvez suivre cette demande ici : " + Router.routes['appInfo'].url({_id: doc._id}) });
        }
        else {
         console.log("=====> Send mail by ",Meteor.user().emails[0].address);
         console.log("=====> Send mail about ",Router.routes['appInfo'].url({_id: doc._id}));
         };
        console.log("=====> Send mail for ",adminmails + ',' + Meteor.user().emails[0].address);
    });

    // new request on ip or data perso change
    Apps.after.update(function(userId, doc, fieldNames, modifier, options) {
      if (_.contains(fieldNames, 'ips') && !_.isEqual(this.previous.ips,modifier.$set.ips)) {
        // set status 0, send mail
        var chg = [];
        chg = _.difference(modifier.$set.ips,this.previous.ips);
        if (chg.length === 0) 
            chg = _.difference(this.previous.ips,this.previous.ips);
        if (chg.length === 0) 
            chg = modifier.$set.ips; // XXX don't find diff on removed ips !
        Apps.update({'_id':doc._id},{ $set: {'status': 0, '_chgips': chg }});

        var adminmails = 
        _.map(_.pluck(Roles.getUsersInRole('admin').fetch(), 'emails'), 
            function(user){ return _.pluck(user,'address'); }).join(',');
        if (Meteor.settings.environment === 'prod') {
            Email.send({
            to: adminmails + ',' + Meteor.user().emails[0].address,
            from: Meteor.settings.mail.from,
            subject: "["+ Meteor.settings.public.appName +"] Modification IPs pour " + doc.nom,
            text: Meteor.user().emails[0].address + " a modifié les IPs pour " + doc.nom +
            "\n\nVous pouvez suivre cette demande ici : " + Router.routes['appInfo'].url({_id: doc._id}) });
        }
        else {
         console.log("=====> prev values ", this.previous.ips);
         console.log("=====> values ", modifier);
         };
        };

      if (_.contains(fieldNames, 'dataperso') && !_.isEqual(this.previous.dataperso,modifier.$set.dataperso)) {
        // set status 0, send mail
        Apps.update({'_id':doc._id},{ $set: {'status': 0 }});

        var adminmails = 
        _.map(_.pluck(Roles.getUsersInRole('admin').fetch(), 'emails'), 
            function(user){ return _.pluck(user,'address'); }).join(',');
        if (Meteor.settings.environment === 'prod') {
            Email.send({
            to: adminmails + ',' + Meteor.user().emails[0].address,
            from: Meteor.settings.mail.from,
            subject: "["+ Meteor.settings.public.appName +"] Modification Data Perso pour " + doc.nom,
            text: Meteor.user().emails[0].address + " a modifié les Data Perso pour " + doc.nom +
            "\n\nVous pouvez suivre cette demande ici : " + Router.routes['appInfo'].url({_id: doc._id}) });
        }
        else {
         console.log("=====> prev values ", this.previous.dataperso);
         console.log("=====> values ", modifier);
         };
        }
        ;
      if ( _.contains(fieldNames, "status") ) {
        // send mail on status change ?
        console.log("=====> value ",modifier.$set.status);
        };
    });
};

/////////////////////////////
// Schema

var ipv46test = /(^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$)/;


var statusLabel =  {
    0: i18n('Request'), 
    1: i18n('Account'), 
    2: i18n('NetworkAccess'),
    3: i18n('FieldAccess'),
    4: i18n('WaitOnValid'),
    5: "Ok",
    6: i18n('ToRemove')
    };
    
var Schemas = {};

Schemas.app = new SimpleSchema({
    nom: {
         type: String,
         label: i18n('AppName') + "*",
         max: 200,
         unique: true
         },
    owner:{
         type: [String],
         label: "Contact*",
         optional: true,
         minCount: 1,
         min: 4,
         regEx: SimpleSchema.RegEx.Email,
         autoValue: function () {
           if (this.isInsert) {
            if (!this.operator) {
                return [Meteor.user().emails[0].address]
            }
            else {
               return {$push: Meteor.user().emails[0].address};
            } 
           }
         }
         },
    content: {
         type: String,
         label: "Description",
         max: 2000,
         optional: true,
         autoform: {
             rows: 3       // for textarea field
         }
         },
    domaine: {
         type: String,
         label: "Domaine",
         allowedValues: ['Recherche','Pédagogie','ENT','DDE','DN SIG','DN Infra','DN UN','DN SU'],
         autoform: {
          options: "allowed",
          firstOption: i18n('SelectOneLabel') 
         },
         optional: true
        },
    usage: {
         type: String,
         label: "Usage Ldap+",
         allowedValues: ['Autorisation', 'Authentification','Lecture profil','Traitement de données'],
         autoform: {
          options: "allowed",
          firstOption: i18n('SelectOneLabel') 
         },
         optional: true
         },
    filtre: {
         type: String,
         label: "Filtres",
         max: 2000,
         optional: true,
         autoform: {
             rows: 2
         }
         }, 
    dataperso: {
        type: [String],
        label: "Données perso+",
        optional: true,
        autoform: {
           options: "allowed", // autoform need to respect allowedValues 
           noselect: true      // for checkboxes
        },
        allowedValues: ["telephoneNumber","supannEtuID","supannEmpID","supannMailPerso","schacDateOfBirth"]
        },
    ips: {
        type: [String],
        label: "IPs sources*",
        regEx: ipv46test,
        optional: true,
        defaultValue: [],
        minCount: 1,
        },
    _chgips: {              // as ips are mandatory _chgips allow to show ips
        type: [String],     // changed requests in history
        label: "IPs changed",
        regEx: ipv46test,
        optional: true,
        defaultValue: []
        },
    compte: { // only for admins
        type: String,
        label: "Compte",
        optional: true,
        custom: function() {
        if ( this.isSet && Roles.userIsInRole(this.userId, ['admin']) === false ) {
             return "notAllowedField"; // set message, protection is server side
           }
         }
        },
    serveurs: { // only for admins
        type: String,
        label: "Serveurs",
        optional: true,
        custom: function() {
           if ( this.isSet && Roles.userIsInRole(this.userId, ['admin']) === false ) {
             return "notAllowedField"; // set message, protection is server side
           }
         }
        },
    created: {
        type: Date,
        label: "Created Date",
        autoValue: function () {
            if (this.isInsert) {
              return new Date;
            } else {
              this.unset();
            }
        }
    },
    createdBy: {
        type: String,
        label: "Created By",
        autoValue: function () {
            if (this.isInsert) {
              return Meteor.user().emails[0].address;
            } else {
              this.unset();
            }
        }
    },
    modified: {
        type: Date,
        label: "Modified Date",
        optional: true,
        autoValue: function () {
            if (this.isUpdate) {
              return new Date;
            } else {
              this.unset();
            } 
        }
    },
    modifiedBy: {
        type: String,
        label: "Modified By",
        optional: true,
        autoValue: function () {
            if (this.isUpdate) {
              return Meteor.user().emails[0].address;
            } else {
              this.unset();
            } 
        }
    },
    status: { // some values for admins
      type: Number,
      optional: true,
      custom: function() {
        if (this.isSet && (!this.operator || this.operator === "$set") ) {
            if ( !_.contains([0, 1, 2, 3, 4, 5, 6], this.value) ) 
             return "notAllowed";
           if ( Roles.userIsInRole(this.userId, ['admin']) === false  && _.contains([ 1, 2, 3, 4], this.value))
             return "notAllowedStatus";
        }
      },
      autoform: {
        options:  [
          {label: statusLabel[0], value: 0},
          {label: statusLabel[1], value: 1},
          {label: statusLabel[2], value: 2},
          {label: statusLabel[3], value: 3},
          {label: statusLabel[4], value: 4},
          {label: statusLabel[5], value: 5},
          {label: statusLabel[6], value: 6}
        ]
      }
    },
    updatesHistory: {
        type: [Object],
        optional: true,
        autoValue: function() {
          var ips = this.field("_chgips");
          var owner = this.field("owner");
          var status = this.field("status");
          var dataperso = this.field("dataperso");
          if (status.isSet || dataperso.isSet) {
            if (this.isInsert) {
              return [{
                  date: new Date,
                  by: Meteor.user().emails[0].address,
                  content: ips.value.join(', ') + ((dataperso.isSet)?dataperso.value.join(', '): '')
                }];
            } else {
              var text = (statusLabel[status.value] || '');
              text = text + ' ' + ((dataperso.isSet && dataperso.value)?dataperso.value.join(', '): '');
              text = text + ' ' + ((ips.isSet)?ips.value.join(', '): '');
              return {
                $push: {
                  date: new Date,
                  by: Meteor.user().emails[0].address,
                  content: text
                }
              };
            }
          } else {
            this.unset();
          } 
        }
      },
  'updatesHistory.$.date': {
    type: Date,
    optional: true
  },
  'updatesHistory.$.content': {
    type: String,
    optional: true
  },
  'updatesHistory.$.by': {
    type: String,
    optional: true
  },
     
});


/////////////////////////////
// custom message 

Schemas.app.messages({
    "regEx ips": "[label] ip non valide",
    'regEx owner': "[label] l'adresse e-mail n'est pas valide",
    'regEx.0 owner': "[label] l'adresse e-mail n'est pas valide",
    'regEx.1 owner': "[label] l'adresse e-mail n'est pas valide",
    'regEx.2 owner': "[label] l'adresse e-mail n'est pas valide",
    'regEx.3 owner': "[label] l'adresse e-mail n'est pas valide",
    'regEx.4 owner': "[label] l'adresse e-mail n'est pas valide",
    required: "[label] est obligatoire",
    minString: "[label] must be at least [min] characters",
    maxString: "[label] cannot exceed [max] characters",
    minNumber: "[label] must be at least [min]",
    maxNumber: "[label] cannot exceed [max]",
    minDate: "[label] must be on or before [min]",
    maxDate: "[label] cannot be after [max]",
    minCount: "Vous devez mettre au minimum [minCount] valeure",
    maxCount: "You cannot specify more than [maxCount] values",
    noDecimal: "[label] must be an integer",
    noUnique: "[label] doit être unique",
    notAllowed: "[value] is not an allowed value",
    notAllowedStatus: "Status réservé aux admins",
    notAllowedField: "Champs réservé aux admins",
    expectedString: "[label] must be a string",
    expectedNumber: "[label] must be a number",
    expectedBoolean: "[label] must be a boolean",
    expectedArray: "[label] must be an array",
    expectedObject: "[label] must be an object",
    expectedConstructor: "[label] must be a [type]",
    regEx: "[label] failed regular expression validation"
});

Apps.attachSchema(Schemas.app);
