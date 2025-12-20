
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import { MainLayout } from './components/layout/MainLayout';
import { PublicLayout } from './components/layout/PublicLayout';

// Admin Pages
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

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorMyCoursesPage from './pages/instructor/InstructorMyCoursesPage';
import CourseBuilderPage from './pages/instructor/CourseBuilderPage';
import GradebookPage from './pages/instructor/GradebookPage';
import ExaminationsPage from './pages/instructor/ExaminationsPage';
import QuestionBankPage from './pages/instructor/QuestionBankPage';
import RubricsPage from './pages/instructor/RubricsPage';
import InstructorProfilePage from './pages/instructor/MyProfilePage';
import MediaLibraryPage from './pages/instructor/MediaLibraryPage';
import GradingHubPage from './pages/instructor/GradingHubPage';
import RetentionPage from './pages/instructor/RetentionPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCoursesPage from './pages/student/MyCoursesPage';
import CourseViewerPage from './pages/student/CourseViewerPage';
import ExploreCoursesPage from './pages/student/ExploreCoursesPage';
import MyGradesPage from './pages/student/MyGradesPage';
import MyProgramPage from './pages/student/MyProgramPage';
import StudentProfilePage from './pages/student/MyProfilePage';
import MyTranscriptPage from './pages/student/MyTranscriptPage';
import MyMessagesPage from './pages/student/MyMessagesPage';
import MyCertificatesPage from './pages/student/MyCertificatesPage';
import MyAchievementsPage from './pages/student/MyAchievementsPage';
import ExamTakerPage from './pages/student/ExamTakerPage';
import OpportunitiesPage from './pages/student/OpportunitiesPage';

// Generic Shared Pages
import CalendarPage from './pages/CalendarPage';

// Legal & Compliance Pages
import DataProtectionPage from './pages/legal/DataProtectionPage';
import ComplianceStandardsPage from './pages/legal/ComplianceStandardsPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import SecurityStandardsPage from './pages/legal/SecurityStandardsPage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';

// Marketing Pages
import FeaturesPage from './pages/marketing/FeaturesPage';
import SolutionsPage from './pages/marketing/SolutionsPage';
import PricingPage from './pages/marketing/PricingPage';
import DemoRequestPage from './pages/marketing/DemoRequestPage';

import { UserRole } from './types';
import { IdleTimeoutModal } from './components/common/IdleTimeoutModal';

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === UserRole.Student ? '/dashboard' : `/${user.role}`} replace />;
    }
    return <MainLayout />;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, user, loading, isIdleTimeoutWarningVisible, resetTimers, logout } = useAuth();
    
    if (loading) return <div className="flex h-screen items-center justify-center">Loading Application...</div>;
    const defaultPath = user ? (user.role === UserRole.Student ? '/dashboard' : `/${user.role}`) : '/login';

    return (
        <>
            <Routes>
                {/* 1. PUBLIC ROUTES (Wrapped in PublicLayout) */}
                <Route element={<PublicLayout><Outlet /></PublicLayout>}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/solutions" element={<SolutionsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/request-demo" element={<DemoRequestPage />} />
                    <Route path="/legal/data-protection" element={<DataProtectionPage />} />
                    <Route path="/legal/compliance" element={<ComplianceStandardsPage />} />
                    <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/legal/security" element={<SecurityStandardsPage />} />
                    <Route path="/legal/cookies" element={<CookiePolicyPage />} />
                </Route>

                {/* 2. AUTH ROUTE */}
                <Route path="/login" element={isAuthenticated ? <Navigate to={defaultPath} /> : <LoginPage />} />
                
                {/* 3. SHARED PROTECTED ROUTES */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Instructor, UserRole.Student]} />}>
                    <Route path="/calendar" element={<CalendarPage />} />
                </Route>

                {/* 4. ADMIN ROUTES */}
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
                
                {/* 5. INSTRUCTOR ROUTES */}
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
                    <Route path="/instructor/profile" element={<InstructorProfilePage />} />
                </Route>

                {/* 6. STUDENT ROUTES */}
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
                    <Route path="/profile" element={<StudentProfilePage />} />
                </Route>

                <Route path="/exam/:examId" element={<ExamTakerPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {isAuthenticated && (
                <IdleTimeoutModal isOpen={isIdleTimeoutWarningVisible} onStayLoggedIn={resetTimers} onLogout={logout} />
            )}
        </>
    );
};

const App: React.FC = () => {
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') document.documentElement.classList.add('dark');
        else if (storedTheme === 'light') document.documentElement.classList.remove('dark');
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
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
