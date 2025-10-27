import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import SecurityManagementPage from './pages/admin/SecurityManagementPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import ProgramsPage from './pages/admin/ProgramsPage';
import SemestersPage from './pages/admin/SemestersPage';
import CoursesPage from './pages/admin/CoursesPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorMyCoursesPage from './pages/instructor/InstructorMyCoursesPage';
import CourseBuilderPage from './pages/instructor/CourseBuilderPage';
import GradebookPage from './pages/instructor/GradebookPage';
import QuestionBankPage from './pages/instructor/QuestionBankPage';
import RubricsPage from './pages/instructor/RubricsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseViewerPage from './pages/student/CourseViewerPage';
import ExploreCoursesPage from './pages/student/ExploreCoursesPage';
import MyGradesPage from './pages/student/MyGradesPage';
import MyProgramPage from './pages/student/MyProgramPage';
import CalendarPage from './pages/CalendarPage';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (user && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if trying to access a restricted page
        return <Navigate to={`/${user.role === 'student' ? 'dashboard' : user.role}`} replace />;
    }

    return <MainLayout />;
};


const AppRoutes: React.FC = () => {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const defaultPath = user ? (user.role === UserRole.Student ? '/dashboard' : `/${user.role}`) : '/login';

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to={defaultPath} /> : <LoginPage />} />
            
            {/* Shared Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Instructor, UserRole.Student]} />}>
                <Route path="/calendar" element={<CalendarPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.Admin]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/departments" element={<DepartmentsPage />} />
                <Route path="/admin/programs" element={<ProgramsPage />} />
                <Route path="/admin/semesters" element={<SemestersPage />} />
                <Route path="/admin/courses" element={<CoursesPage />} />
                <Route path="/admin/announcements" element={<AnnouncementsPage />} />
                <Route path="/admin/security" element={<SecurityManagementPage />} />
                {/* Add other admin routes as placeholders */}
            </Route>
            
            {/* Instructor Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.Instructor]} />}>
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/instructor/courses" element={<InstructorMyCoursesPage />} />
                <Route path="/instructor/courses/:courseId" element={<CourseBuilderPage />} />
                <Route path="/instructor/gradebook" element={<GradebookPage />} />
                <Route path="/instructor/question-bank" element={<QuestionBankPage />} />
                <Route path="/instructor/rubrics" element={<RubricsPage />} />
                {/* Add other instructor routes as placeholders */}
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.Student]} />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/explore" element={<ExploreCoursesPage />} />
                <Route path="/my-courses" element={<MyCoursesPage />} />
                <Route path="/courses/:courseId" element={<CourseViewerPage />} />
                <Route path="/grades" element={<MyGradesPage />} />
                <Route path="/program" element={<MyProgramPage />} />
                 {/* Add other student routes as placeholders */}
            </Route>

            <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AuthProvider>
    );
};

export default App;