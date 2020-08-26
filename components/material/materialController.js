const MaterialModel = require('./materialModel');
const Grid = require("gridfs-stream");
const mongoose = require('mongoose');
const mongoDBUrl = process.env.MONGODB_URI || "mongodb://localhost/sicenik";

const conn = mongoose.createConnection(mongoDBUrl);
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("GFS Connected");
});

exports.uploadImageOnly = async (req, res, next) => {
    try {
        res.status(200).send("OK");
    } catch (err) {
        next(err);
    }
}

exports.createMaterial = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error("Can't");
        }
        let created = await MaterialModel.create(req.body);
        res.status(200).send(created);
    } catch (err) {
        next(err);
    }
}

exports.fetchAllMaterials = async (req, res, next) => {
    try {
        let fetched = await MaterialModel.find({}).exec();
        res.status(200).send(fetched);
    } catch (err) {
        next(err);
    }
}

exports.getFile = async (req, res, next) => {
    try {
        let fetched = await gfs.files.findOne({ filename: req.params.filename });
        if (!fetched || fetched.length === 0) {
            res.status(404).send("No File");
        }

        const readStream = gfs.createReadStream(fetched.filename);
        readStream.pipe(res);
    } catch (err) {
        next(err);
    }
}