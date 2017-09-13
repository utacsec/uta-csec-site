/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {
    User: [
        { 'name.first': 'CSEC', 'name.last': 'Admin', 'email': 'root@utacsec.org', 'password': 'toor', 'isAdmin': true, },
    ],
};

/*

// This is the long-hand version of the functionality above:

var keystone = require('keystone'),
	async = require('async'),
	User = keystone.list('User');

var admins = [
	{ email: 'root@utacsec.org', password: 'toor', name: { first: 'CSEC', last: 'Admin', }, }
];

function createAdmin(admin, done) {
	User.model.findOne({ email: admin.email }).exec(function(err, user) {
		admin.isAdmin = true;
		new User.model(admin).save(function(err) {
			if (err) {
				console.error("Error adding admin " + admin.email + " to the database:");
				console.error(err);
			} else {
				console.log("Added admin " + admin.email + " to the database.");
			}
			done();
		});
	});
}

exports = module.exports = function(done) {
	async.forEach(admins, createAdmin, done);
};

*/
