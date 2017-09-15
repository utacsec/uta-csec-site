const React = require('react');
const ReactDOM = require('react-dom');

/** Attendees */

const AttendingApp = require('../components/AttendingApp.js');
const attendingAppTarget = document.getElementById('react-attending');

if (attendingAppTarget) ReactDOM.render(<AttendingApp />, attendingAppTarget);

/** Hero (RSVP Button) */

const HeroApp = require('../components/HeroApp.js');
const heroAppTarget = document.getElementById('react-hero-button');

if (heroAppTarget) ReactDOM.render(<HeroApp />, heroAppTarget);
