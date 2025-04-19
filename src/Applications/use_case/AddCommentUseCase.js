const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const comment = new AddComment(useCasePayload);
    await this._threadRepository.existThread(comment.thread_id);
    return this._commentRepository.addComment(userId, comment);
  }
}

module.exports = AddCommentUseCase;
