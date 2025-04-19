const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment_id',
    };
    const mockCommentData = [
      {
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'content',
        owner: 'user-123',
      }
    ];

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.existThread = jest.fn()
    .mockImplementation(() => Promise.resolve());
    mockCommentRepository.findActiveCommentById = jest.fn()
    .mockImplementation(() => Promise.resolve(mockCommentData));
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(useCasePayload.comment_id));

    /** creating use case instance */
    const getCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const deleteComment = await getCommentUseCase.execute(userId, useCasePayload);

    // Assert
    expect(mockThreadRepository.existThread).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.findActiveCommentById).toBeCalledWith(useCasePayload.comment_id);
  });

  it('should throw NotFoundError when comment is not found', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-xyz',
    };
  
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
  
    mockThreadRepository.existThread = jest.fn()
      .mockResolvedValue();
    mockCommentRepository.findActiveCommentById = jest.fn()
      .mockResolvedValue([]); // comment not found
  
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
  
    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
      .rejects
      .toThrowError(NotFoundError);
  });

  it('should throw AuthorizationError when user is not the owner of the comment', async () => {
    // Arrange
    const userId = 'user-unauthorized';
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };
  
    const mockCommentData = [
      {
        id: 'comment-123',
        thread_id: 'thread-123',
        content: 'content',
        owner: 'user-123', // different owner
      }
    ];
  
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
  
    mockThreadRepository.existThread = jest.fn()
      .mockResolvedValue();
    mockCommentRepository.findActiveCommentById = jest.fn()
      .mockResolvedValue(mockCommentData);
  
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
  
    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
      .rejects
      .toThrowError(AuthorizationError);
  });  
});
