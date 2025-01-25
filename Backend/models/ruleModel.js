const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
    raw: {
        type: String,
        required: true,
    },
    sid: {
        type: String,
        required: true,
        unique: true,
    },
    msg: {
        type: String,
        required: true,
    },
    classtype: {
        type: String,
        default: 'unknown',
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
