const request = require('supertest');
const app = require('../index');
let token;

describe('Project API', () => {
    beforeAll(async () => {
        const res = await request(app).post('/api/users/login').send({
            email: 'testuser@example.com',
            password: 'password123'
        });
        token = res.body.token;
    });

    it('should create a project successfully', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Project', description: 'Description' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('project');
    });
});
