const keystone = require('keystone');
const Link = keystone.list('Link');
const LinkComment = keystone.list('LinkComment');
const sanitizer = require('sanitize-html');

exports = module.exports = function(req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'links';
	locals.filters = { link: req.params.link, };
	
	view.on('init', function(next) {
		Link.model.findOne()
			.where('state', 'published')
			.where('slug', locals.filters.link)
			.populate('author categories')
			.exec(function(err, link) {
				if (err) return res.err(err);
				
				if (!link) return res.notfound('Link not found');
				
				locals.link = link;
				locals.link.populateRelated('comments[author]', next);
		});
	});
	
    view.on('post', {action: 'create-comment'}, function (next) {
        // Handle form
        const newLinkComment = new LinkComment.model({link: locals.link.id, author: locals.user.id,});
        const updater = newLinkComment.getUpdateHandler(req, res, {
            errorMessage: 'There was an error creating your comment:',
        });
        const comment = sanitizer(req.body.content, {
            allowedTags: [ 'b', 'i', 'em', 'strong', 'a', ],
            allowedAttributes: { 'a': [ 'href', ], },
        });
        const commentTrim = req.body.content.replace(/\s/g, '');
        
        if (req.user.isVerified) {
            if (comment.length && commentTrim.length) {
                updater.process(req.body, {
                    flashErrors: true,
                    logErrors: true,
                    fields: 'content',
                }, function (err) {
                    if (err) {
                        locals.validationErrors = err.errors;
                    } else {
                        req.flash('success', 'Your comment has been added successfully.');

                        return res.redirect('/links/link/' + locals.link.slug);
                    }
                    
                    next();
                });
            } else {
                if (req.body.content.length && commentTrim.length) {
                    req.flash('error', 'Either you entered a disallowed symbol or you were being shady...not cool, bro!');
                } else {
                    req.flash('error', 'You cannot post a blank comment.');
                }
                
                return res.redirect('/links/link/' + locals.link.slug);
            }
        } else {
            req.flash('error', 'You cannot comment until you confirm your email address.');
            
            return res.redirect('/links/link/' + locals.link.slug);
        }
    });
    
	view.render('site/link');
};
