
Package.describe({
  summary: "Tiny testing framework",
  internal: true
});

Package.on_test(function (api) {
     var both = ['server','client'];

api.use([
    "collection-hooks",
    "underscore",
    "accounts-base",
    "accounts-password",
    'simple-schema',
    'iron-router',
    'roles',
    "tinytest",
    'autoform',
    'just-i18n',
    'collection2',
    "test-helpers"
  ], both);


  api.add_files('../model.js',both);
  api.add_files('../router.js');
  api.add_files('insecure_login.js',both);
  api.add_files('../server/publish.js','server');
  api.add_files('tests.js',both);
});


