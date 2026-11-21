import { Link, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage.js';
import TaskDetailPage from './pages/TaskDetailPage.js';
export default function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route
                path="*"
                element={
                    <main className="page-shell">
                        <h1>Página no encontrada</h1>
                        <Link to="/">Volver a tareas</Link>
                    </main>
                }
            />
        </Routes>
    );
}
