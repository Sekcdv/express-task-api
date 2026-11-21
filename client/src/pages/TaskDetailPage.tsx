import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiHttpError } from '../api.js';
import { clearToken, readToken } from '../session.js';
import { getTask } from '../task-api.js';
import type { Task } from '../types.js';
type DetailStatus = 'loading' | 'success' | 'unauthorized' | 'not-found' | 'error';
const messageFrom = (error: unknown): string => {
    if (error instanceof ApiHttpError) {
        const reference = error.requestId ? ` Referencia: ${error.requestId}.` : '';
        return `${error.message}${reference}`;
    }
    return 'No fue posible comunicarse con la API.';
};
export default function TaskDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [status, setStatus] = useState<DetailStatus>('loading');
    const [task, setTask] = useState<Task | null>(null);
    const [message, setMessage] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    useEffect(() => {
        const accessToken = readToken();
        if (!accessToken) {
            setStatus('unauthorized');
            setMessage('Inicia sesión para consultar el detalle de la tarea.');
            return;
        }
        if (!id) {
            setStatus('not-found');
            return;
        }
        const controller = new AbortController();
        setStatus('loading');
        setTask(null);
        setMessage('');
        // La fuente de verdad es GET /api/tasks/:id, no el arreglo de la lista.
        const loadTask = async (): Promise<void> => {
            try {
                const response = await getTask(id, accessToken, controller.signal);
                if (controller.signal.aborted) return;
                setTask(response.data);
                setStatus('success');
            } catch (error: unknown) {
                if (controller.signal.aborted) return;
                if (error instanceof ApiHttpError && error.status === 401) {
                    clearToken();
                    setStatus('unauthorized');
                    setMessage('Tu sesión no es válida o expiró. Vuelve a iniciar sesión.');
                    return;
                }
                if (error instanceof ApiHttpError && error.status === 404) {
                    setStatus('not-found');
                    return;
                }
                setStatus('error');
                setMessage(messageFrom(error));
            }
        };
        void loadTask();
        return () => controller.abort();
    }, [id, reloadKey]);
    return (
        <main className="page-shell">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Detalle de tarea</p>
                    <h1>Task API Client</h1>
                </div>
            </header>
            {status === 'loading' && (
                <p className="panel" role="status" aria-busy="true">Cargando tarea…</p>
            )}
            {status === 'unauthorized' && (
                <section className="panel" role="alert">
                    <h2>No autorizado</h2>
                    <p>{message}</p>
                </section>
            )}
            {status === 'not-found' && (
                <section className="panel" role="alert">
                    <h2>Tarea no encontrada</h2>
                    <p>La tarea no existe o fue eliminada.</p>
                </section>
            )}
            {status === 'error' && (
                <section className="panel" role="alert">
                    <h2>No fue posible consultar la tarea</h2>
                    <p>{message}</p>
                    <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
                        Reintentar
                    </button>
                </section>
            )}
            {status === 'success' && task && (
                <article className="panel task-detail" aria-labelledby="task-detail-title">
                    <p className="eyebrow">Tarea encontrada</p>
                    <h2 id="task-detail-title">{task.title}</h2>
                    <dl className="task-detail__grid">
                        <div>
                            <dt>Identificador</dt>
                            <dd>{task.id}</dd>
                        </div>
                        <div>
                            <dt>Estado</dt>
                            <dd><span className={`badge ${task.status}`}>{task.status}</span></dd>
                        </div>
                        <div>
                            <dt>Creación</dt>
                            <dd><time dateTime={task.createdAt}>{task.createdAt}</time></dd>
                        </div>
                        <div>
                            <dt>Última actualización</dt>
                            <dd><time dateTime={task.updatedAt}>{task.updatedAt}</time></dd>
                        </div>
                    </dl>
                </article>
            )}
            <p className="detail-back"><Link to="/">Volver a tareas</Link></p>
        </main>
    );
}
