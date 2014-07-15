if (Meteor.isServer) {
  Meteor.startup(function () {
  console.log('===start===');
  });

  Tinytest.add("Admin mails - test admin mails for email send", function (test) {
    var adminmails = _.map(_.pluck(Roles.getUsersInRole('admin').fetch(), 'emails'),
             function(user){ return _.pluck(user,'address'); }
             ).sort().join(',');
     test.equal(adminmails,'test@test.com,testadmin@test.com');         
  });
};


if (Meteor.isClient) {

Tinytest.addAsync("Admin - admin user can add or remove app", function (test, next) {
 loginWith("InsecureLogin");
    InsecureLogin.ready(function () {

      test.equal(Apps.find({}).count(), 0, 'start whithout app');

      var idapps =  Apps.insert({'nom': 'test', 'ips': ['127.0.0.1'] }, function (err1, id1) {
          test.isFalse(!!err1,'no error in admin insert');
            next();
          });
    // This is only client side
          test.equal(Apps.find({}).count(), 1, ' one client app');
          if (idapps) Apps.remove({'_id':idapps});
          test.equal(Apps.find({}).count(), 0, 'app client removed');
      });
});

Tinytest.add("Admin - after publish no more app", function (test) {
    // Test after subscribe update
    test.equal(Apps.find({}).count(),0, 'no more app');
});




// ////////////////////////////////////
var idapps2;

Tinytest.addAsync("User - non admin user can add app", function (test, next) {
  loginWith("InsecureTestLogin");
    InsecureLogin.ready(function () {
      test.equal(Apps.find({}).count(), 0, 'no app');
      idapps2 =  Apps.insert({'nom': 'test3', 'ips': ['127.0.0.1','127.0.0.2'] }, function (err1, id1) {
            test.isFalse(!!err1,'no error in admin insert');
            next();
          });
         // Not relevant : removed only client side
         /* test.equal(Apps.find({}).count(), 1, ' removed client app');
            if (idapps2) Apps.remove({'_id':idapps2}, function (err1) {
                    console.log('==err==++',err1);
          });
           test.equal(Apps.find({}).count(), 0, 'app client removed');*/
      });
    });

Tinytest.add("User - one app after publish", function (test) {
     test.equal(Apps.find({}).count(), 1, ' one app');
});

Tinytest.addAsync("User - test remove apps after publish", function (test,next) {
   if (idapps2) Apps.remove({'_id':idapps2}, function (err1) {
      test.isTrue(!!err1,'error in remove');
      next();
      });
      test.equal(Apps.find({}).count(), 0, ' no more client app');
});

Tinytest.add("User - Still one app after failed remove", function (test) {
        test.equal(Apps.find({}).count(), 1, ' one app');
});


Tinytest.addAsync("User - allow update status 5", function (test,next) {
       Apps.update({'_id':idapps2},{ $set: {'status': 5 }}, function (err1, id1) {
            test.isFalse(!!err1,'no error in user update status 5');
            next();
          });
});

Tinytest.addAsync("User - deny update status 3", function (test,next) {
    console.log('++++++',Apps.findOne({'_id':idapps2}).updatesHistory);
        Apps.update({'_id':idapps2},{ $set: {'status': 3 }}, function (err1, id1) {
            test.isTrue(!!err1,'error in user update status 3');
            next();
          });
});

Tinytest.addAsync("User - deny update field \"compte\"", function (test,next) {
    console.log('++++++',Apps.findOne({'_id':idapps2}).updatesHistory);
        Apps.update({'_id':idapps2},{ $set: {'compte': 'comptetest' }}, function (err1, id1) {
            test.isTrue(!!err1,'error in user update compte');
            next();
          });
});


Tinytest.addAsync("User - allow update ips", function (test,next) {
       Apps.update({'_id':idapps2},{ $set: {'ips': ['10.10.0.1'] }}, function (err1, id1) {
            test.isFalse(!!err1,'no error in user update ips');
            console.log(err1);
            next();
          });
});

Tinytest.add("User - set status to 0 after ip change", function (test,next) {
       test.equal(Apps.findOne({'_id':idapps2}).status,0,"set status to 0 after ip change");
});

// ////////////////////////////////////

Tinytest.addAsync("2ndAdminLogin - admin user can view all apps, add and remove app", function (test, next) {
 loginWith("InsecureAdminLogin");
    InsecureLogin.ready(function () {
      test.equal(Apps.find({}).count(), 1, 'still one app from user');
      var idapps =  Apps.insert({'nom': 'test', 'ips': ['127.0.0.1'] }, function (err1, id1) {
          console.log('==err==++',err1);
          test.isNull(err1 || null);
            next();
          });
          test.equal(Apps.find({}).count(), 2, ' two client app');
          if (idapps) Apps.remove({'_id':idapps}, function (err1) {
           //test.isNull(err1 || null);
          //  next();
          });
           test.equal(Apps.find({}).count(), 1, 'admin app removed');
      });
});

Tinytest.addAsync("2ndAdminLogin - after publish still one user app", function (test, next) {
            test.equal(Apps.find({}).count(),1, 'still one user app');
            next();
});

}; // end isClient
