'use strict';
const mongoose = require( 'mongoose' );
const { stringify } = require('querystring');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;

var courseSchema = Schema( {
    Name: String,
    Platform: String,
    Year_of_Release: Number,
    Genre: String,
    Publisher: String,
    Critic_Score: Number,
    Developer: String,
    Rating: String

} );

module.exports = mongoose.model( 'Course', courseSchema );
