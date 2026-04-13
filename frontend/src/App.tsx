import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Subjects } from './pages/Subjects';
import { Lessons } from './pages/Lessons';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:subjectId"
          element={
            <ProtectedRoute>
              <Lessons />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/subjects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
