const socket = require('socket.io');
const MatchModel = require('./matchModel');
const QuestionModel = require('../question/questionModel');
const maxParticipants = 5;
let participantCounter = 0;
let participantSocketId = [];
let participantNames = [];
let currentMatchId = '';

module.exports = (server) => {
    const io = socket(server);
    io.on('connection', (socket) => {
        console.log('A client is connected.');

        socket.emit('connected', { message: "Hello Client" });

        socket.on('requestMatch', async (data) => {
            console.log(`${data.username} is requesting a match...`);
            // starts logic of matchmaking
            participantCounter++;
            participantSocketId.push(socket.id);
            participantNames.push(data.username)

            // assess first request of a match
            if (participantCounter === 1) {
                let created = await MatchModel.create({
                    participantSocketId: participantSocketId,
                    participantNames: participantNames
                });
                currentMatchId = created._id;

                socket.join(currentMatchId);
            } else {
                // update created match
                await MatchModel.updateOne({ _id: currentMatchId }, {
                    $set: {
                        participantSocketId: participantSocketId,
                        participantNames: participantNames
                    }
                });

                socket.join(currentMatchId);
            }
            socket.emit('hasJoined', { joinIndex: participantCounter - 1 });
            io.sockets.in(currentMatchId).emit('matchUpdated', { participants: participantNames });

            // if counter reach max, reset trackers
            if (participantCounter === maxParticipants) {
                io.sockets.in(currentMatchId).emit('matchReady', {
                    participants: participantNames,
                    matchId: currentMatchId,
                    quizzes: await getQuizzes()
                });

                currentMatchId = '';
                participantCounter = 0;
                participantSocketId = [];
                participantNames = [];
            }
        });

        socket.on('submitAnswer', async (data) => {
            // submit answer logic 
            let currentMatch = await MatchModel.findOne({ _id: data.matchId });
            currentMatch.participantScores[data.participantIndex] += data.isAnswerCorrect ? getScores(currentMatch.pointTracker) : 0;

            if (currentMatch.pointTracker === 4) {
                console.log(currentMatch.participantScores);
                io.sockets.in(data.matchId).emit('oneQuestionFinished', { participantScores: currentMatch.participantScores });
                currentMatch.pointTracker = 0;
            } else {
                currentMatch.pointTracker++;
            }

            await MatchModel.updateOne({ _id: currentMatch._id }, {
                $set: {
                    participantScores: currentMatch.participantScores,
                    pointTracker: currentMatch.pointTracker
                }
            });
        });
    });
}

const getQuizzes = async () => {
    try {
        let response = await QuestionModel.aggregate().sample(10).exec();
        return response;
    } catch (error) {
        console.error(error);
    }
}

const getScores = (position) => {
    return 12 - 2 * position;
}