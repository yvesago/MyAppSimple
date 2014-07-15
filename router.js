
////////////////////////////////////////////////////////////////////
// Routing
//

var filters = {

  /**
   * ensure user is logged in 
   */
  authenticate: function (pause) {
    var user;
    console.log('authenticate:');
    Meteor.subscribe('users');
    if (Meteor.loggingIn()) {
      this.render('loading');
    } else {
      user = Meteor.user();
      if (!user) {
        console.log('filter: signin');
        this.render('signin');
          pause();
        return;
       };
   }
 }, 
 // force CAS auth
 forcecas: function (pause) {
     Meteor.loginWithCas();
     Router.go('start');
     return;
 },
 wait: function () {
      this.render('loading');
      this.subscribe('apps').wait();
 }
};


Router.configure({
//  layout: 'start',
  loadingTemplate: 'loading',
  notFoundTemplate: 'not_found',
});

Router.onBeforeAction('loading');

Router.map(function () {
  this.route('start', {
    path: '/',
    onBeforeAction: [filters.authenticate,filters.wait]
  });
  // url to force a CAS auth
  this.route('cas', {
    path: '/cas',
    onBeforeAction: [filters.forcecas,filters.wait]
  });
  this.route('admin', {
    onBeforeAction: [filters.authenticate,filters.wait]
  });
 this.route('appInfo', { 
      path: '/appinfo/:_id',
      onBeforeAction: [filters.authenticate,filters.wait],
      data: function() { 
           Session.set("selectedDoc", this.params._id);  // for update form
           Session.set("selectedOp", 'full');  // for update form
           return Apps.findOne({_id: this.params._id}); }
 });
});
