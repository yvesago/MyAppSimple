# MyAppSimple

This is a sample Meteor application to play with mixing authentication, TinyTest, settings, models, hooks and forms.

This application is a form to store user requests in a table and admins manage the request with a simple workflow where admins can set an unordered 'status' field or some private fields.

The field `status` is shared between admins and users.

## Quick start

Install Meteor in debian wheezy with backports (07/2014)

```
$ apt-get install build-essential

$ apt-get install nodejs mongodb-server
$ ln -s /usr/bin/nodejs /usr/bin/node
$ curl https://www.npmjs.org/install.sh | sh

# install Meteor
$ curl https://install.meteor.com/ | sh
```

Get this code
```
git clone https://github.com/yvesago/MyAppSimple.git
cd MyAppSimple/
```


Add packages:
```
meteor add aldeed:collection2
meteor add aldeed:autoform
meteor add matb33:collection-hooks
meteor add iron:router

meteor add accounts-password
meteor add alanning:roles
meteor add mrt:accounts-admin-ui-bootstrap-3
meteor add ian:accounts-ui-bootstrap-3

meteor add atoy40:accounts-cas
meteor add atoy40:accounts-ldap-profile

meteor add kasoki:reactive-table
meteor add natestrauser:font-awesome
meteor add showdown
meteor add email

meteor add anti:i18n
meteor add jeeeyul:moment-with-langs
```

tests:
```
meteor test-packages tests/  --settings tests/Meteor.settings.test
```

Watch results in <http://localhost:3000>


## Settings

`server/Meteor.settings.tmpl` contains a sample settings file. You can copy and protect `server/Meteor.settings` with `.gitignore` and set your secret values.

`server/Meteor.settings` contains values visible on **server side**. Only values in subset `" public": { } ` are visible on **client side**.

You can start to define an **application name** (AppName) and **environment** status : only `prod` environment will send mails.



## Model

`model.js` contains the description of `Apps` collection.

`collection2` and `collection-hooks` are used to manage most of access logic and data processing from `model.js`. This allow to write quick and easy tests.  Moreover, `server/publish.js` show Apps' documents to owners and the special AppName application to everybody.

You will find in `model.js` some sample code for sending e-mails, deny/allow access to data and some hooks to limit fields or values to admins or users.

`collection2` allows to manage mandatory and default values or create an update history of changes.



## Authentication

To create a mixed authentication between local login/password and remote Jasig CAS login and ldap account, we use 
`account-password`,  `roles`,  `accounts-ui-bootstrap-3` and `account-cas`, `account-ldap-profile`.

`accounts-admin-ui-bootstrap-3` allows to manage roles.

`client/client.js` contains code to remove forgoten and changing password functionalities for remote account. `Meteor.settings` contains samples for cas/ldap settings ability to create some default local accounts and roles created on startup.

CAS needs to use the real server URL. You need to set ROOT_URL on meteor startup : 
```
ROOT_URL="http://myappserver.univ.org:3000" meteor --settings server/Meteor.settings
```

`router.js` is used to request authentication.

## Tests

Even most of Meteor and Meteor packages use **TinyTest**, there's a real lack of documentation on Meteor testing. 

In `tests/` directory you will find a simple `tests.js` with some tests to validate data access by roles.

```
meteor test-packages tests/  --settings tests/Meteor.settings.test
```

You will watch results on <http://localhost:3000>


`insecure_login.js` allows switching between few users profiles. Apps collection is flushed before any admin connexion.

`packages.js` defines packages and production files to be tested : the most important files for this sample app are `model.js`and `publish.js̀ . `router.js` and `Meteor.settings.test` are used to respect some mandatory values used in `model.js`.


## Views 

Views are defined in `client/myappsimple.html` and `client/client.js`.

### Table


The package `reactive-table` is used to show paginate data with sorting and data filtering. `client/client.js` contains a sample with settings for reactive-table to show the use of templates, function, cell editing in a modal form.

### Forms

`autoform` is used to create two forms : one for 'insert' and a modular and modal bootstrap 'update" form.

Form fields are defined with `collection2` in `model.js`. You will find some sample code for various fields : textarea,  array with select or checkbox, mandatory and hidden fields.

### Various

You will find some samples to use text translation for various languages with `anti:i18n` in templates, helpers or model. Moreover the use of `moment-with-langs` allows to write dates and time in local language. 

`showdown` allows to use Markdown in templates or write a full page as in appInfo.

# Deployment

There is a lot of documentation to deploy a Meteor app with nginx or apache config, scripts to package and deploy, `forever` config for nodejs app but I don't find any sample to deploy a Meteor application on Debian with a minimal setting.

You will find in `server/debian-start.sh` a simple `start-stop-daemon` with logs send in `/var/log/messages`. Feel free to custom this script with deploy or forever commands.

Meteor applications will be stored in `/var/www/$NAME`, configs in `/etc/meteor/`.

On client side
```
meteor bundle myappsimple.tar.gz

scp myappsimple.tar.gz root@myappserver:/var/www/myappsimple
scp server/debian-start.sh root@myappserver:/etc/init.d/myappsimple
scp server/Meteor.settings root@myappserver:/etc/meteor/Meteor.myappsimple.settings
```

On server side
```
cd /var/www/myappsimple

tar zxvf myappsimple.tar.gz

vi /etc/init.d/myappsimple
# fix ROOT_URL, METEOR_URL, ...

/etc/init.d/myappsimple start

update-rc.d myappsimple defaults
```


# AUTHORS

Yves Agostini, `<yvesago@cpan.org>`

# LICENSE AND COPYRIGHT

License : MIT

Copyright 2015 - Yves Agostini


