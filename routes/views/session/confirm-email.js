const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = function (req, res) {
    const view = new keystone.View(req, res);
    
    view.on('init', function (next) {
        User.model.findOne()
            .where('confirmEmailKey', req.params.key)
            .exec(function (err, user) {
                if (err) return next(err);
                
                if (!user) {
                    req.flash('error', 'Sorry, that confirmation link isn\'t valid.');
                    
                    return res.redirect('/');
                }
                
                user.isVerified = true;
                user.confirmEmailKey = '';
                user.save(function (err) {
                    if (err) return next(err);
                    
                    req.flash('success', 'Your email has been confirmed.');
                    res.redirect('/signin');
                });
        });
    });
    
    view.render('session/confirm-email');
};
