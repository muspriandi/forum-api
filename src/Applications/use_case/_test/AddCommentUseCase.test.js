const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      thread_id: 'thread-123',
      content: 'content',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: userId,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.existThread = jest.fn()
      .mockResolvedValue(true);
    mockCommentRepository.addComment = jest.fn()
      .mockResolvedValue(mockAddedComment);

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(userId, useCasePayload);

    // Assert
    expect(mockThreadRepository.existThread).toBeCalledWith(useCasePayload.thread_id);
    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(userId, new AddComment({
      thread_id: 'thread-123',
      content: 'content',
    }));
  });

  it('should throw error when payload is missing required property', async () => {
    // Arrange
    const userId = 'user-123';
    const invalidPayload = {
      content: 'content',
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: new CommentRepository(),
      threadRepository: new ThreadRepository(),
    });

    await expect(addCommentUseCase.execute(userId, invalidPayload))
      .rejects
      .toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload data type is incorrect', async () => {
    const userId = 'user-123';
    const invalidPayload = {
      thread_id: 123,
      content: 'content',
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: new CommentRepository(),
      threadRepository: new ThreadRepository(),
    });

    await expect(addCommentUseCase.execute(userId, invalidPayload))
      .rejects
      .toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
