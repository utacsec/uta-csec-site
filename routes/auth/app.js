const keystone = require('keystone');

exports = module.exports = function(req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.authUser = req.session.auth;
	view.render('auth/app');
};
