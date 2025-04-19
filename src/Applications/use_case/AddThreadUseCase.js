const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const thread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(userId, thread);
  }
}

module.exports = AddThreadUseCase;
