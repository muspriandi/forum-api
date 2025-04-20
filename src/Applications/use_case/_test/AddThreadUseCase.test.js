const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCasePayload = {
      title: 'thread-title',
      body: 'thread-body',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: userId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockResolvedValue(mockAddedThread);

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(userId, useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: userId,
    }));
    expect(mockThreadRepository.addThread).toBeCalledWith(userId, new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }));
  });

  it('should throw error if title is missing', async () => {
    const userId = 'user-123';
    const invalidPayload = {
      body: 'thread-body',
    };

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    await expect(addThreadUseCase.execute(userId, invalidPayload))
      .rejects
      .toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if body is missing', async () => {
    const userId = 'user-123';
    const invalidPayload = {
      title: 'thread-title',
    };

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    await expect(addThreadUseCase.execute(userId, invalidPayload))
      .rejects
      .toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if title or body is not a string', async () => {
    const userId = 'user-123';
    const invalidPayload = {
      title: 123,
      body: ['not', 'a', 'string'],
    };

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    await expect(addThreadUseCase.execute(userId, invalidPayload))
      .rejects
      .toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
  
  it('should throw error if title is longer than 100 characters', async () => {
    const userId = 'user-123';
    const invalidPayload = {
      title: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`,
      body: 'valid body',
    };

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: {} });

    await expect(addThreadUseCase.execute(userId, invalidPayload))
      .rejects
      .toThrowError('ADD_THREAD.title_LIMIT_CHAR');
  });
});
