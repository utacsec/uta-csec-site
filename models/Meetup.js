const _ = require('lodash');
const keystone = require('keystone');
const moment = require('moment');
const Email = require('keystone-email');
const Types = keystone.Field.Types;

/**
 * Meetups Model
 * =============
 */

const Meetup = new keystone.List('Meetup', {
	track: true,
	autokey: { path: 'key', from: 'name', unique: true, },
});

Meetup.add({
	name: { type: String, required: true, initial: true, },
	publishedDate: { type: Types.Date, index: true, },
	state: { type: Types.Select, options: 'draft, scheduled, active, past', noedit: true, },
	startDate: { type: Types.Datetime, required: true, initial: true, index: true, width: 'short', note: 'e.g. 2014-07-15 / 6:00pm', },
	endDate: { type: Types.Datetime, required: true, initial: true, index: true, width: 'short', note: 'e.g. 2014-07-15 / 9:00pm', },
	place: { type: String, required: false, initial: true, width: 'medium', default: 'ERB 228 (CSE@UTA)', note: 'ERB 228 (CSE@UTA)', },
	map: { type: String, required: false, initial: true, width: 'medium', default: '500 UTA Blvd, Arlington, TX 76018', note: '500 UTA Blvd, Arlington, TX 76018', },
	description: { type: Types.Html, wysiwyg: true, },
	maxRSVPs: { type: Number, default: 50, },
	totalRSVPs: { type: Number, noedit: true, },
	legacy: { type: Boolean, noedit: true, collapse: true, },
});


/**
 * Relationships
 * =============
 */

Meetup.relationship({ ref: 'Talk', refPath: 'meetup', path: 'talks', });
Meetup.relationship({ ref: 'RSVP', refPath: 'meetup', path: 'rsvps', });


/**
 * Virtuals
 * ========
 */

Meetup.schema.virtual('url').get(function () {
	return '/meetups/' + this.key;
});

Meetup.schema.virtual('remainingRSVPs').get(function () {
	if (!this.maxRSVPs) return -1;
	
	return Math.max(this.maxRSVPs - (this.totalRSVPs || 0), 0);
});

Meetup.schema.virtual('rsvpsAvailable').get(function () {
	return (this.remainingRSVPs > 0);
});


/**
 * Pre-save
 * ========
 */

Meetup.schema.pre('save', function (next) {
	const meetup = this;
	
	// no published date, it's a draft meetup
	if (!meetup.publishedDate) {
		meetup.state = 'draft';
	}
	// meetup date plus one day is after today, it's a past meetup
	else if (moment().isAfter(moment(meetup.startDate).add(1, 'day'))) {
		meetup.state = 'past';
	}
	// publish date is after today, it's an active meetup
	else if (moment().isAfter(meetup.publishedDate)) {
		meetup.state = 'active';
	}
	// publish date is before today, it's a scheduled meetup
	else if (moment().isBefore(moment(meetup.publishedDate))) {
		meetup.state = 'scheduled';
	}
	next();
});


/**
 * Methods
 * =======
 */

Meetup.schema.methods.refreshRSVPs = function (callback) {
	const meetup = this;
	keystone.list('RSVP').model.count()
		.where('meetup').in([meetup.id])
		.where('attending', true)
		.exec(function (err, count) {
			if (err) return callback(err);
			
			meetup.totalRSVPs = count;
			meetup.save(callback);
    });
};

Meetup.schema.methods.notifyAttendees = function (req, res, next) {
    keystone.list('User').model.find()
		.where('notifications.meetups', true)
		.exec(function (err, attendees) {
			if (err) return next(err);
	
			if (!attendees.length) {
				next();
			} else {
				attendees.forEach(function (attendee) {
					new Email('templates/emails/member-notification.pug', { transport: 'mailgun', }).send({
						subscriber: attendee,
						content: req.body.attendee_email_content,
						host: 'https://www.utacsec.org',
						link_label: req.body.attendee_email_link_label,
						link_url: req.body.attendee_email_link_url,
					}, {
						to: attendee.email,
						from: { name: 'UTA CSEC', email: 'notify@utacsec.org', },
						subject: req.body.attendee_email_subject || 'Meeting Notification from UTA CSEC',
					}, next);
				});
			}
    });
};

Meetup.schema.set('toJSON', {
	transform: function (doc) {
		return _.pick(doc, '_id', 'name', 'startDate', 'endDate', 'place', 'map', 'description', 'rsvpsAvailable', 'remainingRSVPs');
	},
});


/**
 * Registration
 * ============
 */

Meetup.defaultSort = '-startDate';
Meetup.defaultColumns = 'name, state|10%, startDate|15%, publishedDate|15%';
Meetup.register();
