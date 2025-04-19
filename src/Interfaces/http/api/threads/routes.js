const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forum-api_jwt',
    },
  },
  {
    method: 'POST',
    path: '/threads/{id}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: 'forum-api_jwt',
    },
  },
]);

module.exports = routes;
