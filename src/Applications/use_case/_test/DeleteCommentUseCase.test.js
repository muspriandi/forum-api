const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

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
        owner: userId,
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

  it('should throw error when comment is not found or already deleted', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.existThread = jest.fn().mockResolvedValue(true);
    mockCommentRepository.findActiveCommentByIdAndUser = jest.fn()
      .mockImplementation(() => {
        throw new Error('comment tidak tersedia');
      });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
      .rejects.toThrowError('comment tidak tersedia');

    // Verify the mock calls
    expect(mockThreadRepository.existThread).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.findActiveCommentByIdAndUser)
      .toBeCalledWith(userId, useCasePayload.comment_id);
  });

  it('should throw error when user is not the owner of the comment', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      thread_id: 'thread-123',
      comment_id: 'comment-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.existThread = jest.fn().mockResolvedValue(true);
    mockCommentRepository.findActiveCommentByIdAndUser = jest.fn()
      .mockImplementation(() => {
        throw new Error('Anda tidak berhak mengakses resource ini');
      });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteCommentUseCase.execute(userId, useCasePayload))
      .rejects.toThrowError('Anda tidak berhak mengakses resource ini');

    // Verify the mock calls
    expect(mockThreadRepository.existThread).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.findActiveCommentByIdAndUser)
      .toBeCalledWith(userId, useCasePayload.comment_id);
  });

  it('should throw error when payload is missing required properties', async () => {
    // Arrange
    const userId = 'user-123';
    const invalidPayload = {
      thread_id: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(userId, invalidPayload))
      .rejects.toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
