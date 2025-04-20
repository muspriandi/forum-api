class DetailThread {
  constructor(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('DETAIL_THREAD.INVALID_INPUT');
    }

    const {
      thread_id,
      title,
      body,
      thread_created_at,
      thread_username
    } = rows[0];

    if (!thread_id || !title || !body || !thread_created_at || !thread_username) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    this.id = thread_id;
    this.title = title;
    this.body = body;
    this.date = thread_created_at;
    this.username = thread_username;
    this.comments = this._mapComments(rows);
  }

  _mapComments(rows) {
    return rows
      .filter(row => row.comment_id)
      .map(row => ({
        id: row.comment_id,
        username: row.comment_username,
        date: row.comment_created_at,
        content: row.comment_deleted_at ? '**komentar telah dihapus**' : row.content,
      }));
  }
}

module.exports = DetailThread;
