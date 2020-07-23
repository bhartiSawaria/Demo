
const express = require('express');

const postControllers = require('../controllers/post');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.post('/add-post', isAuth, postControllers.createPost);

router.get('/feed', isAuth, postControllers.getFeed);

router.post('/save-post', isAuth, postControllers.savePost);

router.post('/remove-saved-post', isAuth, postControllers.removeSavedPost);

router.post('/like-post', isAuth, postControllers.likePost);

router.post('/unlike-post', isAuth, postControllers.unlikePost);

router.get('/saved-posts', isAuth, postControllers.getSavedPosts);

router.get('/notifications', isAuth, postControllers.getNotifications);

router.delete('/notification', isAuth, postControllers.deleteNotification);

router.delete('/delete-post', isAuth, postControllers.deletePost);

// router.post('/add-post/type1', isAuth, postControllers.createTextPost);

// router.post('/add-post/type2', isAuth, postControllers.createImagePost);

// router.post('/save-post/type1', isAuth, postControllers.postSaveTextPost);

// router.post('/save-post/type2', isAuth, postControllers.postSaveImagePost);

// router.delete('/remove-saved-post/type1', isAuth, postControllers.removeSavedTextPost);

// router.delete('/remove-saved-post/type2', isAuth, postControllers.removeSavedImagePost);

module.exports = router;