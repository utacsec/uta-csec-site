const keystone = require('keystone');
const Post = keystone.list('Post');
const PostComment = keystone.list('PostComment');
const sanitizer = require('sanitize-html');

exports = module.exports = function(req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'news';
	locals.filters = { post: req.params.post, };

	view.on('init', function(next) {
		Post.model.findOne()
			.where('slug', locals.filters.post)
			.populate('author categories')
			.exec(function(err, post) {
				if (err) return res.err(err);
				
				if (!post) return res.notfound('Post not found');

				// Allow admins or the author to see draft posts
				if (post.state === 'published' || (req.user && req.user.isAdmin) || (req.user && post.author && (req.user.id === post.author.id))) {
					locals.post = post;
					locals.post.populateRelated('comments[author]', next);
					locals.page.title = post.title + ' - News - UTA CSEC';
				} else {
					return res.notfound('Post not found');
				}
		});
	});
	// Load recent posts
	view.query('data.posts',
		Post.model.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author')
			.limit('4')
	);
	view.on('post', { action: 'create-comment' }, function(next) {
		// Handle form
		const newPostComment = new PostComment.model({ post: locals.post.id, author: locals.user.id, });
        const updater = newPostComment.getUpdateHandler(req, res, {
            errorMessage: 'There was an error creating your comment:',
        });
        const comment = sanitizer(req.body.content, {
            allowedTags: [ 'b', 'i', 'em', 'strong', 'a', ],
            allowedAttributes: { 'a': [ 'href', ], },
        });

		if (req.user.isVerified) {
			if (comment.length) {
                updater.process(req.body, {
                    flashErrors: true,
                    logErrors: true,
                    fields: 'content',
                }, function (err) {
                    if (err) {
                        locals.validationErrors = err.errors;
                    } else {
                        req.flash('success', 'Your comment has been added successfully.');

                        return res.redirect('/news/post/' + locals.post.slug);
                    }

                    next();
                });
            } else {
			    if (req.body.content.length) {
			        req.flash('error', 'Either you entered a disallowed symbol or you were being shady...not cool, bro!');
                } else {
                    req.flash('error', 'You cannot post a blank comment.');
                }
                
			    return res.redirect('/news/post/' + locals.post.slug);
            }
        } else {
			req.flash('error', 'You cannot comment until you confirm your registration.');
			
			return res.redirect('/news/post/' + locals.post.slug);
		}
	});

	view.render('site/post');
};
