import {
    User, UserRole, UserStatus, StatCardData, CourseSummary, Department, Program, Semester, SemesterStatus, Course, CourseStatus, Module, ContentItem, ContentType, Announcement, Enrollment, Grade, CalendarEvent, CalendarEventType, DiscussionPost, Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, QuizSubmission, MultipleSelectQuestion, FillBlankQuestion, Rubric, RubricScope, StudentProgramDetails, ProgramCourse, Communication, SecuritySettings, StudentTranscript, Message, MessageThread, Examination, ExaminationStatus, Certificate, Achievement, CertificateSettings, CertificateRequest, CertificateRequestStatus, InstitutionSettings, ActivityLog, ActivityActionType, UserSession, Notification, NotificationType, OverdueItem, UpcomingDeadline, RecentActivity, ContentItemDetails, AssignmentSubmission, Submission, QuestionDifficulty, MediaItem, MediaType, CourseGradingSummary, GradableItemSummary, StudentSubmissionDetails, RubricCriterion, RubricLevel, AtRiskStudent, JobOpportunity, JobType, JobApplication, ApplicationStatus, SurveySubmission, SurveySummary, SurveyQuestionType, LeaderboardEntry, DepartmentBudget, BudgetRequest, FinancialTrend, RegionalStat, VersionHistoryEntry, DeliveryMode, DisputeStatus, GradeDispute, CalendarVisibility
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATA STORAGE ---
const USERS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@lizoku.com', role: UserRole.Admin, avatarUrl: 'https://i.pravatar.cc/150?u=admin', status: UserStatus.Active, createdAt: '2025-01-01', county: 'Nairobi' },
    { id: '2', name: 'Instructor Sam', email: 'sam@lizoku.com', role: UserRole.Instructor, avatarUrl: 'https://i.pravatar.cc/150?u=sam', status: UserStatus.Active, createdAt: '2025-01-02', county: 'Mombasa' },
    { id: '3', name: 'Alice Topstudent', email: 'alice@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=alice', status: UserStatus.Active, createdAt: '2025-01-03', programId: 'p1', county: 'Nairobi' },
    { id: '4', name: 'John Average', email: 'john@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=john', status: UserStatus.Active, createdAt: '2025-01-05', programId: 'p1', county: 'Kiambu' },
];

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
                    { id: 'd1-item', title: 'Weekly Reflection: AI Impact', type: ContentType.Discussion, dueDate: '2025-12-19', isGraded: true, pointsPossible: 10 },
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

// --- AUTH & USER API ---
export const login = async (email: string, password?: string): Promise<User | null> => { 
    await delay(300); 
    return USERS.find(u => u.email === email) || null; 
};

export const findInstitutions = async (query: string) => {
    await delay(150);
    if (!query) return [];
    const institutions = [
        { name: 'University of Nairobi', slug: 'uon', logo: 'https://upload.wikimedia.org/wikipedia/en/5/5e/University_of_Nairobi_logo.png' },
        { name: 'Strathmore University', slug: 'strathmore', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Strathmore_University_Logo.png/220px-Strathmore_University_Logo.png' },
        { name: 'Lizoku Demonstration Portal', slug: 'demo', logo: '' },
    ];
    return institutions.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
};

export const getAllUsers = async (): Promise<User[]> => [...USERS];
export const createUser = async (userData: Partial<User>): Promise<User> => {
    const newUser = { id: `u-${Date.now()}`, createdAt: new Date().toISOString(), ...userData } as User;
    USERS.push(newUser);
    return newUser;
};
export const updateUser = async (id: string, u: any) => {
    const idx = USERS.findIndex(x => x.id === id);
    if (idx !== -1) USERS[idx] = { ...USERS[idx], ...u };
    return USERS[idx];
};
export const signupUser = async (u: any) => createUser(u);
export const deleteUser = async (id: string) => {
    const idx = USERS.findIndex(x => x.id === id);
    if (idx !== -1) USERS.splice(idx, 1);
    return { success: true };
};
export const changeUserPassword = async (id: string, c: string, n: string) => ({ success: true, message: 'Password updated successfully.' });

// --- ACADEMIC STRUCTURE API ---
export const getDepartments = async () => DEPARTMENTS;
export const createDepartment = async (d: any) => {
    const newDept = { ...d, id: `d-${Date.now()}`, programCount: 0 };
    DEPARTMENTS.push(newDept);
    return newDept;
};
export const updateDepartment = async (id: string, d: any) => {
    const idx = DEPARTMENTS.findIndex(x => x.id === id);
    if (idx !== -1) DEPARTMENTS[idx] = { ...DEPARTMENTS[idx], ...d };
    return DEPARTMENTS[idx];
};
export const deleteDepartment = async (id: string) => ({ success: true });

export const getPrograms = async () => PROGRAMS;
export const createProgram = async (p: any) => {
    const newProg = { ...p, id: `p-${Date.now()}`, courseCount: 0 };
    PROGRAMS.push(newProg);
    return newProg;
};
export const updateProgram = async (id: string, p: any) => {
    const idx = PROGRAMS.findIndex(x => x.id === id);
    if (idx !== -1) PROGRAMS[idx] = { ...PROGRAMS[idx], ...p };
    return PROGRAMS[idx];
};
export const deleteProgram = async (id: string) => ({ success: true });

export const getSemesters = async (): Promise<Semester[]> => SEMESTERS;
export const createSemester = async (s: any) => {
    const newSem = { ...s, id: `s-${Date.now()}`, status: SemesterStatus.Upcoming };
    SEMESTERS.push(newSem);
    return newSem;
};
export const updateSemester = async (id: string, s: any) => {
    const idx = SEMESTERS.findIndex(x => x.id === id);
    if (idx !== -1) SEMESTERS[idx] = { ...SEMESTERS[idx], ...s };
    return SEMESTERS[idx];
};
export const deleteSemester = async (id: string) => ({ success: true });

// --- COURSE & CONTENT API ---
export const getAllCourses = async (): Promise<Course[]> => [...MOCK_COURSES];
export const getCourseDetails = async (id: string) => MOCK_COURSES.find(c => c.id === id) || null;
export const getInstructorCourses = async (instructorId: string) => MOCK_COURSES.filter(c => c.instructorId === instructorId);

export const getStudentCourses = async (userId: string): Promise<CourseSummary[]> => {
    await delay(300);
    return MOCK_COURSES.map(c => ({
        id: c.id,
        offeringId: c.id,
        title: c.title,
        progress: c.progress,
        imageUrl: '',
        students: c.students,
        instructor: c.instructorName,
        semesterName: c.semesterName,
        deliveryMode: c.deliveryMode
    }));
};

export const createCourse = async (c: any): Promise<Course> => {
    const newCourse = { ...c, id: `c-${Date.now()}`, semesterName: 'Spring 2026', status: CourseStatus.Draft };
    MOCK_COURSES.push(newCourse);
    return newCourse;
};
export const updateCourse = async (id: string, d: any) => {
    const idx = MOCK_COURSES.findIndex(x => x.id === id);
    if (idx !== -1) MOCK_COURSES[idx] = { ...MOCK_COURSES[idx], ...d };
    return MOCK_COURSES[idx];
};
export const updateCourseModules = async (id: string, m: any) => { 
    const c = MOCK_COURSES.find(x => x.id === id); 
    if(c) c.modules = m; 
    return c || MOCK_COURSES[0]; 
};
export const deleteCourse = async (id: string) => ({ success: true });

export const getContentItemDetails = async (id: string) => ({ id, content: '<div class="lesson-section-header">Module Introduction</div><p>Welcome to the core learning module.</p>' });
export const updateContentItemDetails = async (id: string, c: string) => ({ success: true });

// --- CALENDAR API ---
export const getCalendarEvents = async (userId?: string, role?: UserRole): Promise<CalendarEvent[]> => {
    await delay(300);
    return [];
};
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => ({ ...event, id: 'temp' });
export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => ({ id, ...updates });
export const deleteCalendarEvent = async (id: string) => ({ success: true });

// --- GRADING & SUBMISSIONS ---
export const getCourseGrades = async (courseId: string) => ({ gradableItems: [], studentGrades: [] });
export const getStudentGradesForCourse = async (studentId: string, courseId: string) => [];
export const updateGrade = async (sid: string, cid: string, iid: string, score: number | null, reason?: string) => ({ success: true });
export const finalizeGrades = async (courseId: string) => true;
export const unlockSession = async (courseId: string) => true;
export const getGradeDispute = async (id: string) => null;
export const resolveDispute = async (id: string, s: any, c: string, n?: number) => {};
export const requestRegrade = async (g: string, s: string, r: string) => ({ id: '1', gradeId: g, studentId: s, studentReason: r, status: DisputeStatus.Pending, createdAt: new Date().toISOString() });

// Fix: Updated mock implementation to return a complete Submission object and valid Grade/Item references to satisfy type safety in components using this API.
export const getSubmissionDetails = async (id: string): Promise<{ submission: Submission; grade: Grade | null; rubric: Rubric | null; item: ContentItem }> => {
    await delay(300);
    const submission: AssignmentSubmission = {
        id: 'sub-1',
        type: 'assignment',
        studentId: '3',
        courseId: 'c1-f25',
        contentItemId: 'i1',
        submittedAt: new Date().toISOString(),
        file: { name: 'essay.pdf', size: 1024, url: '#' },
        textContent: 'This is a mock student submission content for grading purposes.'
    };
    return {
        submission,
        grade: {
            id: 'g1',
            studentId: '3',
            courseId: 'c1-f25',
            contentItemId: 'i1',
            score: null,
            status: 'pending review',
            submissionId: 'sub-1'
        },
        rubric: RUBRICS[0],
        item: MOCK_COURSES[0].modules![0].items[0]
    };
};

export const getSubmissionsForContentItem = async (id: string): Promise<StudentSubmissionDetails[]> => [];
export const getStudentSubmissionsForContent = async (sid: string, iid: string) => [];
export const getAssignmentSubmissionForStudent = async (sid: string, iid: string) => null;
export const submitQuiz = async (sid: string, cid: string, iid: string, a: any) => ({ status: 'graded', score: 85 } as any);
export const submitAssignment = async (sid: string, cid: string, iid: string, f: any) => ({ submittedAt: new Date().toISOString(), file: f } as any);
export const gradeManualSubmission = async (id: string, data: any) => ({ success: true });

// --- DISCUSSION API ---
export const getPostsForDiscussion = async (id: string): Promise<DiscussionPost[]> => [];
export const createDiscussionPost = async (id: string, content: string, author: User, parentId?: string): Promise<DiscussionPost> => ({} as any);
export const markDiscussionPostAsRead = async (id: string) => {};

// --- MISC SYSTEM API ---
export const getNotifications = async (id: string) => [];
export const markNotificationAsRead = async (id: string) => {};
export const markAllNotificationsAsRead = async (id: string) => {};
export const getAnnouncements = async () => [];
export const getLatestAnnouncement = async () => null;
export const createAnnouncement = async (a: any) => a;
export const updateAnnouncement = async (id: string, a: any) => a;
export const deleteAnnouncement = async (id: string) => ({ success: true });

export const getAdminStats = async () => [];
export const getInstructorStats = async (id: string) => [];
export const getDashboardAnalytics = async () => ({ userGrowth: [], roleDistribution: [], activityByDay: [] });

export const getRegionalStats = async (): Promise<RegionalStat[]> => [];
export const getDepartmentBudgets = async (): Promise<DepartmentBudget[]> => [];
export const getBudgetRequests = async (): Promise<BudgetRequest[]> => [];
export const updateDepartmentBudget = async (id: string, amount: number) => {};
export const approveBudgetRequest = async (id: string) => {};
export const rejectBudgetRequest = async (id: string) => {};
export const getFinancialTrends = async (): Promise<FinancialTrend[]> => [];

export const getOverdueItems = async (userId: string): Promise<OverdueItem[]> => [];
export const getUpcomingDeadlines = async (userId: string): Promise<UpcomingDeadline[]> => [];
export const getRecentActivity = async (userId: string): Promise<RecentActivity[]> => [];
export const getInstructorGradingSummary = async (id: string): Promise<CourseGradingSummary[]> => [];
export const getRecentUsers = async (l: number) => USERS.slice(-l);

export const getSecuritySettings = async (): Promise<SecuritySettings> => ({ enableAiFeatures: true, aiSafetyFilter: 'Medium', passwordPolicy: { minLength: true, requireUppercase: true, requireNumber: true } });
export const updateSecuritySettings = async (s: any) => {};

export const getInstitutionSettings = async (): Promise<InstitutionSettings> => ({ institutionName: 'Lizoku LMS', logoUrl: '', primaryColor: '#FFD700' });
export const updateInstitutionSettings = async (s: any) => {};

export const getCertificateSettings = async (): Promise<CertificateSettings> => ({ logoUrl: '', signatureImageUrl: '', signatureSignerName: '', signatureSignerTitle: '', primaryColor: '#FFD700', autoIssueOnCompletion: true });
export const updateCertificateSettings = async (s: any) => {};
export const getCertificateRequests = async () => [];
export const approveCertificateRequest = async (id: string) => ({ success: true });
export const denyCertificateRequest = async (id: string) => ({ success: true });

export const getMessageThreads = async (id: string) => [];
export const getMessageThreadDetails = async (id: string) => null;
export const sendMessage = async (tid: string, c: string, a: User) => ({} as any);
export const createNewThread = async (p: User[], s: string, c: string, a: User) => ({} as any);

export const getRubrics = async (id: string) => RUBRICS;
export const getRubricById = async (id: string) => RUBRICS.find(r => r.id === id) || null;
export const createRubric = async (r: any) => r;
export const updateRubric = async (id: string, r: any) => r;
export const deleteRubric = async (id: string) => ({ success: true });

export const getQuestions = async (id: string) => [];
export const getQuestionsByIds = async (ids: string[]) => [];
export const createQuestion = async (q: any) => q;
export const updateQuestion = async (id: string, q: any) => q;
export const deleteQuestion = async (id: string) => ({ success: true });
export const getAllQuestionsForAdmin = async () => [];
export const getPublicQuestionsFromOthers = async (id: string) => [];

export const getInstructorExaminations = async (id: string) => [];
export const getAdminAllExaminations = async () => [];
export const createExamination = async (e: any) => e;
export const updateExamination = async (id: string, e: any) => e;
export const deleteExamination = async (id: string) => ({ success: true });
export const getExaminationDetails = async (id: string) => null;
export const submitExamination = async (sid: string, eid: string, a: any) => ({} as any);

export const getCommunications = async () => [];
export const sendCommunication = async (c: any) => c;
export const getActivityLogs = async () => [];
export const getActiveSessions = async () => [];
export const terminateSession = async (id: string) => ({ success: true });

export const getEnrollmentReport = async () => [];
export const getCourseCompletionReport = async () => [];
export const getInstructorActivityReport = async () => [];
export const getGradeDistributionReport = async () => [];

export const getJobOpportunities = async () => [];
export const getStudentApplications = async (id: string) => [];
export const applyForJob = async (sid: string, jid: string) => ({} as any);

export const getStudentProgramDetails = async (id: string) => null;
export const getStudentTranscript = async (id: string) => null;
export const getStudentCertificates = async (id: string) => [];
export const getStudentAchievements = async (id: string) => [];
export const getAtRiskStudents = async (id: string): Promise<AtRiskStudent[]> => [];
export const sendNudge = async (sid: string, m: string) => ({ success: true });
export const toggleAllowRetake = async (sid: string, iid: string, a: boolean) => {};
export const getCourseLeaderboard = async (cid: string, uid: string) => [];
export const getCourseHistory = async (id: string) => [];
export const restoreCourseVersion = async (id: string, vid: string) => MOCK_COURSES[0];
export const getSurveyResults = async (id: string) => null;
export const submitSurvey = async (sid: string, iid: string, a: any) => {};

export const getMediaItems = async (id: string) => [];
export const getPublicMediaItems = async (id: string) => [];
export const uploadMediaItem = async (id: string, f: any) => ({} as any);
export const deleteMediaItem = async (id: string) => {};
export const updateMediaItemVisibility = async (id: string, v: any) => {};
export const getAllInstructors = async () => USERS.filter(u => u.role === UserRole.Instructor);