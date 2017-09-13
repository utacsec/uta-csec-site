const keystone = require('keystone');
const moment = require('moment');
const Meetup = keystone.list('Meetup');
const RSVP = keystone.list('RSVP');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'meetups';
	locals.page.title = 'Meetups - UTA CSEC';
	locals.rsvpStatus = {};
	
	// Load the Meetup
	view.on('init', function (next) {
		Meetup.model.findOne()
			.where('key', req.params.meetup)
			.exec(function (err, meetup) {
				if (err) return res.err(err);
				
				if (!meetup) return res.notfound('Post not found');
				
				locals.meetup = meetup;
				locals.meetup.populateRelated('talks[who] rsvps[who]', next);
		});
	});
	// Load an RSVP
	view.on('init', function (next) {
		if (!req.user || !locals.meetup) return next();
		
		RSVP.model.findOne()
			.where('who', req.user._id)
			.where('meetup', locals.meetup)
			.exec(function (err, rsvp) {
				locals.rsvpStatus = { rsvped: !!rsvp, attending: !!(rsvp && rsvp.attending), };
					
				return next();
		});
	});
	
	view.render('site/meetup');
};
