
const User = require('../modals/user');
const Post = require('../modals/post');
const mongoose = require('mongoose');

exports.createPost = (req, res, next) => {
    let newPost = {};
    if(req.body.title){
        newPost['title'] = req.body.title;
    }
    if(req.body.content){
        newPost['content'] = req.body.content;
    }
    if(req.body.caption){
        newPost['caption'] = req.body.caption;
    }
    if(req.file){
        newPost['imageUrl'] = req.file.path
    }

    let currentPost;
    User.findById(req.userId).then(user => {
        newPost['postedBy'] = user;
        const post = new Post(newPost);
        return post.save();
    })
    .then(post => {
        if(post){
            currentPost = post;
            return User.findById(post.postedBy);
        }
    })
    .then(user => {
        const updatedPosts = [...user.posts];
        updatedPosts.push(new mongoose.Types.ObjectId(currentPost._id));
        user.posts = updatedPosts;
        return user.save();
    })
    .then(user => {
        res.status(201).json({message: 'Post saved successfully', post: currentPost});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);  
    })  
}

exports.getFeed = (req, res, next) => {
    let allPosts = [];
    let currentUser;
    User.findById(req.userId).then(user => {
        if(user){
            currentUser = user;
            return Post.find().populate('postedBy').exec();
        }
    }) 
    .then(posts => {
        if(posts){
            let isLiked, isSaved;
            allPosts = posts.map(post => {
                isLiked = post.likesInfo.likedBy.includes(currentUser._id);
                isSaved = post.savedBy.includes(currentUser._id);
                return{
                    ...post._doc,
                    isLiked: isLiked,
                    isSaved: isSaved
                }
            })
            res.status(200).json({message: 'Posts fetched successfully', posts: allPosts})
        }   
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.savePost = (req, res, next) => {
    const postId = req.body.postId;
    console.log('Post id in controllers', postId);
    if(!postId){
        const error = new Error('Post id is incorrect.');
        throw error;
    }

    Post.findById(postId).then(post => {
        const updatedSavedBy = [...post.savedBy];
        updatedSavedBy.push(new mongoose.Types.ObjectId(req.userId));
        post.savedBy = updatedSavedBy;
        return post.save();
    })
    .then(post => {
        if(post){
            res.status(200).json({message: 'Post saved successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.removeSavedPost = (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.userId;

    Post.findById(postId).then(post => {
        if(post){
            const updatedSavedBy = post.savedBy.filter(user => user._id != userId);
            post.savedBy = updatedSavedBy;
            return post.save();
        }
    })
    .then(post => {
        if(post){
            res.status(201).json({message: 'Post removed successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.likePost = (req, res, next) => {
    console.log('Reached here');
    const postId = req.body.postId;
    let userName;
    if(!postId){
        const error = new Error('Post id is incorrect.');
        throw error;
    }

    User.findById(req.userId).then(user => {
        if(user){
            userName = user.username;
            return Post.findById(postId);
        }
    })
    .then(post => {
        if(post){
            const updatedLikedBy = [...post.likesInfo.likedBy];
            const updatedCount = post.likesInfo.count + 1;
            updatedLikedBy.push(new mongoose.Types.ObjectId(req.userId));
            post.likesInfo = {
                count: updatedCount,
                likedBy: updatedLikedBy
            };
            return post.save();
        }
    })
    .then(post => {
        if(post){
            return User.findById(post.postedBy);
        }
    })
    .then(user => {
        if(user && user._id != req.userId){
            user.notifications.count += 1;
            const updatedNotification = user.notifications.messageInfo.push({
                message: userName + ' liked your post.'
            });
        }
        return user.save();
    })
    .then(user => {
        if(user){
            res.status(200).json({message: 'Post liked successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.unlikePost = (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.userId;

    Post.findById(postId)
    .then(post => {
        if(post){
            const updatedLikedBy = post.likesInfo.likedBy.filter(user => user._id != userId);
            const updatedCount = post.likesInfo.count - 1;
            post.likesInfo = {
                count: updatedCount,
                likedBy: updatedLikedBy
            };
            return post.save();
        }
    })
    .then(post => {
        if(post){
            res.status(201).json({message: 'Post unliked successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.getSavedPosts = (req, res, next) => {
    const userId = req.userId;
    if(!userId){
        const error = new Error('User id invalid.');
        throw error;
    }
    let savedPosts;
    let currentUser;
             
    Post.find().populate('postedBy').exec().then(posts => {
        if(posts){
            let isLiked;
            savedPosts = posts.reduce((acc, post) => {
                if( post.savedBy.includes(userId) ){
                    isLiked = post.likesInfo.likedBy.includes(userId);
                    acc.push({
                        ...post._doc,
                        isLiked: isLiked,
                        isSaved: true
                    })
                }
                return acc;
            }, []);
        }
        res.status(200).json({message: 'Saved posts fetched successfully', posts: savedPosts});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.getNotifications = (req, res, next) => {
    const userId = req.userId;
    if(!userId){
        const error = new Error('User id invalid.');
        throw error;
    }

    User.findById(userId).then(user => {
        if(user){
            user.notifications.count = 0;
            return user.save();
        }
    })
    .then(user => {
        if(user){
            res.status(200).json({message: 'Notifications fetched successfully.', notifications: user.notifications.messageInfo});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.deleteNotification = (req, res, next) => {
    const userId = req.userId;
    const messageId = req.body.messageId;
    if(!userId){
        const error = new Error('User id invalid.');
        throw error;
    }

    User.findById(userId).then(user => {
        if(user){
            const updatedMessageInfo = user.notifications.messageInfo.filter(message => message._id != messageId);
            user.notifications.count = 0;
            user.notifications.messageInfo = updatedMessageInfo;
            return user.save();
        }
    })
    .then(user => {
        if(user){
            res.status(200).json({message: 'Notification deleted successfully.'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.body.postId;
    Post.findByIdAndDelete(postId)
    .then(result => {
        res.status(200).json({message: 'Post deleted successfully.'});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);  
    })
}

// exports.createTextPost = (req, res, next) => {
//     let title = '';
//     if(req.body.title){
//         title = req.body.title;
//     }
//     const content = req.body.content;
//     const userId = req.userId;
//     User.findById(userId).then(user => {
//         if(user){
//             const post = new TextPost({
//                 title: title,
//                 content: content,
//                 postedBy: user
//             });
//             return post.save();
//         }
//         const error = new Error('User not found.');
//         next(error);
//     })
//     .then(post => {
//         if(post){
//             res.status(201).json({message: 'Post saved successfully', post: post});
//         }
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.setStatus = 500;    
//         next(error);    
//     })
// }

// exports.createImagePost = (req, res, next) => {
//     const image = req.file;
    
//     if(!image){
//         const error = new Error('Image not found.');
//         throw error;
//     }
//     const caption = req.body.caption;
//     User.findById(req.body.userId).then(user => {
//         if(user){
//             const post = new ImagePost({
//                 caption: caption,
//                 imageUrl: image.path,
//                 postedBy: user
//             })
//             return post.save();
//         }
//     })
//     .then(post => {
//         res.status(201).json({message: 'Post saved successfully', post: post});
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.setStatus = 500;    
//         next(error); 
//     })
// }

// exports.getFeed = (req, res, next) => {
//     let posts = [];
//     TextPost.find()
//         .populate('postedBy')
//         .exec()
//         .then(textPosts => {
//             posts = [...textPosts];
//             // console.log('TextPosts', textPosts);
//             return ImagePost.find().populate('postedBy').exec();
//         })
//         .then(imagePosts => {
//             // console.log('ImagePosts ', imagePosts);
//             posts = posts.concat(imagePosts);
//             res.status(200).json({message: 'Posts fetched successfully', posts: posts})
//         })
//         .catch(err => {
//             const error = new Error(err);
//             error.setStatus = 500;    
//             next(error);
//         })
// };

// exports.postSaveImagePost = (req, res, next) => {
//     const postId = req.body.postId;
//     console.log('Post id in controllers', postId);
//     if(!postId){
//         const error = new Error('Post id is incorrect.');
//         throw error;
//     }
//     User.findById(req.userId).then(user => {
//         if(user){
//             const updatedSavedImagePosts = [...user.savedImagePosts];
//             updatedSavedImagePosts.push(new mongoose.Types.ObjectId(postId));
//             user.savedImagePosts = updatedSavedImagePosts;
//             return user.save();
//         }
//     })
//     .then(user => {
//         if(user){
//             res.status(201).json({message: 'Post saved successfully'});
//         }
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.setStatus = 500;    
//         next(error);
//     })
// };

// exports.postSaveTextPost = (req, res, next) => {
//     const postId = req.body.postId;
//     if(!postId){
//         const error = new Error('Post id is incorrect.');
//         throw error;
//     }
//     User.findById(req.userId).then(user => {
//         if(user){
//             const updatedSavedTextPosts = [...user.savedTextPosts];
//             updatedSavedTextPosts.push(new mongoose.Types.ObjectId(postId));
//             user.savedTextPosts = updatedSavedTextPosts;
//             return user.save();
//         }
//     })
//     .then(user => {
//         if(user){
//             res.status(201).json({message: 'Post saved successfully'});
//         }
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.setStatus = 500;    
//         next(error);
//     })
// };

// exports.removeSavedImagePost = (req, res, next) => {
//     const postId = req.body.postId;
//     const userId = req.userId;
//     User.findById(userId).then(user => {
//         if(user){
//             const updatedSavedImagePosts = user.savedImagePosts.filter(post => post._id != postId);
//             user.savedImagePosts = updatedSavedImagePosts;
//             return user.save();
//         }
//     })
//     .then(user => {
//         if(user){
//             res.status(201).json({message: 'Post removed successfully'});
//         }
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.setStatus = 500;    
//         next(error);
//     })
// }

// exports.removeSavedTextPost = (req, res, next) => {
//     const postId = req.body.postId;
//     const userId = req.userId;
//     User.findById(userId).then(user => {
//         if(user){
//             const updatedSavedTextPosts = user.savedTextPosts.filter(post => post._id != postId);
//             user.savedTextPosts = updatedSavedTextPosts;
//             return user.save();
//         }
//     })
//     .then(user => {
//         if(user){
//             res.status(201).json({message: 'Post removed successfully'});
//         }
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.setStatus = 500;    
//         next(error);
//     })
// }