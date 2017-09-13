const keystone = require('keystone');
const moment = require('moment');
const RSVP = keystone.list('RSVP');
const Meetup = keystone.list('Meetup');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'meetups';
	locals.page.title = 'Meetups - UTA CSEC';
	
	view.query('upcomingMeetup', Meetup.model.findOne().where('state', 'active').sort('-startDate'), 'talks[who]');
	view.query('pastMeetups', Meetup.model.find().where('state', 'past').sort('-startDate'), 'talks[who]');
	
	view.on('render', function (next) {
		if (!req.user || !locals.upcomingMeetup) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('meetup', locals.upcomingMeetup)
			.exec(function (err, rsvp) {
				locals.rsvpStatus = { rsvped: !!rsvp, attending: !!(rsvp && rsvp.attending), };
				
				return next();
        });
	});
	
	view.render('site/meetups');
};
