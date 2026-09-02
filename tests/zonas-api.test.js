import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import request from 'supertest';

const documents = new Map();
const mockCreate = jest.fn(async (data) => {
    if (documents.has(data.id)) {
        const error = new Error('already exists');
        error.code = 6;
        throw error;
    }
    documents.set(data.id, { ...data });
});
const mockSet = jest.fn(async (data) => {
    documents.set(data.id, { ...data });
});
const mockDelete = jest.fn(async () => undefined);
const mockVerifyIdToken = jest.fn(async (token) => {
    if (token === 'forbidden-token') return { uid: 'not-admin', email: 'user@example.com' };
    return { uid: 'admin-uid', email: 'admin@nellydelivery.com' };
});

function docRef(id) {
    return {
        id,
        create: mockCreate,
        set: mockSet,
        delete: jest.fn(async () => {
            mockDelete();
            documents.delete(id);
        }),
        get: jest.fn(async () => ({
            exists: documents.has(id),
            id,
            data: () => documents.get(id)
        }))
    };
}

const itemsCollection = {
    doc: jest.fn((id) => docRef(id)),
    get: jest.fn(async () => ({
        docs: [...documents.entries()].map(([id, data]) => ({ id, data: () => data }))
    }))
};
const mockAdmin = {
    auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    firestore: () => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({ collection: jest.fn(() => itemsCollection) }))
        }))
    })
};

jest.unstable_mockModule('../config/firebase-admin-esm.js', () => ({
    getAdmin: jest.fn(async () => mockAdmin)
}));

const { default: app } = await import('../app.js');

const validZone = {
    id: 'zona_centro',
    nombre: 'Centro',
    colorHex: '#1976D2',
    coordenadas: [
        { lat: 16.7521, lng: -93.1162 },
        { lat: 16.7548, lng: -93.1101 },
        { lat: 16.7489, lng: -93.1074 },
        { lat: 16.7462, lng: -93.1149 }
    ]
};

describe('H3 Zona v1 HTTP contract', () => {
    beforeEach(() => {
        documents.clear();
        mockCreate.mockClear();
        mockSet.mockClear();
        mockDelete.mockClear();
        mockVerifyIdToken.mockClear();
    });

    test('requires admin authentication and authorization', async () => {
        const missing = await request(app).get('/api/admin/zonas');
        const forbidden = await request(app).get('/api/admin/zonas').set('Authorization', 'Bearer forbidden-token');
        expect(missing.statusCode).toBe(401);
        expect(forbidden.statusCode).toBe(403);
    });

    test('creates and distributes one canonical zone', async () => {
        const created = await request(app).post('/api/admin/zonas')
            .set('Authorization', 'Bearer admin-token').send(validZone);
        const distributed = await request(app).get('/api/zonas-territoriales');
        expect(created.statusCode).toBe(201);
        expect(distributed.body).toEqual({ ok: true, contract_version: 'zona-v1', zonas: [validZone] });
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    test('rejects invalid payloads before any Firestore write', async () => {
        const response = await request(app).post('/api/admin/zonas')
            .set('Authorization', 'Bearer admin-token')
            .send({ ...validZone, coordenadas: validZone.coordenadas.slice(0, 2) });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('ZONE_INVALID');
        expect(mockCreate).not.toHaveBeenCalled();
        expect(documents.size).toBe(0);
    });

    test('rejects duplicate ids and keeps identity immutable on PUT', async () => {
        await request(app).post('/api/admin/zonas').set('Authorization', 'Bearer admin-token').send(validZone);
        const duplicate = await request(app).post('/api/admin/zonas')
            .set('Authorization', 'Bearer admin-token').send(validZone);
        const changedId = await request(app).put('/api/admin/zonas/zona_centro')
            .set('Authorization', 'Bearer admin-token').send({ ...validZone, id: 'otra_zona' });
        expect(duplicate.statusCode).toBe(409);
        expect(duplicate.body.error).toBe('ZONE_ID_EXISTS');
        expect(changedId.statusCode).toBe(400);
        expect(changedId.body.error).toBe('ZONE_INVALID');
    });

    test('updates and deletes only the requested canonical document', async () => {
        await request(app).post('/api/admin/zonas').set('Authorization', 'Bearer admin-token').send(validZone);
        const updated = await request(app).put('/api/admin/zonas/zona_centro')
            .set('Authorization', 'Bearer admin-token')
            .send({ ...validZone, nombre: 'Centro actualizado' });
        const deleted = await request(app).delete('/api/admin/zonas/zona_centro')
            .set('Authorization', 'Bearer admin-token');
        const missing = await request(app).delete('/api/admin/zonas/zona_centro')
            .set('Authorization', 'Bearer admin-token');
        expect(updated.statusCode).toBe(200);
        expect(updated.body.zona.nombre).toBe('Centro actualizado');
        expect(deleted.statusCode).toBe(200);
        expect(missing.statusCode).toBe(404);
    });
});
