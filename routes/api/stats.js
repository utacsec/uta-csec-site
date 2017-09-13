const async = require('async');
const moment = require('moment');
const keystone = require('keystone');
const Meetup = keystone.list('Meetup');
const RSVP = keystone.list('RSVP');
const User = keystone.list('User');
const Post = keystone.list('Post');

exports = module.exports = function (req, res) {
	const stats = {};
	
	async.parallel([
		function (next) {
			Meetup.model.findOne()
				.where('startDate').gte(moment().startOf('day').toDate())
				.where('state', 'published')
				.sort('startDate')
				.exec(function (err, meetup) {
					RSVP.model.count({ meetup: meetup, attending: true, }).exec(function (err, count) {
						stats.rsvps = count;
						
						return next();
					});
			});
		},
		function (next) {
			User.model.count().exec(function (err, count) {
				stats.members = count;
				
				return next();
			});
		},
		function (next) {
			Post.model.count().exec(function (err, count) {
				stats.posts = count;
				
				return next();
			});
		}
	], function () {
		return res.apiResponse(stats);
	});
};
