const keystone = require('keystone');
const async = require('async');
const emailCheck = require('email-check');

exports = module.exports = function (req, res) {
	if (req.user) return res.redirect(req.cookies.target || '/me');
	
	const view = new keystone.View(req, res);
	const locals = res.locals;
	locals.section = 'session';
	locals.form = req.body;
	
	view.on('post', { action: 'join', }, function (next) {
		async.series([
			function (cb) {
				if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password || !req.body.confirmpass) {
					req.flash('error', 'Please enter a name, email and password.');

					return cb(true);
				}
				
				return cb();
			},
			function (cb) {
				keystone.list('User').model.findOne({ email: req.body.email, }, function (err, user) {
					if (err || user) {
						req.flash('error', 'User already exists with that email address.');

						return cb(true);
					}
					
					return cb();
				});
			},
            function (cb) {
                if (req.body.password !== req.body.confirmpass) {
                    req.flash('error', 'Your passwords do not match.');

                    return cb(true);
                }

                return cb();
            },
			function (cb) {
			    emailCheck(req.body.email)
                    .then(function (res) {
                        if (res) {
                            return cb();
                        } else {
                            req.flash('error', 'Please enter a valid email address.');
                            
                            return cb(true);
                        }
                    })
                    .catch(function (err) {
                        if (err.message === 'refuse') {
                            console.log('The MX server is refusing requests from your IP address.');
                        } else {
                            console.error(err);
                        }

                        return cb(true);
                    });
			},
			function (cb) {
				const userData = {
					name: { first: req.body.firstname, last: req.body.lastname, },
					email: req.body.email,
					password: req.body.password,
					website: req.body.website,
				};
				const User = keystone.list('User').model;
				const newUser = new User(userData);
				newUser.save(function (err) {
					return cb(err);
				});
				newUser.confirmEmail(function (err) {
				    if (err) {
				        console.error('===== ERROR sending confirmation email =====');
				        console.error(err);
				        
                        req.flash('error', 'Error sending confirmation email. Please <a href="mailto:uta.cesc@gmail.com" class="alert-link">let&nbsp;us&nbsp;know</a> about this error');
                        next();
                    } else {
                        req.flash('success', 'We have emailed you a link to confirm your email');
                    }
                });
			},
		], function (err){
			if (err) return next();
			
			const onSuccess = function () {
				if (req.body.target && !/join|signin/.test(req.body.target)) {
					console.log('[join] - Set target as [' + req.body.target + '].');
					
					res.redirect(req.body.target);
				} else {
					res.redirect('/me');
				}
			};
			const onFail = function () {
				req.flash('error', 'There was a problem signing you in, please try again.');
				
				return next();
			};
			
			keystone.session.signin({ email: req.body.email, password: req.body.password, }, req, res, onSuccess, onFail);
		});
	});
	
	view.render('session/join');
};
