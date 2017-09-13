const keystone = require('keystone');
const Link = keystone.list('Link');

exports = module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'me';
	locals.page.title = 'Add a link - UTA CSEC';
	
	view.on('post', { action: 'add-link' }, function (next) {
		// Handle form
		const newLink = new Link.model({
            author: locals.user.id,
            publishedDate: new Date(),
        });
		const updater = newLink.getUpdateHandler(req, res, {
            errorMessage: 'There was an error adding your link:',
        });
		
		// Automatically publish posts by admin users
		if (locals.user.isAdmin) {
			newLink.state = 'published';
		}
		
		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'href, label, description',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				req.flash('success', 'Your link has been added' + ((newLink.state === 'draft') ? ' and will appear on the site once it\'s been approved' : '') + '.');
				
				return res.redirect('/links');
			}

			next();
		});
	});
	
	view.render('site/createLink');
};
