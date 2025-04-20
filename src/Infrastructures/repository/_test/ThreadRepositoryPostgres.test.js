const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const addThread = new AddThread({
        title: 'title',
        body: 'body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(userId, addThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const addThread = new AddThread({
        title: 'title',
        body: 'body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(userId, addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'title',
        owner: 'user-123',
      }));
    });
  });

  describe('existThread function', () => {
    it('should return true when thread available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.existThread('thread-123')).resolves.toEqual(true);
    });

    it('should throw NotFoundError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.existThread('thread-456')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getThreadDetailById', () => {
    it('should return thread and comments correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' }); // ← Needed for thread
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'johndoe' });  // ← Needed for comment

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Judul Thread',
        body: 'Isi Thread',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'Komentar pertama',
        owner: 'user-124',
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Act
      const result = await threadRepository.getThreadDetailById('thread-123');

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toMatchObject({
        thread_id: 'thread-123',
        title: 'Judul Thread',
        body: 'Isi Thread',
        thread_username: 'dicoding',
        comment_id: 'comment-123',
        content: 'Komentar pertama',
        comment_username: 'johndoe',
      });
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(threadRepository.getThreadDetailById('non-existent-thread'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
