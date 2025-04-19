const DeleteComment = require('../../Domains/comments/entities/DeleteComment.js');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const payload = new DeleteComment(useCasePayload);

    await this._threadRepository.existThread(payload.thread_id);

    const comment = await this._commentRepository.findActiveCommentById(payload.comment_id);
    if (!comment.length) {
      throw new NotFoundError('comment tidak tersedia');
    }
    if (comment[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    await this._commentRepository.deleteCommentById(payload.comment_id);
  }
}

module.exports = DeleteCommentUseCase;
