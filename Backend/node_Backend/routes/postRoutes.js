// in routes/postRoutes.js

const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
  deleteComment,
  adminDeletePost,
  adminDeleteComment,
} = require('../controllers/postController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth(['Student', 'Alumni', 'Admin']));

router.route('/').get(getAllPosts).post(createPost);
router.route('/like/:id').put(likePost);
router.route('/comment/:id').post(addComment);

router.delete('/:id', auth(['Student', 'Alumni', 'Admin']), deletePost);
router.delete('/:postId/comment/:commentId', auth(['Student', 'Alumni', 'Admin']), deleteComment);

// ✅ NEW: Admin-Only Routes
router.delete('/admin/:id', auth(['Admin']), adminDeletePost);
router.delete('/admin/:postId/comment/:commentId', auth(['Admin']), adminDeleteComment);
module.exports = router;