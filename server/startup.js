Meteor.startup(function () {
// code to run on server at startup

  ////////////////////////////////////////////////////////////////////
  // Create default local Users from settings
  //

  if (Meteor.users.find().fetch().length === 0) {
    console.log('Creating default local users: ');
    var users = Meteor.settings.default.users;

    _.each(users, function (userData) {
      var id, user;
      
      console.log(userData);

      id = Accounts.createUser({
        email: userData.email,
        password: Meteor.settings.default.password,
        profile: { name: userData.name }
      });

      // email verification
      Meteor.users.update({_id: id}, {$set:{'emails.0.verified': true}});

      Roles.addUsersToRoles(id, userData.roles);
    
    });
  }


 if (_.isString(Meteor.settings.appAdmin)) {
    console.log("Checking admin role for "+Meteor.settings.appAdmin);
    var user = Meteor.users.findOne({username: Meteor.settings.appAdmin});
    if (user) {
      console.log(Meteor.settings.appAdmin+" found");
      if (Roles.userIsInRole(user._id, "admin")) {
        console.log(Meteor.settings.appAdmin+" already has admin role");
      } else {
        console.log("set admin role to "+Meteor.settings.appAdmin);
        Roles.addUsersToRoles(user._id, ['admin'] );
      }
    }
  }

 // set mail server 
 process.env.MAIL_URL = Meteor.settings.mail.smtp;
 process.env.ROOT_URL="http://agostini.univ-metz.fr:8001";

});
