const async = require('async');
const crypto = require('crypto');
const keystone = require('keystone');
const Email = require('keystone-email');
const Types = keystone.Field.Types;

/**
 * Users Model
 * ===========
 */

const User = new keystone.List('User', {
	track: true,
	autokey: { path: 'key', from: 'name', unique: true, },
});

const deps = {
	mentoring: { 'mentoring.available': true, },
	github: { 'services.github.isConfigured': true, },
	facebook: { 'services.facebook.isConfigured': true, },
	google: { 'services.google.isConfigured': true, },
	twitter: { 'services.twitter.isConfigured': true, },
};

User.add({
	name: { type: Types.Name, required: true, index: true, },
	email: { type: Types.Email, initial: true, index: true, },
	password: { type: Types.Password, initial: true, },
	resetPasswordKey: { type: String, hidden: true, },
    confirmEmailKey: { type: String, hidden: true, },
}, 'Profile', {
	isPublic: { type: Boolean, default: true, },
	isOfficer: Boolean,
	isMember: Boolean,
	sponsor: { type: Types.Relationship, ref: 'Sponsor', },
	photo: { type: Types.CloudinaryImage, },
	github: { type: String, width: 'short', },
	twitter: { type: String, width: 'short', },
	website: { type: Types.Url, },
	bio: { type: Types.Markdown, },
	gravatar: { type: String, noedit: true, },
}, 'Notifications', {
	notifications: {
		posts: { type: Boolean, },
		meetups: { type: Boolean, default: true, },
	},
}, 'Mentoring', {
	mentoring: {
		available: { type: Boolean, label: 'Is Available', index: true, },
		free: { type: Boolean, label: 'For Free', dependsOn: deps.mentoring, },
		paid: { type: Boolean, label: 'For Payment', dependsOn: deps.mentoring, },
		swap: { type: Boolean, label: 'For Swap', dependsOn: deps.mentoring, },
		have: { type: String, label: 'Has...', dependsOn: deps.mentoring, },
		want: { type: String, label: 'Wants...', dependsOn: deps.mentoring, },
	},
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can Admin UTA CSEC', },
	isVerified: { type: Boolean, label: 'Has a verified email address', },
}, 'Services', {
	services: {
		github: {
			isConfigured: { type: Boolean, label: 'GitHub has been authenticated', },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.github, },
			username: { type: String, label: 'Username', dependsOn: deps.github, },
			avatar: { type: String, label: 'Image', dependsOn: deps.github, },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.github, },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.github, },
		},
		facebook: {
			isConfigured: { type: Boolean, label: 'Facebook has been authenticated', },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.facebook, },
			username: { type: String, label: 'Username', dependsOn: deps.facebook, },
			avatar: { type: String, label: 'Image', dependsOn: deps.facebook, },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.facebook, },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.facebook, },
		},
		google: {
			isConfigured: { type: Boolean, label: 'Google has been authenticated', },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.google, },
			username: { type: String, label: 'Username', dependsOn: deps.google, },
			avatar: { type: String, label: 'Image', dependsOn: deps.google, },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.google, },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.google, },
		},
		twitter: {
			isConfigured: { type: Boolean, label: 'Twitter has been authenticated', },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.twitter, },
			username: { type: String, label: 'Username', dependsOn: deps.twitter, },
			avatar: { type: String, label: 'Image', dependsOn: deps.twitter, },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.twitter, },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.twitter, },
		},
	},
}, 'Meta', {
	talkCount: { type: Number, default: 0, noedit: true, },
	lastRSVP: { type: Date, noedit: true, },
});


/**
	Pre-save
	=============
*/

User.schema.pre('save', function (next) {
	const member = this;
	
	async.parallel([
		function (done) {
			if (!member.email) return done();
			
			member.gravatar = crypto.createHash('md5').update(member.email.toLowerCase().trim()).digest('hex');
			
			return done();
		},
		function (done) {
			keystone.list('Talk').model.count({ who: member.id }).exec(function (err, count) {
				if (err) {
					
					console.error('===== Error counting user talks =====');
					console.error(err);
					
					return done();
				}
				member.talkCount = count;
				
				return done();
			});
		},
		function (done) {
			keystone.list('RSVP').model.findOne({ who: member.id }).sort('changedAt').exec(function (err, rsvp) {
				if (err) {
					console.error('===== Error setting user last RSVP date =====');
					console.error(err);
					
					return done();
				}
				
				if (!rsvp) return done();
				
				member.lastRSVP = rsvp.changedAt;
				
				return done();
			});
		},
	], next);
});


/**
	Relationships
	=============
*/

User.relationship({ ref: 'Post', refPath: 'author', path: 'posts', });
User.relationship({ ref: 'Talk', refPath: 'who', path: 'talks', });
User.relationship({ ref: 'RSVP', refPath: 'who', path: 'rsvps', });


/**
 * Virtuals
 * ========
 */

// Link to member
User.schema.virtual('url').get(function () {
	return '/member/' + this.key;
});

// Provide access to Admin Portal
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

// Pull out avatar image
User.schema.virtual('avatarUrl').get(function () {
	if (this.photo.exists) return this._.photo.thumbnail(120, 120);
	if (this.services.github.isConfigured && this.services.github.avatar) return this.services.github.avatar;
	if (this.services.facebook.isConfigured && this.services.facebook.avatar) return this.services.facebook.avatar;
	if (this.services.google.isConfigured && this.services.google.avatar) return this.services.google.avatar;
	if (this.services.twitter.isConfigured && this.services.twitter.avatar) return this.services.twitter.avatar;
	if (this.gravatar) return 'https://www.gravatar.com/avatar/' + this.gravatar + '?d=https%3A%2F%2Futacsec.org%2Fimages%2Favatar.png&r=pg';
});

// Usernames
User.schema.virtual('twitterUsername').get(function () {
	return (this.services.twitter && this.services.twitter.isConfigured) ? this.services.twitter.username : '';
});
User.schema.virtual('githubUsername').get(function () {
	return (this.services.github && this.services.github.isConfigured) ? this.services.github.username : '';
});


/**
 * Methods
 * =======
 */

User.schema.methods.resetPassword = function (callback) {
	const user = this;
	user.resetPasswordKey = keystone.utils.randomString([32, 40]);
	user.save(function (err) {
		if (err) return callback(err);

        new Email('templates/emails/forgotten-password.pug', { transport: 'mailgun', }).send({
            user: user,
            host: 'https://www.utacsec.org',
            link_url: '/reset-password/' + user.resetPasswordKey,
        }, {
            to: user.email,
            from: { name: 'UTA CSEC', email: 'recovery@utacsec.org', },
            subject: 'Reset your UTA CSEC password',
        }, callback);
	});
};

User.schema.methods.confirmEmail = function (callback) {
	const user = this;
	user.confirmEmailKey = keystone.utils.randomString([32, 40]);
	user.save(function (err) {
		if (err) return callback(err);
		
		new Email('templates/emails/confirm-registration.pug', { transport: 'mailgun', }).send({
            user: user,
            host: 'https://www.utacsec.org',
            link_url: '/confirm/' + user.confirmEmailKey,
        }, {
			to: user.email,
			from: { name: 'UTA CSEC', email: 'welcome@utacsec.org', },
			subject: 'Welcome to UTA CSEC - Please confirm your email address',
		}, callback);
	});
};


/**
 * Registration
 * ============
*/

User.defaultColumns = 'name, email, twitter, isAdmin';
User.register();
