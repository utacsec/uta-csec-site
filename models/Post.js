const async = require('async');
const keystone = require('keystone');
const Email = require('keystone-email');
const Types = keystone.Field.Types;

/**
 * Posts Model
 * ===========
 */

const Post = new keystone.List('Post', {
	map: { name: 'title', },
	track: true,
	autokey: { path: 'slug', from: 'title', unique: true, },
});

Post.add({
	title: { type: String, required: true, },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true, },
	author: { type: Types.Relationship, ref: 'User', index: true, },
	publishedDate: { type: Types.Date, index: true, },
	image: { type: Types.CloudinaryImage, },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150, },
		extended: { type: Types.Html, wysiwyg: true, height: 400, },
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true, },
});


/**
 * Virtuals
 * ========
 */

Post.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});


/**
 * Relationships
 * =============
 */

Post.relationship({ ref: 'PostComment', refPath: 'post', path: 'comments' });


/**
 * Notifications
 * =============
 */

Post.schema.methods.notifyAdmins = function (callback) {
	const post = this;
	// Method to send the notification email after data has been loaded
	// const sendEmail = function (err, results) {
    post.save(function (err, results) {
		if (err) return callback(err);
		
		async.each(results.admins, function (admin, done) {
			new Email('templates/emails/admin-notification-new-post.pug', { transport: 'mailgun', }).send({
				admin: admin.name.first || admin.name.full,
                author: results.author ? results.author.name.full : 'Somebody',
                title: post.title,
                host: 'https://www.utacsec.org',
                link: '/keystone/post/' + post.id,
			}, {
				to: admin.email,
				from: { name: 'UTA CSEC', email: 'notify@utacsec.org', },
				subject: 'New Post to UTA CSEC',
			}, done);
		}, callback);
	});
	// Query data in parallel
	async.parallel({
		author: function (next) {
			if (!post.author) return next();
			keystone.list('User').model.findById(post.author).exec(next);
		},
		admins: function (next) {
			keystone.list('User').model.find().where('isAdmin', true).exec(next)
		},
	}, sendEmail);
};


/**
 * Registration
 * ============
 */

Post.defaultSort = '-publishedDate';
Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();