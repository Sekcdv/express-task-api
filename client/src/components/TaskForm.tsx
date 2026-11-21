import { useState, type FormEvent } from 'react';
interface TaskFormProps {
    busy: boolean;
    onCreate: (title: string) => Promise<void>;
}
export function TaskForm({ busy, onCreate }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const normalized = title.trim();
        if (!normalized) return;
        await onCreate(normalized);
        setTitle('');
    };
    return (
        <form className="inline-form" onSubmit={(event) => void submit(event)}>
            <div className="grow-field">
                <label htmlFor="new-title">Nueva tarea</label>
                <input
                    id="new-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder="Ejemplo: documentar la liberación"
                    required
                />
            </div>
            <button type="submit" disabled={busy}>Crear</button>
        </form>
    );
}