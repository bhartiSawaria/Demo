
const { validationResult, Result } = require('express-validator/check');

const User = require('../modals/user');
const Post = require('../modals/post');

exports.getProfile = async (req, res, next) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        res.status(200).json({message: 'User info fetched successfully.', user: user});
    }catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        return next(error);
    }
}

// exports.deleteAccount = (req, res, next) => {
//         const userId = req.userId;
//         let currentUser;
//         User.findById(userId).then(user => {
//             currentUser = user;
//             return Post.find();
//         })
//         .then(posts => {
//             const updatedPosts = posts.map(post => {
//                 let index = post.likesInfo.likedBy.findIndex(id => id == userId);
//                 if(index >= 0 ){
//                     post.likesInfo.likedBy.splice(index, index+1);
//                 }
//                 index = post.savedBy.findIndex(id => id == userId);
//                 if(index >= 0){
//                     post.savedBy.splice(index, index+1);
//                 }
//                 return post;
//             });
//             console.log('updatedposts', updatedPosts);
//             posts = updatedPosts;
//             return posts.save();
//         })
//         .then(posts => {
//             return Post.deleteMany({_id: {$in: currentUser.posts}})
//         })
//         .then(res => {
//             return User.deleteOne({_id: userId});
//         })
//         .then(res => {
//             res.status(200).json({message: 'Account deleted successfully'});
//         })
//         .catch(err => {
//             const error = new Error(err);
//             error.setStatus = 500;    
//             next(error);
//         })
// }


exports.postEditAccount = (req, res, next) => {
        const errors = validationResult(req);
        if( !errors.isEmpty() ){
            const err = new Error('Editing failed!');
            err.data = errors.array(); 
            console.log('Error occured in postEditAccount', errors);
            throw err;
        }
        const userId = req.userId;
        User.findById(userId).then(user => {
            user.name = req.body.name;
            user.username = req.body.username;
            user.email = req.body.email;
            return user.save();
        })
        .then(user => {
            res.status(200).json({message: 'Account info updated successfully.', user: user});
        })
        .catch(err => {
            const error = new Error(err);
            error.setStatus = err.status || 500;    
            next(error);
        })
}

exports.getPosts = async(req, res, next) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        const posts = await Post.find({_id: {$in: user.posts}}).populate('postedBy')
        let isLiked, isSaved;
        const updatedPosts = posts.map(post => {
            isLiked = post.likesInfo.likedBy.includes(userId);
            isSaved = post.savedBy.includes(userId);
            return{
                ...post._doc,
                isLiked: isLiked,
                isSaved: isSaved
            }
        });
        res.status(200).json({message: 'Posts fetched successfully', posts: updatedPosts})

    }catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        return next(error);
    }
};

exports.getUsers = async(req, res, next) => {
    try{
        const users = await User.find({_id: {$ne: req.userId}});
        res.status(200).json({message: 'Users successfully fetched from database.', users: users});
    }catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        return next(error); 
    }
}

exports.changeProfilePic = (req, res, next) => {
    console.log('Reached');
    const userId = req.userId;
    const image = req.file;
    let imageUrl;
    if(image){
        imageUrl = image.path;
    }
    else{
        imageUrl = req.body.imageUrl;
    }

    User.findById(userId)
    .then(user => {
        if(user){
            user.imageUrl = imageUrl;
            return user.save();
        }
    })
    .then(user => {
        res.status(200).json({message: 'Profile pic updated successfully', user: user});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        return next(error); 
    })
}