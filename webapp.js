// Load the babel-register plugin for the graphql directory
// Note this checks the regex against an absoloute path
require('babel-register')({ only: /\/graphql\/.*/ });

// Load .env config for development environments
require('dotenv').config({ silent: true, });

// Initialise New Relic if an app name and license key exists
if (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) require('newrelic');

/**
 * Application Initialisation
 */

const keystone = require('keystone');
const pkg = require('./package.json');

keystone.init({
	'name': 'UTA CSEC',
	'brand': 'UTA CSEC',
	'back': '/me',

	'favicon': 'public/favicon.ico',
	'less': 'public',
	'static': 'public',

	'views': 'templates/views',
	'view engine': 'pug',
	'view cache': false,

	'emails': 'templates/emails',

	'auto update': true,
	'mongo': process.env.MONGO_URI || 'mongodb://localhost/' + pkg.name,

	'session': true,
	'session store': 'mongo',
	'auth': true,
	'user model': 'User',
	'cookie secret': process.env.COOKIE_SECRET || 'utacsec',

	'mailgun api key': process.env.MAILGUN_API_KEY,
	'mailgun domain': process.env.MAILGUN_DOMAIN,
	// 'mandrill api key': process.env.MANDRILL_KEY,

	'google api key': process.env.GOOGLE_API_KEY,
	// 'google server api key': process.env.GOOGLE_SERVER_KEY,

	'ga property': process.env.GA_PROPERTY,
	'ga domain': process.env.GA_DOMAIN,

	'cloudinary secure': true,

	'basedir': __dirname,
	
	'port': process.env.PORT,
	'ssl port': process.env.SSL_PORT,
	'ssl': 'force',
	
	'greenlock': (process.env.NODE_ENV === 'production') && {
		'email': 'uta.csec@gmail.com',
		'domains': [ 'www.utacsec.org', 'utacesc.org', ],
		'register': true,
		'tos': true,
	},
});

keystone.import('models');

keystone.set('routes', require('./routes'));

keystone.set('locals', {
	_: require('lodash'),
	moment: require('moment'),
	js: 'javascript:;',
	env: keystone.get('env'),
	utils: keystone.utils,
	plural: keystone.utils.plural,
	editable: keystone.content.editable,
	google_api_key: keystone.get('google api key'),
	ga_property: keystone.get('ga property'),
	ga_domain: keystone.get('ga domain'),
});

keystone.set('email locals', {
	utils: keystone.utils,
	host: (function () {
		if (keystone.get('env') === 'staging') return 'https://uta-csec.herokuapp.com';
		if (keystone.get('env') === 'production') return 'https://www.utacsec.org';
		return (keystone.get('host') || 'http://localhost:') + (keystone.get('port') || '8000');
	})(),
});

keystone.set('nav', {
    'meetups': ['meetups', 'talks', 'rsvps'],
    'members': ['users', 'sponsors'],
    'posts': ['posts', 'post-categories', 'post-comments'],
    'links': ['links', 'link-tags', 'link-comments'],
});

keystone.start();
