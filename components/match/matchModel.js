const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
    participantSocketId: {
        type: [String],
        required: true
    },
    participantNames: {
        type: [String],
        required: true
    },
    questions: {
        type: [String],
        default: []
    },
    options: {
        type: [String],
        default: []
    },
    participantScores: {
        type: [Number],
        default: [0, 0, 0, 0, 0],
    },
    correctAnswer: {
        type: String,
        default: ''
    },
    pointTracker: {
        type: Number,
        default: 0
    } 
});

const MatchModel = mongoose.model('match', MatchSchema);

module.exports = MatchModel;