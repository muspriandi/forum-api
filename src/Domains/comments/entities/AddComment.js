class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { thread_id, content } = payload;

    this.thread_id = thread_id;
    this.content = content;
  }

  _verifyPayload({ thread_id, content }) {
    if (!thread_id || !content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof thread_id !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
