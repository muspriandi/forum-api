const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      thread_id: 'thread-123',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      thread_id: 123,
      content: 'abc',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    // Arrange
    const payload = {
      thread_id: 'dicoding',
      content: 'abc',
    };

    // Action
    const { thread_id, content } = new AddComment(payload);

    // Assert
    expect(thread_id).toEqual(payload.thread_id);
    expect(content).toEqual(payload.content);
  });
});
