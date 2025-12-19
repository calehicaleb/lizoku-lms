import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import { MainLayout } from './components/layout/MainLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import SecurityManagementPage from './pages/admin/SecurityManagementPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import ProgramsPage from './pages/admin/ProgramsPage';
import SemestersPage from './pages/admin/SemestersPage';
import CoursesPage from './pages/admin/CoursesPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import CommunicationsPage from './pages/admin/CommunicationsPage';
import AdminQuestionBankPage from './pages/admin/AdminQuestionBankPage';
import ReportingPage from './pages/admin/ReportingPage';
import AdminExaminationsPage from './pages/admin/ExaminationsPage';
import CertificateSettingsPage from './pages/admin/CertificateSettingsPage';
import CertificateRequestsPage from './pages/admin/CertificateRequestsPage';
import QuickSetupPage from './pages/admin/QuickSetupPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import SessionManagementPage from './pages/admin/SessionManagementPage';
import BudgetingPage from './pages/admin/BudgetingPage';
import GeospatialPage from './pages/admin/GeospatialPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorMyCoursesPage from './pages/instructor/InstructorMyCoursesPage';
import CourseBuilderPage from './pages/instructor/CourseBuilderPage';
import GradebookPage from './pages/instructor/GradebookPage';
import ExaminationsPage from './pages/instructor/ExaminationsPage';
import QuestionBankPage from './pages/instructor/QuestionBankPage';
import RubricsPage from './pages/instructor/RubricsPage';
import InstructorMyProfilePage from './pages/instructor/MyProfilePage';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseViewerPage from './pages/student/CourseViewerPage';
import ExploreCoursesPage from './pages/student/ExploreCoursesPage';
import MyGradesPage from './pages/student/MyGradesPage';
import MyProgramPage from './pages/student/MyProgramPage';
import MyProfilePage from './pages/student/MyProfilePage';
import MyTranscriptPage from './pages/student/MyTranscriptPage';
import MyMessagesPage from './pages/student/MyMessagesPage';
import MyCertificatesPage from './pages/student/MyCertificatesPage';
import MyAchievementsPage from './pages/student/MyAchievementsPage';
import CalendarPage from './pages/CalendarPage';
import ExamTakerPage from './pages/student/ExamTakerPage';
import { UserRole } from './types';
import { IdleTimeoutModal } from './components/common/IdleTimeoutModal';
import MediaLibraryPage from './pages/instructor/MediaLibraryPage';
import GradingHubPage from './pages/instructor/GradingHubPage';
import RetentionPage from './pages/instructor/RetentionPage';
import OpportunitiesPage from './pages/student/OpportunitiesPage';

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
    const { isAuthenticated, user, loading, isIdleTimeoutWarningVisible, resetTimers, logout } = useAuth();
    const location = useLocation();

    // Scroll to top on every route change to ensure users don't start halfway down a page.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    
    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const defaultPath = user ? (user.role === UserRole.Student ? '/dashboard' : `/${user.role}`) : '/login';

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
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
                    <Route path="/admin/courses/:courseId/preview" element={<CourseViewerPage />} />
                    <Route path="/admin/examinations" element={<AdminExaminationsPage />} />
                    <Route path="/admin/announcements" element={<AnnouncementsPage />} />
                    <Route path="/admin/communications" element={<CommunicationsPage />} />
                    <Route path="/admin/question-bank" element={<AdminQuestionBankPage />} />
                    <Route path="/admin/reports" element={<ReportingPage />} />
                    <Route path="/admin/security" element={<SecurityManagementPage />} />
                    <Route path="/admin/certificate-settings" element={<CertificateSettingsPage />} />
                    <Route path="/admin/certificate-requests" element={<CertificateRequestsPage />} />
                    <Route path="/admin/budgeting" element={<BudgetingPage />} />
                    <Route path="/admin/geospatial" element={<GeospatialPage />} />
                    <Route path="/admin/quick-setup" element={<QuickSetupPage />} />
                    <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
                    <Route path="/admin/sessions" element={<SessionManagementPage />} />
                </Route>
                
                {/* Instructor Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.Instructor]} />}>
                    <Route path="/instructor" element={<InstructorDashboard />} />
                    <Route path="/instructor/courses" element={<InstructorMyCoursesPage />} />
                    <Route path="/instructor/courses/:courseId" element={<CourseBuilderPage />} />
                    <Route path="/instructor/grading-hub" element={<GradingHubPage />} />
                    <Route path="/instructor/media-library" element={<MediaLibraryPage />} />
                    <Route path="/instructor/gradebook" element={<GradebookPage />} />
                    <Route path="/instructor/examinations" element={<ExaminationsPage />} />
                    <Route path="/instructor/question-bank" element={<QuestionBankPage />} />
                    <Route path="/instructor/rubrics" element={<RubricsPage />} />
                    <Route path="/instructor/retention" element={<RetentionPage />} />
                    <Route path="/instructor/profile" element={<InstructorMyProfilePage />} />
                </Route>

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.Student]} />}>
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="/explore" element={<ExploreCoursesPage />} />
                    <Route path="/career-hub" element={<OpportunitiesPage />} />
                    <Route path="/my-courses" element={<MyCoursesPage />} />
                    <Route path="/courses/:courseId" element={<CourseViewerPage />} />
                    <Route path="/grades" element={<MyGradesPage />} />
                    <Route path="/program" element={<MyProgramPage />} />
                    <Route path="/transcript" element={<MyTranscriptPage />} />
                    <Route path="/my-messages" element={<MyMessagesPage />} />
                    <Route path="/my-messages/new" element={<MyMessagesPage />} />
                    <Route path="/my-messages/:threadId" element={<MyMessagesPage />} />
                    <Route path="/my-certificates" element={<MyCertificatesPage />} />
                    <Route path="/achievements" element={<MyAchievementsPage />} />
                    <Route path="/profile" element={<MyProfilePage />} />
                </Route>

                {/* Standalone Exam Taker Route */}
                <Route path="/exam/:examId" element={<ExamTakerPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {isAuthenticated && (
                <IdleTimeoutModal
                    isOpen={isIdleTimeoutWarningVisible}
                    onStayLoggedIn={resetTimers}
                    onLogout={logout}
                />
            )}
        </>
    );
};

const App: React.FC = () => {
    useEffect(() => {
        // Theme initialization logic
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (storedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Fallback to system preference if no local storage setting
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <AuthProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
