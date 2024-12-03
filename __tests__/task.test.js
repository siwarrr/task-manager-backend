const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

let token;
let projectId;

describe('Task API', () => {
    beforeAll(async () => {
        jest.setTimeout(10000); // Augmenter le timeout si nécessaire

        // Connectez-vous et obtenez un token
        const userRes = await request(app).post('/api/users/login').send({
            email: 'testuser@example.com',
            password: 'password123',
        });
        token = userRes.body.token;

        // Créez un projet pour associer les tâches
        const projectRes = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Project for Tasks',
                description: 'Project Description',
            });
        projectId = projectRes.body.project._id; // Assignez l'ID du projet
    });

    it('should create a task successfully', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Task',
                description: 'Task Description',
                project: projectId,
                priority: 'high', // Utilisez une valeur valide
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe('Test Task');
        expect(res.body.project).toBe(projectId.toString());
    });

    it('should return 404 if the project does not exist', async () => {
        const fakeProjectId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Invalid Project Task',
                description: 'Task Description',
                project: fakeProjectId,
                priority: 'low',
            });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message', 'Project not found');
    });

    it('should return 400 if no title is provided', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Task without title',
                project: projectId,
                priority: 'medium',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Title is required');
    });

    it('should return 400 for invalid priority value', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Task with invalid priority',
                description: 'Task Description',
                project: projectId,
                priority: 'invalid', // Valeur non valide
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid priority value');
    });
});
