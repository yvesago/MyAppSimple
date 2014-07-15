////////////////////////////////////////////////////////////////////
// Publish
//

console.log('Publish ');


// admin can view all apps
Meteor.publish("apps", function (){
  var user = Meteor.users.findOne({_id:this.userId});
  if (user) {
      if (Roles.userIsInRole(user, ["admin"])) {
           //  console.log('   for admin  ',user.emails[0].address);
          return Apps.find()
      }
      else {
           //  console.log('   for user  ',user.emails[0].address);
          return Apps.find({$or:[{owner: user.emails[0].address}, {nom: Meteor.settings.public.appName}]});
          
          }
  };
  this.stop();
  return;

});

// Publish all roles
Meteor.publish(null, function (){
      return Meteor.roles.find()
});

// Authorized users can manage user accounts
Meteor.publish("users", function () {
  var user = Meteor.users.findOne({_id:this.userId});

  if (Roles.userIsInRole(user, ["admin","manage-users"])) {
    // console.log('publishing users', this.userId)
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1, roles: 1}});
  }

  this.stop();
  return;
});


