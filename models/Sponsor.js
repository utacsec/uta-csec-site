const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Sponsors Model
 * ===================
 */

const Sponsor = new keystone.List('Sponsor', {
	track: true,
	autokey: { path: 'key', from: 'name', unique: true, },
});

Sponsor.add({
	name: { type: String, index: true, },
	logo: { type: Types.CloudinaryImage, },
	website: Types.Url,
	isHiring: Boolean,
	description: { type: Types.Markdown, },
	location: Types.Location,
});


/**
 * Relationships
 * =============
 */

Sponsor.relationship({ ref: 'User', refPath: 'sponsor', path: 'members', });


/**
 * Registration
 * ============
 */

Sponsor.defaultColumns = 'name, website, isHiring';
Sponsor.register();
