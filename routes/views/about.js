const keystone = require('keystone');

exports = module.exports = function (req, res) {
    const view = new keystone.View(req, res);
    const locals = res.locals;
    
    locals.section = 'about';
    locals.page.title = 'About UTA CSEC';
    locals.officers = [
        { name: 'John Podolanko', image: '/images/officers/john-round.png', title: 'President', profile: '/member/john-podolanko', },
        { name: 'Zehra Jafri', image: '/images/officers/zehra-round.png', title: 'Vice President', profile: '/member/zehra-jafri', },
        { name: 'Cam Nguyen', image: '/images/officers/cam-round.png', title: 'Treasurer', profile: '/member/cam-nguyen', },
        { name: 'Mitchell Shelton', image: '/images/officers/mitchell-round.png', title: 'Secretary', profile: '/member/mitchell-shelton', },
        { name: 'Andrew Collyer', image: '/images/officers/andrew-round.png', title: 'Web Master', profile: '/member/andrew-collyer', },
        { name: 'Jiang Ming', image: '/images/officers/jiang-round.png', title: 'Faculty Advisor', profile: '/member/jiang-ming', },
    ];

    view.render('site/about');
};
