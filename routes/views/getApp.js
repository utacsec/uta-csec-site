const keystone = require('keystone');

exports = module.exports = function(req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'getApp';
	locals.page.title = 'UTA CSEC App';

	view.render('site/getApp');
};
