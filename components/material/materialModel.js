const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
    materialName: {
        type: String,
        required: true,
    },
    materialType: {
        type: String,
        required: true,
    },
    nameOfContents: {
        type: [String],
        required: true,
    },
    audioContents: {
        type: [String],
        required: true,
    },
    imageContents: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const MaterialModel = mongoose.model('materials', MaterialSchema);

module.exports = MaterialModel;