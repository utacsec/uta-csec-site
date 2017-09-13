const keystone = require('keystone');

exports = module.exports = function(req, res) {
    const view = new keystone.View(req, res);
    const locals = res.locals;

    locals.section = 'portal';
    locals.page.title = 'Members Portal';

    // Members only
    if (!req.user || req.user && !req.user.isMember) {
        return res.redirect('/');
    }

    view.render('site/portal');
};
