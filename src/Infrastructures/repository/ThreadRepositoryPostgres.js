const AddedThread = require('../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(userId, thread) {
    const { title, body } = thread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, userId],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async existThread(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };
  
    const result = await this._pool.query(query);
    
    if (result.rowCount === 0) {
      throw new NotFoundError('thread tidak tersedia');
    }
    return true;
  }

  async getThreadDetailById(id) {
    const query = {
      text: `
        SELECT 
          t.id AS thread_id,
          t.title,
          t.body,
          t.created_at AS thread_created_at,
          u.username AS thread_username,
          c.id AS comment_id,
          c.content,
          c.created_at AS comment_created_at,
          c.deleted_at AS comment_deleted_at,
          u2.username AS comment_username
        FROM threads t
        INNER JOIN users u ON u.id = t.owner
        LEFT JOIN comments c ON c.thread_id = t.id
        LEFT JOIN users u2 ON u2.id = c.owner
        WHERE t.id = $1
        ORDER BY c.created_at ASC;
      `,
      values: [id],
    }

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('thread tidak tersedia');
    }
    return new DetailThread(result.rows);
  }
}

module.exports = ThreadRepositoryPostgres;
