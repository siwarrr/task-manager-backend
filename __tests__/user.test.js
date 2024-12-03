const request = require('supertest');
const app = require('../index');

describe('User Registration', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/users/register').send({
            name: 'Unique User',
            email: `uniqueuser${Date.now()}@example.com`,
            password: 'password123'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');
    });    

    it('should return 400 if the email is already taken', async () => {
        const res = await request(app).post('/api/users/register').send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123'
        });        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Email already in use');
    });
});