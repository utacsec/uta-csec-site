utacsec.org - The CSEC Website
==============================

## Getting Started

To run the CSEC site locally, there are a few things to set up.

Because we have some private keys for our MongoDB, Cloudinary and Mandrill accounts, you'll need to set up your own equivalents before the site will run properly.

_If you're looking to work on the CSEC site and want access to our accounts, please get in touch_

### Install Node.js and MongoDB

You'll need node 4.8.x and npm 2.14.x installed to run CSEC. The easiest way is to download the installers from [nodejs.org](http://nodejs.org).

You'll also need MongoDB 2.4.x - if you're on a Mac, the easiest way is to install [homebrew](http://brew.sh) and then run `brew install mongo`.

If you're on a Mac you'll also need Xcode and the Command Line Tools installed or the build process won't work.

### Setting up your copy of the CSEC Website

Get a local copy of the site by cloning this repository, or fork it to work on your own copy.

Then run `npm install` to download the dependencies.

Before you continue, create a file called `.env` in the root folder of the project (this will be ignored by git). This file is used to emulate the environment config of our production server, in development. Any `key=value` settings you put in there (one on each line) will be set as environment variables in `process.env`.

The only line you **need** to add to your `.env` file is a valid `CLOUDINARY_URL`. To get one of these, sign up for a free account at [Cloudinary](http://cloudinary.com) and paste the environment variable if gives you into your `.env` file. It should look something like this:

	CLOUDINARY_URL=cloudinary://12345:abcde@cloudname

### Running the CSEC Website

Once you've set up your configuration, run `node webapp` to start the server.

By default, the web application will connect to a new local MongoDB database on your localhost called `uta-csec`, and create a new Admin user that you can use to log in with using the email address `root@utacsec.org` and the password `toor`.

If you want to run against a different server or database, add a line to your `.env` file to set the `MONGO_URI` environment variable, and restart the site.

When it's all up and running, you should see the message `CSEC is ready on port 8000` and you'll be able to browse the site on [localhost:8000](http://localhost:8000).

### Facebook login
Add `FACEBOOK_API=X.x` in your .env file.
For Facebook API >= 2.4 you must specify the fields you want to get in user profile.

### Here be ~~dragons~~ errors

#### or, how you don't have any content yet

The first time you run the site, the homepage will warn you that it expects there to be at least one meetup, and your database won't have any. Don't freak out, just go to the admin portal, sign in as the admin user, and create one.

You'll probably want to add some other content too (blog post, members, etc) to get all the pages looking right.

... happy hacking!
