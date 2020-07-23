
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    caption: {
        type: String
    },
    title: {
        type: String
    },
    imageUrl: {
        type: String
    },
    content: {
        type: String
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likesInfo: {
        count: {
            type: Number,
            default: 0
        },
        likedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    savedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true } );

module.exports = mongoose.model('Post', postSchema);