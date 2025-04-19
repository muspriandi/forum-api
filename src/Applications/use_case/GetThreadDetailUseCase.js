class GetThreadDetailUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    const details = await this._threadRepository.getThreadDetailById(threadId);
    const {
      thread_id,
      title,
      body,
      thread_created_at,
      thread_username,
    } = details[0];
  
    const comments = details
      .filter(row => row.comment_id)
      .map(row => ({
        id: row.comment_id,
        username: row.comment_username,
        date: row.comment_created_at,
        content: row.comment_deleted_at ? '**komentar telah dihapus**' : row.content,
      }));

    return {
      id: thread_id,
      title,
      body,
      date: thread_created_at,
      username: thread_username,
      comments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
