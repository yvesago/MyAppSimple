/*if (Meteor.isClient) {
Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});
};*/

Accounts.config({
      forbidClientAccountCreation: true
});

////////////////////////
// Set lang for i18n and date time moment library

i18n.setLanguage(Meteor.settings.public.lang);
moment.lang(Meteor.settings.public.lang);
i18n.showMissing('[no translation for "<%= label %>" in <%= language %>]');
