const QuestionModel = require('./questionModel');

exports.createQuestion = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('Cant');
        }

        let created = await QuestionModel.create(req.body.qaArray);
        res.status(200).send(created);
    } catch (error) {
        next(error);
    }
}

exports.fetchAllQuestions = async (req, res, next) => {
    try {
        let fetched = await QuestionModel.find({}).exec();
        res.status(200).send(fetched);
    } catch (error) {
        next(error);
    }
}