import { useEffect, useState } from 'react';
import type { Task } from '../types.js';
interface TaskRowProps {
    task: Task;
    canDelete: boolean;
    busy: boolean;
    onRename: (task: Task, title: string) => Promise<void>;
    onToggle: (task: Task) => Promise<void>;
    onDelete: (task: Task) => Promise<void>;
}
function TaskRow({ task, canDelete, busy, onRename, onToggle, onDelete }: TaskRowProps) {
    const [title, setTitle] = useState(task.title);
    useEffect(() => setTitle(task.title), [task.title]);
    const changed = title.trim() !== task.title && title.trim().length > 0;
    return (
        <li className="task-card">
            <div className="task-title-field">
                <label htmlFor={`task-${task.id}`}>Título</label>
                <input
                    id={`task-${task.id}`}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                />
            </div>
            <span className={`badge ${task.status}`}>{task.status}</span>
            <div className="task-actions">
                <button
                    type="button"
                    className="secondary"
                    disabled={busy || !changed}
                    onClick={() => void onRename(task, title.trim())}
                >
                    Guardar título
                </button>
                <button type="button" disabled={busy} onClick={() => void onToggle(task)}>
                    {task.status === 'pending' ? 'Completar' : 'Reabrir'}
                </button>
                {canDelete && (
                    <button
                        type="button"
                        className="danger"
                        disabled={busy}
                        onClick={() => void onDelete(task)}
                    >
                        Eliminar
                    </button>
                )}
            </div>
        </li>
    );
}
interface TaskListProps {
    tasks: Task[];
    canDelete: boolean;
    busy: boolean;
    onRename: (task: Task, title: string) => Promise<void>;
    onToggle: (task: Task) => Promise<void>;
    onDelete: (task: Task) => Promise<void>;
} export function TaskList(props: TaskListProps) {
    if (props.tasks.length === 0) return <p>No hay tareas que coincidan con la consulta.</p>;
    return (
        <ul className="task-list">
            {props.tasks.map((task) => <TaskRow key={task.id} task={task} {...props} />)}
        </ul>
    );
}