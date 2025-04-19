const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetThreadDetailUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadDetail = [
      {
        thread_id: 'thread-123',
        title: 'Judul Thread',
        body: 'Isi Thread',
        thread_created_at: '2021-08-08T07:19:09.775Z',
        thread_username: 'dicoding',
        comment_id: 'comment-123',
        comment_username: 'johndoe',
        comment_created_at: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        comment_deleted_at: null,
      },
      {
        thread_id: 'thread-123',
        title: 'Judul Thread',
        body: 'Isi Thread',
        thread_created_at: '2021-08-08T07:19:09.775Z',
        thread_username: 'dicoding',
        comment_id: 'comment-456',
        comment_username: 'janedoe',
        comment_created_at: '2021-08-08T07:25:00.000Z',
        content: 'komentar yang sudah dihapus',
        comment_deleted_at: '2021-08-09T07:25:00.000Z',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadDetailById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual({
      id: 'thread-123',
      title: 'Judul Thread',
      body: 'Isi Thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-456',
          username: 'janedoe',
          date: '2021-08-08T07:25:00.000Z',
          content: '**komentar telah dihapus**',
        },
      ],
    });

    expect(mockThreadRepository.getThreadDetailById).toBeCalledWith(threadId);
  });
});
