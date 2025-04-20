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
      comment_id: 'comment-123',
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
      .mockResolvedValue(true);
    mockCommentRepository.findActiveCommentByIdAndUser = jest.fn()
      .mockResolvedValue(mockCommentData);
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockResolvedValue();

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(userId, useCasePayload);

    // Assert
    expect(mockThreadRepository.existThread).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.findActiveCommentByIdAndUser)
      .toBeCalledWith(userId, useCasePayload.comment_id);
    expect(mockCommentRepository.deleteCommentById)
      .toBeCalledWith(useCasePayload.comment_id);
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
      .mockResolvedValue(true);
    mockCommentRepository.findActiveCommentByIdAndUser = jest.fn()
      .mockImplementation(() => {
        throw new NotFoundError('comment tidak tersedia');
      });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
      .rejects
      .toThrowError(NotFoundError);
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      thread_id: 'thread-not-exist',
      comment_id: 'comment-123',
    };
  
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
  
    mockThreadRepository.existThread = jest.fn()
      .mockImplementation(() => {
        throw new NotFoundError('thread tidak tersedia');
      });
  
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
      .mockResolvedValue(true);
    mockCommentRepository.findActiveCommentByIdAndUser = jest.fn()
      .mockImplementation(() => {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      });

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
