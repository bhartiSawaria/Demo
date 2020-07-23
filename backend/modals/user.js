const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    notifications: {
        count: {
            type: Number,
            default: 0
        },
        messageInfo: [{
            message:{
                type: String,
                required: true
            }
        }]
    }
});

module.exports = mongoose.model('User', userSchema);