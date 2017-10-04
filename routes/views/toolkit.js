const keystone = require('keystone');

exports = module.exports = function(req, res) {
    const view = new keystone.View(req, res);
    const locals = res.locals;

    locals.section = 'tools';
    locals.page.title = 'UTA CSEC Toolkit';

    view.render('site/toolkit');
};
