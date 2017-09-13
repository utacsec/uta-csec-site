const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'members';
	
	view.query('members',
        User.model.find().sort('name')
			.where('isPublic', true)
			.populate('sponsor')
			.where('mentoring.available', true)
			.where('isVerified', true),
        'posts talks[meetup]'
    );
	
	view.render('site/mentors');
};
