const express = require('express');
const router = express.Router();
const controller = require('./materialController');
const multer = require('multer');
const GridfsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

const maxFiles = 20;
let trackerFile = 0;
let audios = [];
let images = [];

const mongoDBUrl = process.env.MONGODB_URI || "mongodb://localhost/sicenik";
const imgOnlyGridFs = new GridfsStorage({
    url: mongoDBUrl,
    file: (req, file) => {
        return {
            filename: file.originalname.replace(" ", "-").toLowerCase(),
            bucketName: 'uploads'
        }
    }
});

const storage = new GridfsStorage({
    url: mongoDBUrl,
    file: (req, file) => {
        console.log(file);
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }

                if (Object.keys(req.body).length === 0) {
                    console.log('Missing');
                    return reject(new Error('Missing'));
                }

                const filetype = path.extname(file.originalname).toLowerCase();
                const fileName = buf.toString('hex') + filetype;
                const fileInfo = {
                    filename: fileName,
                    bucketName: 'uploads'
                }

                if (filetype === '.m4a') {
                    audios.push(fileName);
                } else if (filetype === '.jpg' || filetype === '.jpeg' || filetype === '.png') {
                    images.push(fileName);
                }

                if (trackerFile === req.files.audio.length - 1) {
                    req.body.audioContents = audios;
                    req.body.imageContents = images;
                }

                trackerFile++;
                resolve(fileInfo);
            })
        })
    }
});

const upload = multer({ storage });
const uploadImgOnly = multer({ storage: imgOnlyGridFs });

router.post('/material', upload.fields([
    {
        name: 'audio',
        maxCount: maxFiles
    },
    {
        name: 'img',
        maxCount: maxFiles
    }
]), controller.createMaterial);

router.post('/material/image', uploadImgOnly.fields([{
    name: 'img',
    maxCount: 25
}]), controller.uploadImageOnly);

router.get('/material', controller.fetchAllMaterials);

router.get('/material/upload/:filename', controller.getFile);

module.exports = router;