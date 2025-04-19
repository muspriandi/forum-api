const createServer = require('../createServer');
const Jwt = require('@hapi/jwt');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should validate JWT and extract user credentials', async () => {
    // Arrange
    const server = await createServer({});

    const token = Jwt.token.generate(
      {
        id: 'user-123', // Add user id to the payload
      },
      process.env.ACCESS_TOKEN_KEY // Secret key for signing the JWT
    );

    // Fake protected route to test JWT validation
    server.route({
      method: 'POST',
      path: '/thread',
      options: {
        auth: 'forum-api_jwt', // Use the 'forum-api_jwt' strategy
      },
      handler: (request, h) => {
        return {
          status: 'success',
          userId: request.auth.credentials.id, // Extract the user id from JWT credentials
        };
      },
    });

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/thread',
      headers: {
        Authorization: `Bearer ${token}`, // Add token to the Authorization header
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200); // Should return success
    expect(responseJson.status).toEqual('success');
    expect(responseJson.userId).toEqual('user-123'); // The user id in the token should match
  });
});
