class DeleteComment {
    constructor(payload) {
      this._verifyPayload(payload);
  
      const { thread_id, comment_id } = payload;
  
      this.thread_id = thread_id;
      this.comment_id = comment_id;
    }
  
    _verifyPayload({ thread_id, comment_id }) {
      if (!thread_id || !comment_id) {
        throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
      }
  
      if (typeof thread_id !== 'string' || typeof comment_id !== 'string') {
        throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
    }
  }
  
  module.exports = DeleteComment;
  