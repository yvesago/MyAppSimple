/* 
mostly from meteor-collection-hooks
*/

InsecureLogin = {
  queue: [],
  ran: false,
  ready: function (callback) {
    this.queue.push(callback);
    if (this.ran) this.unwind();
  },
  run: function () {
    this.ran = true;
    this.unwind();
  },
  unwind: function () {
    _.each(this.queue, function (callback) {
      callback();
    });
    this.queue = [];
  }
};


loginWith = function (name) {
  console.info("Test login with", name);
  Accounts.callLoginMethod({
    methodArguments: [{username: name}],
    userCallback: function (err) {
    if (err) throw err;
      console.info("Insecure login successful!", name);
    InsecureLogin.run();
    }
  });
};


/*if (Meteor.isClient) {
} else {
  InsecureLogin.run();
}*/

if (Meteor.isServer) {
   //Meteor.users.remove({"username": "InsecureLogin"});

  if (!Meteor.users.find({"username": "InsecureLogin"}).count()) {
    var insecId = Accounts.createUser({
      username: "InsecureLogin",
      email: "test@test.com",
      password: "password",
      profile: {name: "InsecureLogin"}
    });
    Roles.addUsersToRoles(insecId, ['admin']);
  };

  if (!Meteor.users.find({"username": "InsecureAdminLogin"}).count()) {
    var insecId = Accounts.createUser({
      username: "InsecureAdminLogin",
      email: "testadmin@test.com",
      password: "password",
      profile: {name: "InsecureAdminLogin"}
    });
    Roles.addUsersToRoles(insecId, ['admin']);
  }

  if (!Meteor.users.find({"username": "InsecureTestLogin"}).count()) {
    var insecId = Accounts.createUser({
      username: "InsecureTestLogin",
      email: "usertest@test.com",
      password: "password",
      profile: {name: "InsecureTestLogin"}
    });
    //Roles.addUsersToRoles(insecId, ['admin']);
  }

  Accounts.registerLoginHandler(function (options) {
    if (!options.username) return;

    console.log('xxx =>', options.username);
    // clean Apps collection for InsecureLogin
    if (options.username === "InsecureLogin") Apps.remove({});

    var user = Meteor.users.findOne({"username": options.username});
    if (!user) return;

    return {
      userId: user._id
    };
  });
}
