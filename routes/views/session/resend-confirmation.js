exports = module.exports = function (req, res) {
    if (!req.user) {
        return res.redirect('/');
    } else {
        if (req.user.isVerified) {
            req.flash('success', 'Your email address has already been confirmed');
            
            return res.redirect('/me');
        } else {
            req.user.confirmEmail(function (err) {
                if (err) {
                    console.error('===== ERROR sending confirmation email =====');
                    console.error(err);

                    req.flash('error', 'Error sending confirmation email. Please <a href="mailto:uta.cesc@gmail.com" class="alert-link">let&nbsp;us&nbsp;know</a> about this error');
                    return res.redirect('/me');
                } else {
                    req.flash('success', 'We have emailed you a link to confirm your email');
                    
                    return res.redirect('/me');
                }
            });
        }
    }
};
