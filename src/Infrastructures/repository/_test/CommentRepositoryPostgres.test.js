const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const addComment = new AddComment({
        thread_id: 'thread_id',
        content: 'content',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(userId, addComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const addComment = new AddComment({
        thread_id: 'thread_id',
        content: 'content',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(userId, addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'content',
        owner: 'user-123',
      }));
    });
  });

  describe('findActiveCommentByIdAndUser function', () => {
    it('should return data when comment is available and owned by user', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act
      const result = await commentRepositoryPostgres.findActiveCommentByIdAndUser('user-123', 'comment-123');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual({
        id: 'comment-123',
        owner: 'user-123',
        content: 'dicoding',
        thread_id: 'thread-123',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      });
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        commentRepositoryPostgres.findActiveCommentByIdAndUser('user-123', 'comment-not-exist')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-abc' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(
        commentRepositoryPostgres.findActiveCommentByIdAndUser('user-xyz', 'comment-123')
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete when comment is found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const result = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(result[0].deleted_at).not.toBeNull();
    });

    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });
  });
});
