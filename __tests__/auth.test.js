const request = require('supertest');
const app = require('../index');

describe('User Login', () => {
    it('should login a user successfully', async () => {
        const res = await request(app).post('/api/users/login').send({
            email: 'testuser@example.com',
            password: 'password123'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
    });

    it('should return 401 for invalid credentials', async () => {
        const res = await request(app).post('/api/users/login').send({
            email: 'testuser@example.com',
            password: 'wrongpassword'
        });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
});
