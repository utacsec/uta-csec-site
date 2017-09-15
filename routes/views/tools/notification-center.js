const keystone = require('keystone');
// const async = require('async');
const Email = require('keystone-email');
const Meetup = keystone.list('Meetup');
const User = keystone.list('User');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'tools';
	locals.nextMeetup = false;

	// Keep it secret, keep it safe
	if (!req.user || req.user && !req.user.isAdmin) {
		console.warn('===== ALERT =====');
		console.warn('===== A non-admin attempted to access the Notification Center =====');

		return res.redirect('/errors/404');
	}

	// Get all subscribers
	view.query('subscribers', User.model.find().where('notifications.meetups', true));
    
	// Get the next meetup
	view.on('init', function (next) {
		Meetup.model.findOne()
            .where('state', 'active')
            .sort('-startDate')
            .exec(function (err, meetup) {
                if (err) {
                    console.error('===== Error loading next meetup =====');
                    console.error(err);
    
                    return next();
                } else if (!meetup) {
                    req.flash('warning', 'There isn\'t a \"next\" meetup at the moment');
    
                    return next();
                } else {
                    locals.nextMeetup = meetup;
                    next();
                }
        });
	});

    // Notify next meetup attendees
    view.on('post', { action: 'notify.attendee' }, function (next) {
        if (!locals.nextMeetup) {
            req.flash('warning', 'There isn\'t a \"next\" meetup at the moment');

            return next();
        } else {
            locals.nextMeetup.notifyAttendees(req, res, function (err) {
                if (err) {
                    req.flash('error', 'There was an error sending the notifications, please check the logs for more info.');

                    console.error('===== Failed to send meetup notification emails =====');
                    console.error(err);
                } else {
                    // req.flash('success', 'Notification sent to ' + keystone.utils.plural(locals.nextMeetup.rsvps.length, '* attendee'));
                    req.flash('success', 'Notification sent to all attendees');
                }
            });
            next();
        }
    });
	
	// Notify all UTA CSEC subscribers
	view.on('post', { action: 'notify.subscriber' }, function (next) {
        keystone.list('User').model.find()
            .where('notifications.meetups', true)
            .exec(function (err, subscribers) {
                if (!subscribers.length) {
                    next();
                } else {
                    subscribers.forEach(function (subscriber) {
                        new Email('templates/emails/member-notification.pug', { transport: 'mailgun', }).send({
                            subscriber: subscriber,
                            content: req.body.subscriber_email_content,
                            host: 'https://www.utacsec.org',
                            link_label: req.body.subscriber_email_link_label,
                            link_url: req.body.subscriber_email_link_url,
                        },  {
                            to: subscriber.email,
                            from: { name: 'UTA CSEC', email: 'notify@utacsec.org', },
                            subject: req.body.subscriber_email_subject || 'Meeting Notification from UTA CSEC',
                        });
                    }, function (err) {
                        if (err) {
                            req.flash('error', 'There was an error sending the emails, please check the logs for more info.');
    
                            console.error('===== Failed to send subscriber emails =====');
                            console.error(err);
                            
                            return next(err);
                        } else {
                            req.flash('success', 'Notification sent to all subscribers');
                        }
                    });
                    next();
                }
        });
	});
	
	// Populate the RSVPs for counting
	view.on('render', function (next) {
		if (locals.nextMeetup) {
			locals.nextMeetup.populateRelated('rsvps', next);
		} else {
			next();
		}
	});
	
	view.render('tools/notification-center');
};
