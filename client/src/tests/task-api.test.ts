import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiHttpError, apiRequest } from '../api.js';
import { deleteTask, getTask, listTasks } from '../task-api.js';
import type { Task, TaskListQuery, TaskListResponse } from '../types.js';
const query: TaskListQuery = {
    page: 2,
    limit: 5,
    status: 'pending',
    search: 'documentar',
    sortBy: 'createdAt',
    order: 'desc'
};
const listResponse: TaskListResponse = {
    data: [],
    meta: {
        page: 2,
        limit: 5,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    }
};
afterEach(() => {
    vi.unstubAllGlobals();
});
describe('cliente HTTP de tareas', () => {
    it('construye la consulta y envía el token Bearer', async () => {
        const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(listResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(listTasks(query, 'token-de-prueba')).resolves.toEqual(listResponse);
        expect(fetchMock).toHaveBeenCalledOnce();
        const [url, init] = fetchMock.mock.calls[0] ?? [];
        expect(String(url)).toContain('/api/tasks?page=2&limit=5');
        expect(String(url)).toContain('status=pending');
        expect(String(url)).toContain('search=documentar');
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-de-prueba');
    });
    it('getTask consulta /api/tasks/:id y conserva el token Bearer', async () => {
        const task: Task = {
            id: '67112bfe47963b2be12c43b1',
            title: 'Tarea de detalle',
            status: 'pending',
            createdAt: '2026-11-21T00:00:00.000Z',
            updatedAt: '2026-11-21T00:00:00.000Z'
        };
        const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: task }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(getTask(task.id, 'token-de-prueba')).resolves.toEqual({ data: task });
        const [url, init] = fetchMock.mock.calls[0] ?? [];
        expect(String(url)).toContain(`/api/tasks/${task.id}`);
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-de-prueba');
    });
    it('getTask expone el 401 de la API para mostrar la vista no autorizada', async () => {
        const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
            error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token inválido.' }
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(getTask('67112bfe47963b2be12c43b1', 'token')).rejects.toMatchObject({
            status: 401,
            code: 'AUTHENTICATION_REQUIRED'
        });
    });
    it('getTask expone el 404 de la API para mostrar la vista de tarea ausente', async () => {
        const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
            error: { code: 'TASK_NOT_FOUND', message: 'No existe la tarea.' }
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(getTask('67112bfe47963b2be12c43b1', 'token')).rejects.toMatchObject({
            status: 404,
            code: 'TASK_NOT_FOUND'
        });
    });
    it('acepta una eliminación 204 sin intentar analizar JSON', async () => {
        const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
        vi.stubGlobal('fetch', fetchMock);
        await expect(deleteTask('67112bfe47963b2be12c43b1', 'token')).resolves.toBeUndefined();
    });
    it('convierte el contrato de error de la API en ApiHttpError', async () => {
        const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
            error: {
                code: 'FORBIDDEN',
                message: 'No tienes permisos.',
                requestId: 'req-123'
            }
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        }));
        vi.stubGlobal('fetch', fetchMock); const result = apiRequest('/api/tasks/id', { method: 'DELETE' }, 'token');
        await expect(result).rejects.toMatchObject({
            status: 403,
            code: 'FORBIDDEN',
            message: 'No tienes permisos.',
            requestId: 'req-123'
        });
    });
});