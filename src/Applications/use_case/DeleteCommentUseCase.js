const DeleteComment = require('../../Domains/comments/entities/DeleteComment.js');

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const payload = new DeleteComment(useCasePayload);

    await this._threadRepository.existThread(payload.thread_id);
    await this._commentRepository.findActiveCommentByIdAndUser(userId, payload.comment_id);
    await this._commentRepository.deleteCommentById(payload.comment_id);
  }
}

module.exports = DeleteCommentUseCase;
