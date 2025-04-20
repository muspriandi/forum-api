const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(userId, comment) {
    const { thread_id, content } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, thread_id, content, userId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async findActiveCommentByIdAndUser(userId, id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND deleted_at IS NULL',
      values: [id],
    };
  
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('comment tidak tersedia');
    }
    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    return result.rows;
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET deleted_at=now() WHERE id = $1 RETURNING id',
      values: [id],
    };
  
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('gagal menghapus data, comment tidak tersedia');
    }
  }
}

module.exports = CommentRepositoryPostgres;
