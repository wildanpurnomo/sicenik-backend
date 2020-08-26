const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const socketHandler = require('./components/match/socketHandler');
const materialRouter = require('./components/material/materialRouter');
const questionRouter = require('./components/question/questionRouter');
const mongoDBUrl = process.env.MONGODB_URI || "mongodb://localhost/sicenik";

// connect to DB
mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useUnifiedTopology: true }, (err) => {
    if (err) {
        throw err;
    } else {
        console.log("Connected to MongoDB");
    }
});

mongoose.Promise = global.Promise;

// iki opo mboh
app.set('trust proxy', true);

// use bodyparser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use cors middleware
app.use(cors());

// assign routers
app.use('/api', materialRouter);
app.use('/api', questionRouter);

// error handling middleware
app.use((err, req, res, next) => {
    res
        .status(422)
        .send({
            error: `Error: ${err.message}`,
        });
});

// listen to port
let server = app.listen(process.env.PORT || 4000, () => {
    console.log('Serving...');
});

socketHandler(server);