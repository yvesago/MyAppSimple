# MyAppSimple

This is a sample Meteor application to play with mixing authentication, TinyTest, settings, models, hooks and forms.

This application is a form to store user requests in a table and admins manage the request with a simple workflow where admins can set an unordered 'status' field or some private fields.

The field `status` is shared between admins and users.

## Quick start

Install Meteor in debian wheezy with backports (07/2014)

```
$ apt-get install nodejs mongodb-server
$ ln -s /usr/bin/nodejs /usr/bin/node
$ curl https://www.npmjs.org/install.sh | sh

# install Meteor
$ curl https://install.meteor.com/ | sh
# install meteorite package manager
$ npm install -g meteorite


```


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
ROOT_URL="http://myappserver.univ.org:3000" mrt --production --settings server/Meteor.settings
```

`router.js` is used to request authentication.

## Tests

Even most of Meteor and Meteor packages use **TinyTest**, there's a real lack of documentation on Meteor testing. 

In `tests/` directory you will find a simple `tests.js` with some tests to validate data access by roles.

```
cd tests
mrt test-packages ./  --settings Meteor.settings.test
```

You will watch results on <http://localhost:3000>

_It seems that the use of meteorite does not allow to mix `packages.js` and links in `packages/`_

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

You will find some samples to use text translation for various languages with `just-i18n` in templates, helpers or model. Moreover the use of `moment-with-langs` allows to write dates and time in local language. 

`showdown` allows to use Markdown in templates or write a full page as in appInfo.



# AUTHORS

Yves Agostini, `<yvesago@cpan.org>`

# LICENSE AND COPYRIGHT

License : MIT

Copyright 2014 - Yves Agostini 


