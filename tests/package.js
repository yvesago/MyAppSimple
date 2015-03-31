
Package.describe({
  summary: "Tiny testing framework",
  internal: true
});

Package.on_test(function (api) {
     var both = ['server','client'];

api.use([
    "matb33:collection-hooks",
    "underscore",
    "accounts-base",
    "accounts-password",
    'aldeed:simple-schema',
    'iron:router',
    'alanning:roles@1.2.13',
    "tinytest",
    'aldeed:autoform',
    'mrt:just-i18n',
    'aldeed:collection2',
    "test-helpers"
  ], both);


  api.add_files('../model.js',both);
  api.add_files('../router.js');
  api.add_files('insecure_login.js',both);
  api.add_files('../server/publish.js','server');
  api.add_files('tests.js',both);
});


