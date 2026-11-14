import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiHttpError, apiRequest } from './api.js';
import type {
    ApiEnvelope,
    LoginData,
    Task,
    TaskListResponse,
    User
} from './types.js';
const TOKEN_KEY = 'task-api.access-token';
const TASK_LIST_LIMIT = 10;
const messageFrom = (error: unknown): string => {
    if (error instanceof ApiHttpError) {
        const reference = error.requestId ? ` Referencia: ${error.requestId}.` : '';
        return `${error.message}${reference}`;
    }
    return 'No fue posible comunicarse con la API.';
};
export default function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [token, setToken] = useState<string | null>(() =>
        sessionStorage.getItem(TOKEN_KEY)
    );
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [message, setMessage] = useState('Inicia sesión para consultar tus tareas.');
    const [busy, setBusy] = useState(false);
    const clearSession = useCallback((): void => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setTasks([]);
        setTaskTitle('');
    }, []);
    const loadProtectedData = useCallback(async (accessToken: string): Promise<void> => {
        try {
            setBusy(true); const [meResponse, taskResponse] = await Promise.all([
                apiRequest<ApiEnvelope<{ user: User }>>('/api/auth/me', {}, accessToken),
                apiRequest<TaskListResponse>(
                    `/api/tasks?limit=${TASK_LIST_LIMIT}&sortBy=createdAt&order=desc`,
                    {},
                    accessToken
                )
            ]);
            setUser(meResponse.data.user);
            setTasks(taskResponse.data);
            setMessage(`Se recuperaron ${taskResponse.meta.total} tareas.`);
        } catch (error: unknown) {
            if (error instanceof ApiHttpError && error.status === 401) clearSession();
            setMessage(messageFrom(error));
        } finally {
            setBusy(false);
        }
    }, [clearSession]);
    useEffect(() => {
        if (token) void loadProtectedData(token);
    }, [loadProtectedData, token]);
    const handleLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setBusy(true);
        setMessage('Comprobando credenciales...');
        try {
            const response = await apiRequest<ApiEnvelope<LoginData>>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            sessionStorage.setItem(TOKEN_KEY, response.data.accessToken);
            setToken(response.data.accessToken);
            setPassword('');
        } catch (error: unknown) {
            setMessage(messageFrom(error));
            setBusy(false);
        }
    };
    const handleCreateTask = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        const title = taskTitle.trim();
        if (!title) {
            setMessage('Escribe un título para la tarea.');
            return;
        }
        if (title.length > 120) {
            setMessage('El título no debe superar 120 caracteres.');
            return;
        }
        if (!token) {
            setMessage('Inicia sesión antes de crear una tarea.');
            return;
        }

        setBusy(true);
        setMessage('Creando tarea...');
        try {
            const response = await apiRequest<ApiEnvelope<Task>>('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ title })
            }, token);
            setTasks((currentTasks) =>
                [response.data, ...currentTasks].slice(0, TASK_LIST_LIMIT)
            );
            setTaskTitle('');
            setMessage(`La tarea "${response.data.title}" se creó correctamente.`);
        } catch (error: unknown) {
            setMessage(messageFrom(error));
        } finally {
            setBusy(false);
        }
    };
    const handleLogout = (): void => {
        clearSession();
        setMessage('La sesión local se eliminó.');
    };
    return (
        <main className="page-shell">
            <header className="page-header">
                <div>
                    <p className="eyebrow">EC3 F2 A11</p>
                    <h1>Task API Client</h1>
                    <p>Integración inicial de React con una API protegida por JWT.</p>
                </div>
                {user && <button onClick={handleLogout}>Cerrar sesión</button>}
            </header>
            {!token ? (
                <section className="panel login-panel" aria-labelledby="login-title">
                    <h2 id="login-title">Iniciar sesión</h2>
                    <form onSubmit={(event) => void handleLogin(event)}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="username"
                            required
                        />
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <button type="submit" disabled={busy}>
                            {busy ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </section>
            ) : (
                <section className="workspace" aria-busy={busy}>
                    <article className="panel identity-panel"> <h2>Identidad autenticada</h2>
                        {user ? (
                            <dl>
                                <div><dt>Nombre</dt><dd>{user.name}</dd></div>
                                <div><dt>Correo</dt><dd>{user.email}</dd></div>
                                <div><dt>Rol</dt><dd>{user.role}</dd></div>
                            </dl>
                        ) : <p>Validando el token...</p>}
                    </article>
                    <article className="panel">
                        <div className="section-heading">
                            <h2>Tareas recuperadas</h2>
                            <button
                                onClick={() => token && void loadProtectedData(token)}
                                disabled={busy}
                            >
                                Actualizar
                            </button>
                        </div>
                        <form onSubmit={(event) => void handleCreateTask(event)}>
                            <label htmlFor="task-title">Título de la tarea</label>
                            <input
                                id="task-title"
                                type="text"
                                value={taskTitle}
                                onChange={(event) => setTaskTitle(event.target.value)}
                                maxLength={120}
                                required
                            />
                            <button type="submit" disabled={busy}>
                                {busy ? 'Creando...' : 'Crear tarea'}
                            </button>
                        </form>
                        {tasks.length === 0 ? (
                            <p>No hay tareas para mostrar.</p>
                        ) : (
                            <ul className="task-list">
                                {tasks.map((task) => (
                                    <li key={task.id}>
                                        <span>{task.title}</span>
                                        <strong>{task.status}</strong>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </article>
                </section>
            )}
            <p className="status-message" role="status">{message}</p>
        </main>
    );
}