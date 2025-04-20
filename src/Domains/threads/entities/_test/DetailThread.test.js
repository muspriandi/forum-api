const DetailThread = require('../DetailThread');

describe('a DetailThread entity', () => {

  it('should map comments correctly including deleted comment', () => {
    // Arrange
    const rows = [
      {
        thread_id: 'thread-123',
        title: 'Sample Thread',
        body: 'This is a body',
        thread_created_at: '2021-08-08',
        thread_username: 'user1',
        comment_id: 'comment-1',
        content: 'Nice thread!',
        comment_created_at: '2021-08-09',
        comment_deleted_at: null,
        comment_username: 'user2',
      },
      {
        thread_id: 'thread-123',
        title: 'Sample Thread',
        body: 'This is a body',
        thread_created_at: '2021-08-08',
        thread_username: 'user1',
        comment_id: 'comment-2',
        content: 'I disagree',
        comment_created_at: '2021-08-10',
        comment_deleted_at: '2021-08-11',
        comment_username: 'user3',
      },
    ];

    // Action
    const thread = new DetailThread(rows);

    // Assert
    expect(thread.comments).toHaveLength(2);
    expect(thread.comments[0]).toEqual({
      id: 'comment-1',
      username: 'user2',
      date: '2021-08-09',
      content: 'Nice thread!',
    });
    expect(thread.comments[1]).toEqual({
      id: 'comment-2',
      username: 'user3',
      date: '2021-08-10',
      content: '**komentar telah dihapus**',
    });
  });


  it('should create DetailThread object correctly without comments', () => {
    // Arrange
    const rows = [{
      thread_id: 'thread-123',
      title: 'Sample Thread',
      body: 'This is a body',
      thread_created_at: '2021-08-08',
      thread_username: 'user1',
      comment_id: null,
    }];

    // Action
    const thread = new DetailThread(rows);

    // Assert
    expect(thread.id).toEqual('thread-123');
    expect(thread.title).toEqual('Sample Thread');
    expect(thread.body).toEqual('This is a body');
    expect(thread.date).toEqual('2021-08-08');
    expect(thread.username).toEqual('user1');
    expect(thread.comments).toEqual([]);
  });

  it('should throw error when input is not an array or is empty', () => {
    // Arrange
    const invalidInputs = [null, undefined, {}, [], 'string'];

    // Action and Assert
    for (const input of invalidInputs) {
      expect(() => new DetailThread(input)).toThrowError('DETAIL_THREAD.INVALID_INPUT');
    }
  });

  it('should throw error when a needed property is missing in thread data', () => {
    // Arrange
    const rows = [{
      thread_id: null,
      title: 'title',
      body: 'body',
      thread_created_at: '2021-08-08',
      thread_username: 'user1',
    }];

    // Action and Assert
    expect(() => new DetailThread(rows)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
