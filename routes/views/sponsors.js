const keystone = require('keystone');
const Sponsor = keystone.list('Sponsor');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'sponsors';
	
	view.query('sponsors', Sponsor.model.find().sort('name'), 'sponsors');
	
	view.render('site/sponsors');
};
