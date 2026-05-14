import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { Subjects } from './pages/Subjects';
import { Lessons } from './pages/Lessons';
import { LessonEdit } from './pages/LessonEdit';
import { ResourceView } from './pages/ResourceView';
import { Bulletins } from './pages/Bulletins';
import { BulletinDetail } from './pages/BulletinDetail';
import { BulletinProjection } from './pages/BulletinProjection';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/lessons/:id/edit"
          element={
            <ProtectedRoute>
              <LessonEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:id/view"
          element={
            <ProtectedRoute>
              <ResourceView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment-resources/:id/view"
          element={
            <ProtectedRoute>
              <ResourceView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulletins"
          element={
            <ProtectedRoute>
              <Bulletins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulletins/projection"
          element={
            <ProtectedRoute>
              <BulletinProjection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulletins/:id"
          element={
            <ProtectedRoute>
              <BulletinDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
