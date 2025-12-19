import {
    User, UserRole, UserStatus, StatCardData, CourseSummary, Department, Program, Semester, SemesterStatus, Course, CourseStatus, Module, ContentItem, ContentType, Announcement, Enrollment, Grade, CalendarEvent, CalendarEventType, DiscussionPost, Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, QuizSubmission, MultipleSelectQuestion, FillBlankQuestion, Rubric, RubricScope, StudentProgramDetails, ProgramCourse, Communication, SecuritySettings, StudentTranscript, Message, MessageThread, Examination, ExaminationStatus, Certificate, Achievement, CertificateSettings, CertificateRequest, CertificateRequestStatus, InstitutionSettings, ActivityLog, ActivityActionType, UserSession, Notification, NotificationType, OverdueItem, UpcomingDeadline, RecentActivity, ContentItemDetails, AssignmentSubmission, Submission, QuestionDifficulty, MediaItem, MediaType, CourseGradingSummary, GradableItemSummary, StudentSubmissionDetails, RubricCriterion, RubricLevel, AtRiskStudent, JobOpportunity, JobType, JobApplication, ApplicationStatus, SurveySubmission, SurveySummary, SurveyQuestionType, LeaderboardEntry, DepartmentBudget, BudgetRequest, FinancialTrend, RegionalStat, VersionHistoryEntry, DeliveryMode, DisputeStatus, GradeDispute, CalendarVisibility
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. USERS ---
const USERS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@lizoku.com', role: UserRole.Admin, avatarUrl: 'https://i.pravatar.cc/150?u=admin', status: UserStatus.Active, createdAt: '2025-01-01', county: 'Nairobi' },
    { id: '2', name: 'Instructor Sam', email: 'sam@lizoku.com', role: UserRole.Instructor, avatarUrl: 'https://i.pravatar.cc/150?u=sam', status: UserStatus.Active, createdAt: '2025-01-02', county: 'Mombasa' },
    { id: '3', name: 'Alice Topstudent', email: 'alice@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=alice', status: UserStatus.Active, createdAt: '2025-01-03', programId: 'p1', county: 'Nairobi' },
    { id: '4', name: 'John Average', email: 'john@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=john', status: UserStatus.Active, createdAt: '2025-01-05', programId: 'p1', county: 'Kiambu' },
];

const STUDENT_IDS = USERS.filter(u => u.role === UserRole.Student).map(u => u.id);

// --- 2. ACADEMICS ---
const DEPARTMENTS: Department[] = [
    { id: 'd1', name: 'School of Computing', head: 'Dr. Smith', programCount: 3 },
];

const PROGRAMS: Program[] = [
    { id: 'p1', name: 'BSc Computer Science', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 40, duration: '4 Years', courseIds: ['c1-f25'] },
];

const SEMESTERS: Semester[] = [
    { id: 's1', name: 'Fall 2025', startDate: '2025-09-01', endDate: '2025-12-24', status: SemesterStatus.Active },
    { id: 's2', name: 'Spring 2026', startDate: '2026-01-10', endDate: '2026-05-15', status: SemesterStatus.Upcoming }
];

// --- 5. COURSES ---
const MOCK_COURSES: Course[] = [
    { 
        id: 'c1-f25', masterId: 'c1', title: 'Intro to Computer Science', description: 'Current active session for Fall 2025.', 
        instructorId: '2', instructorName: 'Instructor Sam', departmentId: 'd1', departmentName: 'School of Computing', 
        semesterId: 's1', semesterName: 'Fall 2025',
        status: CourseStatus.Published, students: 45, progress: 85, price: 35000, deliveryMode: DeliveryMode.Hybrid,
        gradingDeadline: '2025-12-30',
        modules: [
            { 
                id: 'm1', title: 'Module 1: Foundations', 
                items: [
                    { id: 'i1', title: 'Final Research Essay', type: ContentType.Assignment, dueDate: '2025-12-20', requiresFileUpload: true, rubricId: 'r1', instructions: 'Submit your final research paper on AI Ethics.' },
                    { id: 'i2', title: 'End-Term Quiz', type: ContentType.Quiz, dueDate: '2025-12-18', timeLimit: 30 },
                    { 
                        id: 'live1', 
                        title: 'Exam Prep: Live Q&A', 
                        type: ContentType.LiveSession, 
                        dueDate: '2025-12-19', 
                        liveDetails: {
                            platform: 'Zoom',
                            meetingUrl: 'https://zoom.us/j/123456789',
                            startTime: '2025-12-19T14:00:00Z',
                            durationMinutes: 60
                        }
                    }
                ] 
            }
        ]
    }
];

// --- 6. CALENDAR EVENTS ---
const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'e1', title: 'End of Year Graduation 2025', date: '2025-12-22', type: CalendarEventType.Graduation, visibility: CalendarVisibility.Everyone, description: 'Formal graduation ceremony for all graduating students of 2025.' },
    { id: 'e2', title: 'LMS Winter Maintenance', date: '2025-12-25', type: CalendarEventType.Maintenance, visibility: CalendarVisibility.Everyone, description: 'The LMS will be offline for 4 hours starting at 00:00 EAT.' },
    { id: 'e3', title: 'Christmas Holiday', date: '2025-12-25', type: CalendarEventType.Holiday, visibility: CalendarVisibility.Everyone },
    { id: 'e4', title: 'Spring 2026 Orientation', date: '2026-01-05', type: CalendarEventType.OnSiteSession, location: 'Main Hall', visibility: CalendarVisibility.Students, description: 'Mandatory orientation for all new students joining in Jan 2026.' },
    { id: 'sum1', title: 'Academic Council Meeting', date: '2025-12-20', type: CalendarEventType.Summons, location: 'Boardroom A', visibility: CalendarVisibility.SpecificUsers, targetUserIds: ['3'], description: 'Meeting with the dean regarding your research proposal.' }
];

const RUBRICS: Rubric[] = [
    {
        id: 'r1',
        instructorId: '2',
        instructorName: 'Instructor Sam',
        title: 'Institutional Writing Standard',
        scope: RubricScope.Account,
        criteria: [
            { id: 'c1', description: 'Grammar & Clarity', points: 20, levelDescriptions: { 'l1': 'Perfect', 'l2': 'Needs improvement' } }
        ],
        levels: [
            { id: 'l1', name: 'Expert', points: 20 },
            { id: 'l2', name: 'Basic', points: 10 }
        ]
    }
];

const DISPUTES: GradeDispute[] = [];

const INSTITUTIONS = [
    { name: 'University of Nairobi', slug: 'uon', logo: 'https://upload.wikimedia.org/wikipedia/en/5/5e/University_of_Nairobi_logo.png' },
    { name: 'Strathmore University', slug: 'strathmore', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Strathmore_University_Logo.png/220px-Strathmore_University_Logo.png' },
    { name: 'Kenyatta University', slug: 'ku', logo: 'https://upload.wikimedia.org/wikipedia/en/5/52/Kenyatta_University_Logo.png' },
    { name: 'Jomo Kenyatta University (JKUAT)', slug: 'jkuat', logo: 'https://upload.wikimedia.org/wikipedia/en/8/87/JKUAT_logo.png' },
    { name: 'United States International University', slug: 'usiu', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c9/USIU-Africa_Logo.png' },
    { name: 'Lizoku Demonstration Portal', slug: 'demo', logo: '' },
];

// --- API IMPLEMENTATIONS ---

export const findInstitutions = async (query: string) => {
    await delay(150);
    if (!query) return [];
    return INSTITUTIONS.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
};

export const getCalendarEvents = async (userId?: string, role?: UserRole): Promise<CalendarEvent[]> => {
    await delay(300);
    
    // Filtering Logic
    const visibleEvents = MOCK_CALENDAR_EVENTS.filter(event => {
        // Admins see everything
        if (role === UserRole.Admin) return true;

        // Targeted user check
        const isTargetedUser = event.visibility === CalendarVisibility.SpecificUsers && event.targetUserIds?.includes(userId || '');
        
        // Role check
        const matchesRole = (event.visibility === CalendarVisibility.Students && role === UserRole.Student) || 
                           (event.visibility === CalendarVisibility.Instructors && role === UserRole.Instructor);
        
        // Public check
        const isPublic = event.visibility === CalendarVisibility.Everyone;

        // Instructor also sees what they created
        const isCreator = event.createdBy === userId;
        
        return isPublic || matchesRole || isTargetedUser || isCreator;
    });
    
    // Generate events from courses
    const contentEvents: CalendarEvent[] = [];
    MOCK_COURSES.forEach(course => {
        // Enrolled/Teaching logic
        const isEnrolled = role !== UserRole.Student || ['3', '4'].includes(userId || '');
        const isTeaching = role !== UserRole.Instructor || course.instructorId === userId;
        const isVisible = role === UserRole.Admin || isEnrolled || isTeaching;

        if (isVisible) {
            course.modules?.forEach(mod => {
                mod.items.forEach(item => {
                    if (item.dueDate) {
                        contentEvents.push({
                            id: `item-${item.id}`,
                            title: item.title,
                            date: item.dueDate,
                            type: item.type === ContentType.Assignment ? CalendarEventType.Assignment : 
                                  item.type === ContentType.Quiz ? CalendarEventType.Quiz :
                                  item.type === ContentType.LiveSession ? CalendarEventType.LiveSession :
                                  CalendarEventType.OnSiteSession,
                            courseName: course.title,
                            courseId: course.id,
                            visibility: CalendarVisibility.SpecificUsers, // Handled internally by enrollment
                            description: item.instructions || `Deadline for ${item.title}`
                        });
                    }
                });
            });
        }
    });

    return [...visibleEvents, ...contentEvents];
};

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    await delay(500);
    const newEvent = { ...event, id: `e-${Date.now()}` };
    MOCK_CALENDAR_EVENTS.push(newEvent);
    return newEvent;
};

export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    await delay(500);
    const idx = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === id);
    if (idx !== -1) {
        MOCK_CALENDAR_EVENTS[idx] = { ...MOCK_CALENDAR_EVENTS[idx], ...updates };
        return MOCK_CALENDAR_EVENTS[idx];
    }
    return null;
};

export const deleteCalendarEvent = async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    const idx = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === id);
    if (idx !== -1) {
        MOCK_CALENDAR_EVENTS.splice(idx, 1);
        return { success: true };
    }
    return { success: false };
};

export const login = async (email: string, password?: string): Promise<User | null> => { 
    await delay(300); 
    return USERS.find(u => u.email === email) || null; 
};

export const getAllUsers = async (): Promise<User[]> => [...USERS];
export const createUser = async (userData: Partial<User>): Promise<User> => {
    const newUser: User = { id: `u-${Date.now()}`, name: '', email: '', role: UserRole.Student, status: UserStatus.Active, avatarUrl: '', createdAt: new Date().toISOString(), ...userData } as User;
    USERS.push(newUser);
    return newUser;
};

export const getInstructorCourses = async (instructorId: string) => MOCK_COURSES.filter(c => c.instructorId === instructorId);
export const getAllCourses = async (): Promise<Course[]> => [...MOCK_COURSES];
export const getCourseDetails = async (id: string) => MOCK_COURSES.find(c => c.id === id) || null;

export const createCourse = async (c: any): Promise<Course> => {
    const newCourse = { ...c, id: `c-${Date.now()}`, semesterName: 'Spring 2026', status: CourseStatus.Draft };
    MOCK_COURSES.push(newCourse);
    return newCourse;
};

export const getStudentCourses = async (studentId: string): Promise<CourseSummary[]> => {
    return MOCK_COURSES.map(c => ({
        id: c.id, offeringId: c.id, title: c.title, progress: c.progress, imageUrl: '', instructor: c.instructorName, semesterName: c.semesterName
    }));
};

export const getInstructorGradingSummary = async (instructorId: string): Promise<CourseGradingSummary[]> => {
    return MOCK_COURSES.filter(c => c.instructorId === instructorId).map(c => ({
        courseId: c.id, 
        courseTitle: c.title, 
        status: c.status,
        items: c.modules?.[0]?.items.map(i => ({ id: i.id, title: i.title, type: i.type, dueDate: i.dueDate!, totalEnrolled: 45, submittedCount: 1, gradedCount: 1 })) || []
    }));
};

export const finalizeGrades = async (courseId: string): Promise<boolean> => {
    await delay(500);
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (course) {
        course.status = CourseStatus.Finalized;
        return true;
    }
    return false;
};

export const unlockSession = async (courseId: string): Promise<boolean> => {
    await delay(500);
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (course) {
        course.status = CourseStatus.Grading;
        return true;
    }
    return false;
};

export const requestRegrade = async (gradeId: string, studentId: string, reason: string): Promise<GradeDispute> => {
    await delay(500);
    const dispute: GradeDispute = {
        id: `disp-${Date.now()}`,
        gradeId,
        studentId,
        studentReason: reason,
        status: DisputeStatus.Pending,
        createdAt: new Date().toISOString()
    };
    DISPUTES.push(dispute);
    return dispute;
};

export const getGradeDispute = async (disputeId: string): Promise<GradeDispute | null> => {
    await delay(200);
    return DISPUTES.find(d => d.id === disputeId) || null;
};

export const resolveDispute = async (disputeId: string, status: DisputeStatus, comment: string, newScore?: number): Promise<void> => {
    await delay(500);
};

export const toggleAllowRetake = async (studentId: string, contentItemId: string, allow: boolean): Promise<void> => {
    await delay(300);
};

export const getCourseGrades = async (courseId: string): Promise<any> => {
    return { gradableItems: [], studentGrades: [] };
};

export const getStudentGradesForCourse = async (studentId: string, courseId: string): Promise<any[]> => {
    return [];
};

export const getSubmissionDetails = async (submissionId: string): Promise<any> => {
    return { submission: null, grade: null, rubric: null, item: { title: 'Final Research Paper' } };
};

export const updateGrade = async (sid: string, cid: string, iid: string, score: number | null, reason: string = 'Standard update') => {
};

export const getNotifications = async (userId: string): Promise<Notification[]> => [];
export const markNotificationAsRead = async (id: string) => {};
export const markAllNotificationsAsRead = async (id: string) => {};
export const getRecentUsers = async (limit: number): Promise<User[]> => [...USERS].slice(-limit);
export const getSubmissionsForContentItem = async (itemId: string): Promise<StudentSubmissionDetails[]> => [];

export const getRubrics = async (instructorId: string): Promise<Rubric[]> => {
    await delay(300);
    // Return instructor-owned rubrics and institutional shared rubrics
    return RUBRICS.filter(r => r.instructorId === instructorId || r.scope === RubricScope.Account);
};

export const getRubricById = async (id: string): Promise<Rubric | null> => {
    await delay(100);
    return RUBRICS.find(r => r.id === id) || null;
};

export const createRubric = async (r: Omit<Rubric, 'id'>): Promise<Rubric> => {
    await delay(500);
    const newRubric = { ...r, id: `r-${Date.now()}` };
    RUBRICS.push(newRubric);
    return newRubric;
};

export const updateRubric = async (id: string, updates: Partial<Rubric>): Promise<Rubric | null> => {
    await delay(500);
    const idx = RUBRICS.findIndex(r => r.id === id);
    if (idx !== -1) {
        RUBRICS[idx] = { ...RUBRICS[idx], ...updates };
        return RUBRICS[idx];
    }
    return null;
};

export const deleteRubric = async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    const idx = RUBRICS.findIndex(r => r.id === id);
    if (idx !== -1) {
        RUBRICS.splice(idx, 1);
        return { success: true };
    }
    return { success: false };
};

export const getQuestions = async (id: string) => [];
export const gradeManualSubmission = async (id: string, data: any) => {};
export const getSecuritySettings = async (): Promise<SecuritySettings> => ({ enableAiFeatures: true, aiSafetyFilter: 'Medium', passwordPolicy: { minLength: true, requireUppercase: true, requireNumber: true } });
export const getAnnouncements = async (): Promise<Announcement[]> => [];
export const createAnnouncement = async (a: any) => a;
export const updateAnnouncement = async (id: string, a: any) => a;
export const deleteAnnouncement = async (id: string) => ({ success: true });
export const getDepartments = async () => DEPARTMENTS;
export const getPrograms = async () => PROGRAMS;
export const getSemesters = async (): Promise<Semester[]> => SEMESTERS;
export const createSemester = async (s: any) => s;
export const updateSemester = async (id: string, s: any) => s;

export const getOverdueItems = async (id: string): Promise<OverdueItem[]> => [
    { id: '1', title: 'Mid-Term Quiz', courseName: 'Intro to CS', dueDate: '2025-12-15', link: '/courses/c1-f25' }
];

export const getUpcomingDeadlines = async (id: string): Promise<UpcomingDeadline[]> => [
    { id: 'i1', title: 'Final Research Essay', courseName: 'Intro to CS', dueDate: '2025-12-20', type: 'assignment' },
    { id: 'live1', title: 'Exam Prep: Live Q&A', courseName: 'Intro to CS', dueDate: '2025-12-19T14:00:00Z', type: 'live' },
    { id: 'e1', title: 'End of Year Graduation 2025', courseName: 'Institutional', dueDate: '2025-12-22', type: 'on-site' }
];

export const getRecentActivity = async (id: string) => [];
export const getQuestionsByIds = async (ids: string[]) => [];
export const signupUser = async (u: any) => u;
export const updateCourseModules = async (id: string, m: any) => MOCK_COURSES[0];
export const updateCourse = async (id: string, d: any) => MOCK_COURSES[0];
export const uploadMediaItem = async (id: string, f: any) => ({} as any);
export const deleteMediaItem = async (id: string) => {};
export const updateMediaItemVisibility = async (id: string, v: any) => {};
export const getMessageThreads = async (id: string) => [];
export const getMessageThreadDetails = async (id: string) => null;
export const sendMessage = async (t: string, c: string, a: User) => ({} as any);
export const createNewThread = async (p: User[], s: string, c: string, a: User) => ({} as any);
export const getPostsForDiscussion = async (id: string) => [];
export const createDiscussionPost = async (i: string, c: string, a: User, p?: string) => ({} as any);
export const markDiscussionPostAsRead = async (id: string) => {};
export const getCertificateSettings = async () => ({} as any);
export const getCertificateRequests = async () => [];
export const approveCertificateRequest = async (id: string) => ({ success: true });
export const denyCertificateRequest = async (id: string) => ({ success: true });
export const getInstitutionSettings = async () => ({} as any);
export const terminateSession = async (id: string) => ({ success: true });
export const getEnrollmentReport = async () => [];
export const getCourseCompletionReport = async () => [];
export const getInstructorActivityReport = async () => [];
export const getGradeDistributionReport = async () => [];
export const sendNudge = async (id: string, m: any) => ({ success: true });
export const getJobOpportunities = async () => [];
export const getStudentApplications = async (id: string) => [];
export const applyForJob = async (s: string, j: string) => ({} as any);
export const submitSurvey = async (s: string, i: string, a: any) => {};
export const submitAssignment = async (s: string, c: string, i: string, f: any) => ({} as any);
export const submitQuiz = async (s: string, c: string, i: string, a: any) => ({} as any);
export const restoreCourseVersion = async (c: string, v: string) => MOCK_COURSES[0];
export const getContentItemDetails = async (id: string) => ({ id, content: 'Final prep before the winter break.' });
export const updateContentItemDetails = async (id: string, c: string) => {};
export const updateSecuritySettings = async (s: any) => {};
export const updateInstitutionSettings = async (s: any) => {};
export const updateCertificateSettings = async (s: any) => {};
export const createDepartment = async (d: any) => DEPARTMENTS[0];
export const createProgram = async (p: any) => ({ id: 'p2' } as any);
export const createQuestion = async (q: any) => ({} as any);
// Fix: Removed duplicate createRubric function declaration.
export const createExamination = async (e: any) => ({} as any);
export const sendCommunication = async (c: any) => ({} as any);
export const getCommunications = async () => [];
export const updateUser = async (id: string, u: any) => USERS[0];
export const updateDepartment = async (id: string, d: any) => DEPARTMENTS[0];
export const updateProgram = async (id: string, p: any) => ({} as any);
export const updateQuestion = async (id: string, q: any) => ({} as any);
export const updateExamination = async (id: string, e: any) => ({} as any);
export const deleteUser = async (id: string) => ({ success: true });
export const deleteDepartment = async (id: string) => ({ success: true });
export const deleteProgram = async (id: string) => ({ success: true });
export const deleteSemester = async (id: string) => ({ success: true });
export const deleteCourse = async (id: string) => ({ success: true });
export const deleteQuestion = async (id: string) => ({ success: true });
export const deleteExamination = async (id: string) => ({ success: true });
export const changeUserPassword = async (id: string, c: string, n: string) => ({ success: true, message: 'Done' });
export const getAllInstructors = async () => USERS.filter(u => u.role === UserRole.Instructor);
export const getAdminAllExaminations = async () => [];
export const getInstructorExaminations = async (instructorId: string) => [];
export const getExaminationDetails = async (id: string) => null;
export const submitExamination = async (sid: string, eid: string, a: any) => ({} as any);
export const getRegionalStats = async (): Promise<RegionalStat[]> => [];
export const getDepartmentBudgets = async (): Promise<DepartmentBudget[]> => [];
export const getBudgetRequests = async (): Promise<BudgetRequest[]> => [];
export const getFinancialTrends = async (): Promise<FinancialTrend[]> => [];
export const getAtRiskStudents = async (instructorId: string): Promise<AtRiskStudent[]> => [];
export const getMediaItems = async (instructorId: string): Promise<MediaItem[]> => [];
export const getPublicMediaItems = async (currentInstructorId: string): Promise<any[]> => [];
export const getSurveyResults = async (surveyId: string): Promise<SurveySummary | null> => null;
export const getCourseLeaderboard = async (courseId: string, currentUserId: string): Promise<LeaderboardEntry[]> => [];
export const getCourseHistory = async (courseId: string): Promise<VersionHistoryEntry[]> => [];
export const getActiveSessions = async (): Promise<UserSession[]> => [];
export const getActivityLogs = async (): Promise<ActivityLog[]> => [];
export const getStudentSubmissionsForContent = async (studentId: string, contentItemId: string): Promise<QuizSubmission[]> => [];
export const getAssignmentSubmissionForStudent = async (studentId: string, contentItemId: string): Promise<AssignmentSubmission | null> => null;
export const getStudentTranscript = async (studentId: string): Promise<StudentTranscript | null> => null;
export const getStudentProgramDetails = async (studentId: string): Promise<StudentProgramDetails | null> => ({
    program: PROGRAMS[0],
    progress: 85,
    courses: MOCK_COURSES.map(c => ({ ...c, enrollmentStatus: 'in_progress', finalGrade: null }))
});
export const getStudentCertificates = async (studentId: string): Promise<Certificate[]> => [];
export const getStudentAchievements = async (studentId: string): Promise<Achievement[]> => [];
export const getAllQuestionsForAdmin = async (): Promise<any[]> => [];
export const getPublicQuestionsFromOthers = async (userId: string): Promise<any[]> => [];
export const getLatestAnnouncement = async (): Promise<Announcement | null> => null;

export const getDashboardAnalytics = async (): Promise<any> => ({
    userGrowth: [
        { label: 'Jul', value: 800 },
        { label: 'Aug', value: 950 },
        { label: 'Sep', value: 1100 },
        { label: 'Oct', value: 1200 },
        { label: 'Nov', value: 1250 },
        { label: 'Dec', value: 1290 },
    ],
    roleDistribution: [
        { label: 'Students', value: 1200 },
        { label: 'Instructors', value: 85 },
        { label: 'Admins', value: 5 },
    ],
    activityByDay: [
        { label: 'Mon', value: 450 },
        { label: 'Tue', value: 520 },
        { label: 'Wed', value: 490 },
        { label: 'Thu', value: 600 },
        { label: 'Fri', value: 550 },
        { label: 'Sat', value: 200 },
        { label: 'Sun', value: 150 },
    ]
});

export const getAdminStats = async (): Promise<StatCardData[]> => [
    { icon: 'Users', title: 'Total Users', value: '1,290', color: 'primary' },
    { icon: 'Book', title: 'Active Courses', value: '45', color: 'secondary' },
    { icon: 'GraduationCap', title: 'Certificates Issued', value: '312', color: 'success' },
    { icon: 'Shield', title: 'Security Alerts', value: '0', color: 'info' },
];

export const getInstructorStats = async (instructorId: string): Promise<StatCardData[]> => [
    { icon: 'Users', title: 'Total Students', value: '450', color: 'primary' },
    { icon: 'BookOpen', title: 'My Courses', value: '6', color: 'secondary' },
    { icon: 'PenSquare', title: 'Pending Marks', value: '12', color: 'warning' },
    { icon: 'TrendingUp' as any, title: 'Avg. Attendance', value: '88%', color: 'success' },
];

export const updateDepartmentBudget = async (id: string, amount: number) => ({ success: true });
export const approveBudgetRequest = async (id: string) => ({ success: true });
export const rejectBudgetRequest = async (id: string) => ({ success: true });
export const getStudentSubmissionsForContentItem = async (studentId: string, contentItemId: string) => [];