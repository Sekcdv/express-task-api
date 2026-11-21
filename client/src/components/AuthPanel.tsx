import { useState, type FormEvent } from 'react';
interface AuthPanelProps {
    busy: boolean;
    onLogin: (email: string, password: string) => Promise<void>;
    onRegister: (name: string, email: string, password: string) => Promise<void>;
}
export function AuthPanel({ busy, onLogin, onRegister }: AuthPanelProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (mode === 'register') await onRegister(name, email, password);
        else await onLogin(email, password);
        setPassword('');
    };
    return (
        <section className="panel auth-panel" aria-labelledby="auth-title">
            <div className="tab-list" aria-label="Opciones de acceso">
                <button
                    type="button"
                    className={mode === 'login' ? 'active' : 'secondary'}
                    onClick={() => setMode('login')}
                >
                    Iniciar sesión
                </button>
                <button
                    type="button"
                    className={mode === 'register' ? 'active' : 'secondary'}
                    onClick={() => setMode('register')}
                >
                    Crear cuenta
                </button>
            </div>
            <h2 id="auth-title">{mode === 'login' ? 'Acceso' : 'Registro'}</h2>
            <form onSubmit={(event) => void submit(event)}>
                {mode === 'register' && (
                    <>
                        <label htmlFor="name">Nombre</label>
                        <input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoComplete="name"
                            required
                        />
                    </>
                )}
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
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={15}
                    required
                />
                <small>Usa al menos 15 caracteres. La contraseña nunca se guarda en React.</small>
                <button type="submit" disabled={busy}>
                    {busy ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
                </button>
            </form>
        </section>
    );
}