const keystone = require('keystone');
const _ = require('lodash');
const User = keystone.list('User');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'members';
	locals.page.title = 'Members - UTA CSEC';

	// Load Officers
	view.on('init', function (next) {
		User.model.find()
			.sort('name.first')
			.where('isPublic', true)
			.where('isOfficer', true)
            .where('isVerified', true)
			.exec(function (err, officers) {
				if (err) res.err(err);
				
				locals.officers = officers;
				next();
		});
	});
	// Load Speakers
	view.on('init', function (next) {
		User.model.find()
			.sort('-talkCount name.first')
			.where('isPublic', true)
			.where('talkCount').gt(0)
            .where('isVerified', true)
			.exec(function (err, speakers) {
				if (err) res.err(err);
				
				locals.speakers = speakers;
				next();
		});
	});
	// Pluck IDs for filtering Community
	view.on('init', function (next) {
        locals.officerIDs = _.map(locals.officers, 'id');
        locals.speakerIDs = _.map(locals.speakers, 'id');
		next();
	});
	// Load Community
	view.on('init', function (next) {
		User.model.find()
			.sort('-lastRSVP')
			.where('isPublic', true)
			.where('isVerified', true)
			.where('_id').nin(locals.officerIDs)
			.where('_id').nin(locals.speakerIDs)
			.exec(function (err, community) {
				if (err) res.err(err);
				
				locals.community = community;
				next();
		});
	});

	view.render('site/members');
};
