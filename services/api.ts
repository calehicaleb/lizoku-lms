
import {
    User, UserRole, UserStatus, StatCardData, CourseSummary, Department, Program, Semester, SemesterStatus, Course, CourseStatus, Module, ContentType, ContentItem, Announcement, Enrollment, Grade, CalendarEvent, CalendarEventType, DiscussionPost, Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, QuizSubmission, MultipleSelectQuestion, FillBlankQuestion, Rubric, StudentProgramDetails, ProgramCourse, Communication, SecuritySettings, StudentTranscript, Message, MessageThread, Examination, ExaminationStatus, Certificate, Achievement, CertificateSettings, CertificateRequest, CertificateRequestStatus, InstitutionSettings, ActivityLog, ActivityActionType, UserSession, Notification, NotificationType, OverdueItem, UpcomingDeadline, RecentActivity, IconName, ContentItemDetails, AssignmentSubmission, Submission, QuestionDifficulty, MediaItem, MediaType, CourseGradingSummary, GradableItemSummary, StudentSubmissionDetails, RubricCriterion, RubricLevel, AtRiskStudent, JobOpportunity, JobType, JobApplication, ApplicationStatus, SurveySubmission, SurveySummary, SurveyQuestionType, LeaderboardEntry, DepartmentBudget, BudgetRequest, FinancialTrend, RegionalStat
} from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. USERS (15 Users) with Counties ---
const USERS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@lizoku.com', role: UserRole.Admin, avatarUrl: 'https://i.pravatar.cc/150?u=admin', status: UserStatus.Active, createdAt: '2023-01-01', county: 'Nairobi' },
    { id: '2', name: 'Instructor Sam', email: 'sam@lizoku.com', role: UserRole.Instructor, avatarUrl: 'https://i.pravatar.cc/150?u=sam', status: UserStatus.Active, createdAt: '2023-01-02', county: 'Mombasa' },
    { id: 'instr2', name: 'Prof. Jane Smith', email: 'jane@lizoku.com', role: UserRole.Instructor, avatarUrl: 'https://i.pravatar.cc/150?u=jane', status: UserStatus.Active, createdAt: '2023-02-15', county: 'Kisumu' },
    { id: 'instr3', name: 'Dr. Albert Newton', email: 'albert@lizoku.com', role: UserRole.Instructor, avatarUrl: 'https://i.pravatar.cc/150?u=albert', status: UserStatus.Active, createdAt: '2023-03-10', county: 'Nakuru' },
    
    // Students
    { id: '3', name: 'Alice Topstudent', email: 'alice@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=alice', status: UserStatus.Active, createdAt: '2023-01-03', programId: 'p1', county: 'Nairobi' },
    { id: '4', name: 'John Average', email: 'john@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=john', status: UserStatus.Active, createdAt: '2023-01-05', programId: 'p1', county: 'Kiambu' },
    { id: '5', name: 'Sarah Struggling', email: 'sarah@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=sarah', status: UserStatus.Active, createdAt: '2023-01-06', programId: 'p1', county: 'Machakos' },
    { id: '6', name: 'Mike Missing', email: 'mike@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=mike', status: UserStatus.Active, createdAt: '2023-01-07', programId: 'p1', county: 'Kajiado' },
    { id: 's5', name: 'Emily Chen', email: 'emily@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=emily', status: UserStatus.Active, createdAt: '2023-01-08', programId: 'p2', county: 'Uasin Gishu' },
    { id: 's6', name: 'David Kim', email: 'david@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=david', status: UserStatus.Active, createdAt: '2023-01-09', programId: 'p2', county: 'Nairobi' },
    { id: 's7', name: 'Chris Evans', email: 'chris@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=chris', status: UserStatus.Active, createdAt: '2023-01-10', programId: 'p1', county: 'Mombasa' },
    { id: 's8', name: 'Jessica Jones', email: 'jessica@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=jessica', status: UserStatus.Active, createdAt: '2023-01-11', programId: 'p3', county: 'Kilifi' },
    { id: 's9', name: 'Kevin Hart', email: 'kevin@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=kevin', status: UserStatus.Active, createdAt: '2023-01-12', programId: 'p1', county: 'Garissa' },
    { id: 's10', name: 'Laura Croft', email: 'laura@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=laura', status: UserStatus.Active, createdAt: '2023-01-13', programId: 'p2', county: 'Turkana' },
    { id: 's11', name: 'Brian O\'Connor', email: 'brian@lizoku.com', role: UserRole.Student, avatarUrl: 'https://i.pravatar.cc/150?u=brian', status: UserStatus.Active, createdAt: '2023-01-14', programId: 'p3', county: 'Nyeri' },
];

const STUDENT_IDS = USERS.filter(u => u.role === UserRole.Student).map(u => u.id);

// --- 2. ACADEMICS ---
const DEPARTMENTS: Department[] = [
    { id: 'd1', name: 'School of Computing', head: 'Dr. Smith', programCount: 3 },
    { id: 'd2', name: 'Business School', head: 'Dr. Jones', programCount: 2 },
    { id: 'd3', name: 'School of Design', head: 'Prof. Lee', programCount: 1 },
    { id: 'd4', name: 'Faculty of Engineering', head: 'Eng. Rotich', programCount: 2 },
    { id: 'd5', name: 'Health Sciences', head: 'Dr. Achieng', programCount: 1 },
];

const PROGRAMS: Program[] = [
    { id: 'p1', name: 'BSc Computer Science', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 40, duration: '4 Years', courseIds: ['c1', 'c2'] },
    { id: 'p2', name: 'Diploma in IT', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 20, duration: '2 Years', courseIds: [] },
    { id: 'p3', name: 'Business Administration', departmentId: 'd2', departmentName: 'Business School', courseCount: 35, duration: '4 Years', courseIds: ['c3'] },
    { id: 'p4', name: 'Graphic Design', departmentId: 'd3', departmentName: 'School of Design', courseCount: 25, duration: '3 Years', courseIds: ['c4'] },
    { id: 'p5', name: 'Civil Engineering', departmentId: 'd4', departmentName: 'Faculty of Engineering', courseCount: 50, duration: '5 Years', courseIds: ['c5'] },
];

const SEMESTERS: Semester[] = [
    { id: 'sem1', name: 'Fall 2024', startDate: '2024-09-01', endDate: '2024-12-15', status: SemesterStatus.Active },
    { id: 'sem2', name: 'Spring 2025', startDate: '2025-01-10', endDate: '2025-04-30', status: SemesterStatus.Upcoming },
    { id: 'sem3', name: 'Summer 2024', startDate: '2024-05-01', endDate: '2024-08-15', status: SemesterStatus.Past },
];

// --- 3. QUESTIONS (20 Questions) ---
const QUESTIONS: Question[] = [
    { id: 'q1', instructorId: '2', stem: 'What does HTML stand for?', type: QuestionType.MultipleChoice, difficulty: QuestionDifficulty.Easy, topics: ['Web'], options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correctAnswerIndex: 0, isPublic: true },
    { id: 'q2', instructorId: '2', stem: 'The sky is blue.', type: QuestionType.TrueFalse, difficulty: QuestionDifficulty.Easy, topics: ['General'], correctAnswer: true, isPublic: true },
    { id: 'q3', instructorId: '2', stem: 'Explain the concept of closure in JavaScript.', type: QuestionType.ShortAnswer, difficulty: QuestionDifficulty.Hard, topics: ['JS'], acceptableAnswers: [], isPublic: false },
    { id: 'q4', instructorId: '2', stem: 'Which of the following are JS frameworks?', type: QuestionType.MultipleSelect, difficulty: QuestionDifficulty.Medium, topics: ['JS'], options: ['React', 'Vue', 'Django', 'Laravel'], correctAnswerIndices: [0, 1], isPublic: true },
    { id: 'q5', instructorId: '2', stem: 'CSS stands for Cascading ___ Sheets.', type: QuestionType.FillBlank, difficulty: QuestionDifficulty.Easy, topics: ['Web'], acceptableAnswers: ['Style'], isPublic: true },
    { id: 'q6', instructorId: '2', stem: 'What is the time complexity of binary search?', type: QuestionType.MultipleChoice, difficulty: QuestionDifficulty.Medium, topics: ['Algo'], options: ['O(n)', 'O(log n)', 'O(n^2)'], correctAnswerIndex: 1, isPublic: true },
    { id: 'q7', instructorId: '2', stem: 'React is a library for building user interfaces.', type: QuestionType.TrueFalse, difficulty: QuestionDifficulty.Easy, topics: ['React'], correctAnswer: true, isPublic: true },
    { id: 'q8', instructorId: '2', stem: 'Define polymorphism in OOP.', type: QuestionType.ShortAnswer, difficulty: QuestionDifficulty.Hard, topics: ['OOP'], acceptableAnswers: [], isPublic: false },
    { id: 'q9', instructorId: '2', stem: 'Select all prime numbers.', type: QuestionType.MultipleSelect, difficulty: QuestionDifficulty.Medium, topics: ['Math'], options: ['2', '4', '11', '15'], correctAnswerIndices: [0, 2], isPublic: true },
    { id: 'q10', instructorId: '2', stem: 'HTTP stands for Hyper Text ___ Protocol.', type: QuestionType.FillBlank, difficulty: QuestionDifficulty.Easy, topics: ['Web'], acceptableAnswers: ['Transfer'], isPublic: true },
    { id: 'q11', instructorId: 'instr2', stem: 'What is the capital of Kenya?', type: QuestionType.MultipleChoice, difficulty: QuestionDifficulty.Easy, topics: ['Geo'], options: ['Mombasa', 'Kisumu', 'Nairobi'], correctAnswerIndex: 2, isPublic: true },
    { id: 'q12', instructorId: 'instr2', stem: 'Supply and Demand determine price.', type: QuestionType.TrueFalse, difficulty: QuestionDifficulty.Easy, topics: ['Econ'], correctAnswer: true, isPublic: true },
    { id: 'q13', instructorId: 'instr2', stem: 'List 3 marketing strategies.', type: QuestionType.ShortAnswer, difficulty: QuestionDifficulty.Medium, topics: ['Marketing'], acceptableAnswers: [], isPublic: true },
    { id: 'q14', instructorId: 'instr3', stem: 'Which are primary colors?', type: QuestionType.MultipleSelect, difficulty: QuestionDifficulty.Easy, topics: ['Art'], options: ['Red', 'Green', 'Blue', 'Yellow'], correctAnswerIndices: [0, 2, 3], isPublic: true }, // RYB model
    { id: 'q15', instructorId: 'instr3', stem: 'Force equals Mass times ___.', type: QuestionType.FillBlank, difficulty: QuestionDifficulty.Medium, topics: ['Physics'], acceptableAnswers: ['Acceleration'], isPublic: true },
    { id: 'q16', instructorId: 'instr3', stem: 'Contrast is a key principle of design.', type: QuestionType.TrueFalse, difficulty: QuestionDifficulty.Easy, topics: ['Design'], correctAnswer: true, isPublic: true },
    { id: 'q17', instructorId: '2', stem: 'Which sorting algorithm is the fastest on average?', type: QuestionType.MultipleChoice, difficulty: QuestionDifficulty.Medium, topics: ['Algo'], options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort'], correctAnswerIndex: 1, isPublic: true },
    { id: 'q18', instructorId: '2', stem: 'What is a foreign key in SQL?', type: QuestionType.ShortAnswer, difficulty: QuestionDifficulty.Medium, topics: ['DB'], acceptableAnswers: [], isPublic: true },
    { id: 'q19', instructorId: 'instr2', stem: 'Which of these are social media platforms?', type: QuestionType.MultipleSelect, difficulty: QuestionDifficulty.Easy, topics: ['Marketing'], options: ['Twitter', 'Excel', 'Instagram', 'Word'], correctAnswerIndices: [0, 2], isPublic: true },
    { id: 'q20', instructorId: 'instr3', stem: 'The structural element that spans horizontally is a ___.', type: QuestionType.FillBlank, difficulty: QuestionDifficulty.Medium, topics: ['Eng'], acceptableAnswers: ['Beam'], isPublic: true },
];

// --- 4. COURSES & CONTENT (Added Prices for Financial Tracking) ---
const MOCK_COURSES: Course[] = [
    { 
        id: 'c1', title: 'Intro to Computer Science', description: 'Comprehensive introduction to programming concepts, algorithms, and data structures using Python.', 
        instructorId: '2', instructorName: 'Instructor Sam', departmentId: 'd1', departmentName: 'School of Computing', 
        status: CourseStatus.Published, students: 45, progress: 0, price: 35000,
        modules: [
            { 
                id: 'm1', title: 'Week 1: Introduction & Setup', 
                items: [
                    { id: 'i1-1', title: 'Course Syllabus', type: ContentType.Lesson },
                    { id: 'i1-2', title: 'Setting up Python', type: ContentType.Lesson },
                    { id: 'i1-3', title: 'First Program Quiz', type: ContentType.Quiz, questionIds: ['q1', 'q2', 'q17'], timeLimit: 15, attemptsLimit: 3, randomizeQuestions: true },
                    { id: 'i1-4', title: 'Introduce Yourself', type: ContentType.Discussion }
                ] 
            },
            {
                id: 'm2', title: 'Week 2: Variables & Data Types',
                items: [
                    { id: 'i2-1', title: 'Variables Lecture', type: ContentType.InteractiveVideo, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', interactions: [ { id: 'v1', timestamp: 10, question: QUESTIONS[0] } ] },
                    { id: 'i2-2', title: 'Data Types Assignment', type: ContentType.Assignment, dueDate: '2024-10-15T23:59:00', requiresFileUpload: true },
                    { id: 'i2-3', title: 'Practice Problems', type: ContentType.Quiz, questionIds: ['q5', 'q6', 'q10'] }
                ]
            },
            {
                id: 'm3', title: 'Week 3: Control Flow',
                items: [
                    { id: 'i3-1', title: 'If Statements', type: ContentType.Lesson },
                    { id: 'i3-2', title: 'Looping Constructs', type: ContentType.Lesson },
                    { id: 'i3-3', title: 'Logic Quiz', type: ContentType.Quiz, questionIds: ['q7', 'q8'] }
                ]
            }
        ]
    },
    { 
        id: 'c2', title: 'Digital Marketing Strategy', description: 'Learn how to create effective digital marketing campaigns, SEO, and social media strategies.', 
        instructorId: 'instr2', instructorName: 'Prof. Jane Smith', departmentId: 'd2', departmentName: 'Business School', 
        status: CourseStatus.Published, students: 32, progress: 0, price: 25000,
        modules: [
            { id: 'm3', title: 'Module 1: SEO Basics', items: [{ id: 'i3-1', title: 'What is SEO?', type: ContentType.Lesson }, { id: 'i3-2', title: 'Keyword Research', type: ContentType.Assignment }] },
            { id: 'm4', title: 'Module 2: Social Media', items: [{ id: 'i4-1', title: 'Platform Selection', type: ContentType.Quiz, questionIds: ['q12', 'q13', 'q19'] }] }
        ]
    },
    { 
        id: 'c3', title: 'UI/UX Design Principles', description: 'Master the art of user interface and experience design. Prototyping, wireframing, and user testing.', 
        instructorId: 'instr3', instructorName: 'Dr. Albert Newton', departmentId: 'd3', departmentName: 'School of Design', 
        status: CourseStatus.Published, students: 28, progress: 0, price: 40000,
        modules: [
            { id: 'm5', title: 'Design Thinking', items: [{ id: 'i5-1', title: 'Empathize Phase', type: ContentType.Lesson }, { id: 'i5-2', title: 'Design Principles Quiz', type: ContentType.Quiz, questionIds: ['q14', 'q16'] }] }
        ]
    },
    { 
        id: 'c4', title: 'Advanced Algorithms', description: 'Deep dive into graph theory, dynamic programming, and complexity analysis.', 
        instructorId: '2', instructorName: 'Instructor Sam', departmentId: 'd1', departmentName: 'School of Computing', 
        status: CourseStatus.Draft, students: 0, progress: 0, modules: [], price: 45000
    },
    { 
        id: 'c5', title: 'Structural Engineering', description: 'Analysis of trusses, beams, and frames. Mechanics of materials.', 
        instructorId: 'instr3', instructorName: 'Dr. Albert Newton', departmentId: 'd4', departmentName: 'Faculty of Engineering', 
        status: CourseStatus.PendingReview, students: 0, progress: 0, price: 50000,
        modules: [
             { id: 'm6', title: 'Statics', items: [{ id: 'i6-1', title: 'Force Vectors', type: ContentType.Lesson }, { id: 'i6-2', title: 'Beams Quiz', type: ContentType.Quiz, questionIds: ['q15', 'q20'] }] }
        ] 
    },
    { 
        id: 'c6', title: 'Anatomy 101', description: 'Basic human anatomy and physiology.', 
        instructorId: 'instr2', instructorName: 'Prof. Jane Smith', departmentId: 'd5', departmentName: 'Health Sciences', 
        status: CourseStatus.Rejected, students: 0, progress: 0, modules: [], price: 30000 
    },
];

// --- 5. GRADES & SUBMISSIONS ---
const SUBMISSIONS: (QuizSubmission | AssignmentSubmission)[] = [];
const GRADES: Grade[] = [];

// Generate mock data for the first course
STUDENT_IDS.forEach((studentId, index) => {
    // Quiz Submission 1
    const quizSub: QuizSubmission = {
        id: `sub-q-${index}`, type: 'quiz', studentId, courseId: 'c1', contentItemId: 'i1-3',
        submittedAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
        answers: { 'q1': 0, 'q2': true, 'q17': 1 }, attemptNumber: 1
    };
    SUBMISSIONS.push(quizSub);
    GRADES.push({
        id: `g-q-${index}`, studentId, courseId: 'c1', contentItemId: 'i1-3', score: Math.floor(Math.random() * 40) + 60, status: 'graded', submissionId: quizSub.id
    });

    // Assignment Submission (Some pending, some graded, some missing)
    if (index < 8) { // Only 8 students submitted the assignment
        const assignSub: AssignmentSubmission = {
            id: `sub-a-${index}`, type: 'assignment', studentId, courseId: 'c1', contentItemId: 'i2-2',
            submittedAt: new Date(Date.now() - Math.random() * 5000000).toISOString(),
            file: { name: `assignment_${studentId}.pdf`, size: 1024 * 1024 * 2, url: '#' }
        };
        SUBMISSIONS.push(assignSub);
        GRADES.push({
            id: `g-a-${index}`, studentId, courseId: 'c1', contentItemId: 'i2-2', 
            score: index < 5 ? Math.floor(Math.random() * 30) + 70 : null, // 5 graded, 3 pending
            status: index < 5 ? 'graded' : 'pending review', submissionId: assignSub.id
        });
    }
});

// --- 6. ANNOUNCEMENTS & EVENTS ---
const ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'Welcome to the New Semester!', content: 'We are excited to start the Fall 2024 semester. Classes begin on Monday.', author: 'Admin User', createdAt: '2024-08-25' },
    { id: 'a2', title: 'System Maintenance', content: 'LMS will be down for maintenance this Sunday from 2 AM to 4 AM.', author: 'IT Support', createdAt: '2024-09-05' },
    { id: 'a3', title: 'Library Hours Extended', content: 'The main library will now be open 24/7 for exam preparation.', author: 'Admin User', createdAt: '2024-10-01' },
    { id: 'a4', title: 'Guest Lecture: AI Ethics', content: 'Join us for a special talk by Dr. Turing on Friday.', author: 'Instructor Sam', createdAt: '2024-10-10' },
    { id: 'a5', title: 'Course Feedback Survey', content: 'Please complete the mid-semester feedback survey.', author: 'Admin User', createdAt: '2024-10-20' },
];

const CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'ev1', title: 'Semester Starts', date: '2024-09-01', type: CalendarEventType.Holiday },
    { id: 'ev2', title: 'Python Quiz Due', date: '2024-09-15', type: CalendarEventType.Quiz, courseName: 'Intro to CS' },
    { id: 'ev3', title: 'Data Types Assignment', date: '2024-10-15', type: CalendarEventType.Assignment, courseName: 'Intro to CS' },
    { id: 'ev4', title: 'Mid-Term Break', date: '2024-10-25', type: CalendarEventType.Holiday },
    { id: 'ev5', title: 'System Maintenance', date: '2024-11-05', type: CalendarEventType.Maintenance },
];

// --- 7. JOBS ---
const JOBS: JobOpportunity[] = [
    { id: 'job1', title: 'Junior React Developer', company: 'TechSolutions Kenya', location: 'Nairobi', type: JobType.FullTime, description: 'Join our dynamic team.', requirements: ['React', 'TypeScript'], salaryRange: 'KSh 80k-120k', postedDate: '2024-10-01', skills: ['React', 'Web'] },
    { id: 'job2', title: 'Freelance UI Designer', company: 'Creative Agency', location: 'Remote', type: JobType.Gig, description: 'Design mobile apps.', requirements: ['Figma', 'UI/UX'], salaryRange: 'KSh 30k/project', postedDate: '2024-10-05', skills: ['Design', 'Figma'] },
    { id: 'job3', title: 'Data Entry Specialist', company: 'Global Corp', location: 'Remote', type: JobType.Contract, description: 'Data migration.', requirements: ['Excel'], salaryRange: 'KSh 40k/month', postedDate: '2024-10-08', skills: ['Excel'] },
    { id: 'job4', title: 'Marketing Intern', company: 'Growth Hackers', location: 'Mombasa', type: JobType.Internship, description: 'Social media management.', requirements: ['Communication'], salaryRange: 'KSh 15k/month', postedDate: '2024-10-10', skills: ['Marketing'] },
    { id: 'job5', title: 'Network Engineer', company: 'Safaricom', location: 'Nairobi', type: JobType.FullTime, description: 'Maintain network infrastructure.', requirements: ['CCNA', 'Networking'], salaryRange: 'KSh 150k+', postedDate: '2024-10-12', skills: ['Networking'] },
];

const APPLICATIONS: JobApplication[] = [
    { id: 'app1', jobId: 'job1', studentId: '3', appliedDate: '2024-10-02', status: ApplicationStatus.Interviewing },
    { id: 'app2', jobId: 'job2', studentId: '3', appliedDate: '2024-10-06', status: ApplicationStatus.Applied },
];

// --- 8. BUDGETING ---
// Updated mock data with financial metrics (Revenue & Net Income will be calculated dynamically in API)
let BUDGETS: DepartmentBudget[] = [
    { departmentId: 'd1', departmentName: 'School of Computing', allocatedAmount: 500000, spentAmount: 125000, generatedRevenue: 0, netIncome: 0, trainingNeedsCount: 2 },
    { departmentId: 'd2', departmentName: 'Business School', allocatedAmount: 300000, spentAmount: 50000, generatedRevenue: 0, netIncome: 0, trainingNeedsCount: 1 },
    { departmentId: 'd3', departmentName: 'School of Design', allocatedAmount: 250000, spentAmount: 200000, generatedRevenue: 0, netIncome: 0, trainingNeedsCount: 3 },
    { departmentId: 'd4', departmentName: 'Faculty of Engineering', allocatedAmount: 600000, spentAmount: 450000, generatedRevenue: 0, netIncome: 0, trainingNeedsCount: 5 },
    { departmentId: 'd5', departmentName: 'Health Sciences', allocatedAmount: 400000, spentAmount: 100000, generatedRevenue: 0, netIncome: 0, trainingNeedsCount: 0 },
];

let BUDGET_REQUESTS: BudgetRequest[] = [
    { id: 'br1', requesterName: 'Instructor Sam', departmentName: 'School of Computing', title: 'Advanced AI Workshop', justification: 'Upskill staff in LLMs.', amount: 45000, status: 'pending', date: new Date().toISOString() },
    { id: 'br2', requesterName: 'Jane Doe', departmentName: 'School of Design', title: 'Adobe Licenses', justification: 'Required for new course.', amount: 120000, status: 'pending', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'br3', requesterName: 'Eng. Rotich', departmentName: 'Faculty of Engineering', title: 'CAD Software Update', justification: 'Annual renewal.', amount: 80000, status: 'approved', date: new Date(Date.now() - 200000000).toISOString() },
    { id: 'br4', requesterName: 'Dr. Jones', departmentName: 'Business School', title: 'Market Research Data', justification: 'For Q4 analysis.', amount: 25000, status: 'rejected', date: new Date(Date.now() - 300000000).toISOString() },
    { id: 'br5', requesterName: 'Instructor Sam', departmentName: 'School of Computing', title: 'Cloud Server Credits', justification: 'Student projects.', amount: 60000, status: 'pending', date: new Date().toISOString() },
];

// --- 9. ACTIVITY LOGS ---
const ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'log1', userId: '2', userName: 'Instructor Sam', userAvatarUrl: 'https://i.pravatar.cc/150?u=sam', action: ActivityActionType.Create, description: 'Created course "Intro to CS"', timestamp: new Date(Date.now() - 1000000).toISOString(), location: 'Mombasa' },
    { id: 'log2', userId: '3', userName: 'Student Alice', userAvatarUrl: 'https://i.pravatar.cc/150?u=alice', action: ActivityActionType.Enroll, description: 'Enrolled in "Intro to CS"', timestamp: new Date(Date.now() - 2000000).toISOString(), location: 'Nairobi' },
    { id: 'log3', userId: '1', userName: 'Admin User', userAvatarUrl: 'https://i.pravatar.cc/150?u=admin', action: ActivityActionType.Login, description: 'Logged in', timestamp: new Date(Date.now() - 500000).toISOString(), location: 'Nairobi' },
    { id: 'log4', userId: 'instr2', userName: 'Prof. Jane Smith', userAvatarUrl: 'https://i.pravatar.cc/150?u=jane', action: ActivityActionType.Update, description: 'Updated grade for Student Alice', timestamp: new Date(Date.now() - 3000000).toISOString(), location: 'Kisumu' },
    { id: 'log5', userId: '4', userName: 'John Lagging', userAvatarUrl: 'https://i.pravatar.cc/150?u=john', action: ActivityActionType.View, description: 'Viewed "Week 1: Intro"', timestamp: new Date(Date.now() - 100000).toISOString(), location: 'Kiambu' },
];

// --- 10. REGIONAL STATISTICS (Mock Data) ---
const COUNTIES = [
    'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
    'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
    'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo',
    'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
    'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

const generateRegionalStats = (): RegionalStat[] => {
    return COUNTIES.map(county => {
        // Simple logic to create diverse mock data based on county "popularity" (simulated by name length)
        const base = (county === 'Nairobi' || county === 'Mombasa' || county === 'Kisumu') ? 1000 : 50;
        const userCount = Math.floor(Math.random() * 500) + base;
        const activeLearners = Math.floor(userCount * (0.3 + Math.random() * 0.5)); // 30-80% active
        const completionRate = Math.floor(40 + Math.random() * 50); // 40-90% completion

        return {
            county,
            userCount,
            activeLearners,
            completionRate
        };
    });
};

// --- API IMPLEMENTATION ---

export const login = async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    const user = USERS.find(u => u.email === email);
    return user || null;
};

export const signupUser = async (userData: Partial<User>): Promise<User> => {
    await delay(500);
    const newUser: User = {
        id: `u-${Date.now()}`,
        name: userData.name || 'New User',
        email: userData.email || '',
        role: userData.role || UserRole.Student,
        status: userData.status || UserStatus.Pending,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        createdAt: new Date().toISOString().split('T')[0],
        county: 'Nairobi', // Default for now
        ...userData
    } as User;
    USERS.push(newUser);
    return newUser;
};

export const getAllUsers = async (): Promise<User[]> => { await delay(500); return [...USERS]; };
export const getRecentUsers = async (limit: number): Promise<User[]> => { await delay(300); return [...USERS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit); };
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => { await delay(400); const index = USERS.findIndex(u => u.id === userId); if (index !== -1) { USERS[index] = { ...USERS[index], ...updates }; return USERS[index]; } return null; };
export const createUser = async (userData: Partial<User>): Promise<User> => { return signupUser(userData); };
export const deleteUser = async (userId: string): Promise<{ success: boolean }> => { await delay(300); const index = USERS.findIndex(u => u.id === userId); if (index !== -1) { USERS.splice(index, 1); return { success: true }; } return { success: false }; };
export const changeUserPassword = async (userId: string, current: string, newPass: string): Promise<{ success: boolean; message: string }> => { await delay(500); return { success: true, message: 'Password changed successfully.' }; };
export const getAllInstructors = async (): Promise<User[]> => { await delay(300); return USERS.filter(u => u.role === UserRole.Instructor); };
export const getNotifications = async (userId: string): Promise<Notification[]> => { await delay(300); return [{ id: 'n1', userId, type: NotificationType.NewAnnouncement, title: 'Welcome', message: 'Welcome to the platform!', link: '/admin/announcements', isRead: false, createdAt: new Date().toISOString() }]; };
export const markNotificationAsRead = async (id: string): Promise<void> => { await delay(100); };
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => { await delay(100); };
export const getSecuritySettings = async (): Promise<SecuritySettings> => { await delay(300); return { enableAiFeatures: true, aiSafetyFilter: 'Medium', passwordPolicy: { minLength: true, requireUppercase: true, requireNumber: true } }; };
export const updateSecuritySettings = async (settings: SecuritySettings): Promise<void> => { await delay(300); };
export const getAdminStats = async (): Promise<StatCardData[]> => { await delay(400); return [{ icon: 'Users', title: 'Total Users', value: String(USERS.length), color: 'primary' }, { icon: 'Book', title: 'Active Courses', value: String(MOCK_COURSES.length), color: 'secondary' }, { icon: 'GraduationCap', title: 'Programs', value: String(PROGRAMS.length), color: 'success' }, { icon: 'DollarSign' as any, title: 'Revenue', value: '$125k', color: 'warning' }]; };
export const getInstructorStats = async (instructorId: string): Promise<StatCardData[]> => { await delay(400); return [{ icon: 'Users', title: 'My Students', value: '45', color: 'primary' }, { icon: 'Book', title: 'My Courses', value: String(MOCK_COURSES.filter(c=>c.instructorId === instructorId).length), color: 'secondary' }, { icon: 'ListChecks', title: 'Pending Grading', value: '5', color: 'warning' }, { icon: 'Star' as any, title: 'Avg. Rating', value: '4.8', color: 'success' }]; };
export const getDashboardAnalytics = async (): Promise<any> => { await delay(600); return { userGrowth: [{ label: 'Jan', value: 120 }, { label: 'Feb', value: 145 }, { label: 'Mar', value: 180 }, { label: 'Apr', value: 250 }, { label: 'May', value: 320 }, { label: 'Jun', value: USERS.length }], roleDistribution: [{ label: 'Students', value: USERS.filter(u => u.role === UserRole.Student).length, color: '#5B8FB9' }, { label: 'Instructors', value: USERS.filter(u => u.role === UserRole.Instructor).length, color: '#FFD700' }, { label: 'Admins', value: USERS.filter(u => u.role === UserRole.Admin).length, color: '#8B5CF6' }], activityByDay: [{ label: 'Mon', value: 450 }, { label: 'Tue', value: 520 }, { label: 'Wed', value: 480 }, { label: 'Thu', value: 610 }, { label: 'Fri', value: 550 }, { label: 'Sat', value: 200 }, { label: 'Sun', value: 180 }] }; };
export const getLatestAnnouncement = async (): Promise<Announcement | null> => { await delay(300); return ANNOUNCEMENTS[0] || null; };
export const getAnnouncements = async (): Promise<Announcement[]> => { await delay(300); return [...ANNOUNCEMENTS]; };
export const createAnnouncement = async (data: any): Promise<Announcement> => { await delay(300); const newAnn = { id: `a-${Date.now()}`, ...data, createdAt: new Date().toISOString() }; ANNOUNCEMENTS.unshift(newAnn); return newAnn; };
export const updateAnnouncement = async (id: string, data: any): Promise<Announcement> => { await delay(300); const index = ANNOUNCEMENTS.findIndex(a => a.id === id); if (index !== -1) { ANNOUNCEMENTS[index] = { ...ANNOUNCEMENTS[index], ...data }; return ANNOUNCEMENTS[index]; } throw new Error("Not found"); };
export const deleteAnnouncement = async (id: string): Promise<{success: boolean}> => { await delay(300); const index = ANNOUNCEMENTS.findIndex(a => a.id === id); if (index !== -1) { ANNOUNCEMENTS.splice(index, 1); return { success: true }; } return { success: false }; };
export const getAllCourses = async (): Promise<Course[]> => { await delay(400); return [...MOCK_COURSES]; };
export const getInstructorCourses = async (instructorId: string): Promise<Course[]> => { await delay(400); return MOCK_COURSES.filter(c => c.instructorId === instructorId); };
export const getStudentCourses = async (studentId: string): Promise<CourseSummary[]> => { await delay(400); return MOCK_COURSES.filter(c => c.status === CourseStatus.Published).map(c => ({ id: c.id, title: c.title, progress: Math.floor(Math.random() * 100), imageUrl: '', students: c.students, instructor: c.instructorName })); };
export const getCourseDetails = async (courseId: string): Promise<Course | null> => { await delay(400); return MOCK_COURSES.find(c => c.id === courseId) || null; };
export const createCourse = async (courseData: any): Promise<Course> => { await delay(400); const newCourse = { ...courseData, id: `c-${Date.now()}`, students: 0, progress: 0, status: CourseStatus.Draft, instructorName: USERS.find(u => u.id === courseData.instructorId)?.name || 'Instructor', modules: [] }; MOCK_COURSES.push(newCourse); return newCourse; };
export const updateCourse = async (id: string, data: any): Promise<Course | null> => { await delay(400); const index = MOCK_COURSES.findIndex(c => c.id === id); if (index !== -1) { MOCK_COURSES[index] = { ...MOCK_COURSES[index], ...data }; return MOCK_COURSES[index]; } return null; };
export const deleteCourse = async (id: string): Promise<{success: boolean}> => { await delay(300); const index = MOCK_COURSES.findIndex(c => c.id === id); if (index !== -1) { MOCK_COURSES.splice(index, 1); return { success: true }; } return { success: false }; };
export const updateCourseModules = async (courseId: string, modules: Module[]): Promise<Course> => { await delay(400); const index = MOCK_COURSES.findIndex(c => c.id === courseId); if (index !== -1) { MOCK_COURSES[index].modules = modules; return MOCK_COURSES[index]; } throw new Error('Course not found'); };
export const getContentItemDetails = async (itemId: string): Promise<ContentItemDetails | null> => { await delay(200); return { id: itemId, content: '<p>This is mock content for the item. It supports <strong>HTML</strong>.</p>' }; };
export const updateContentItemDetails = async (itemId: string, content: string): Promise<void> => { await delay(300); };
export const getSubmissionsForContentItem = async (itemId: string): Promise<StudentSubmissionDetails[]> => { 
    await delay(400); 
    return STUDENT_IDS.map(studentId => {
        const student = USERS.find(u => u.id === studentId)!;
        const sub = SUBMISSIONS.find(s => s.studentId === studentId && s.contentItemId === itemId);
        const grade = GRADES.find(g => g.studentId === studentId && g.contentItemId === itemId);
        return { student, submission: sub || null, grade: grade || null };
    });
};
export const getDepartments = async (): Promise<Department[]> => { await delay(300); return [...DEPARTMENTS]; };
export const createDepartment = async (data: any): Promise<Department> => { await delay(300); const newDept = { id: `d-${Date.now()}`, ...data, programCount: 0 }; DEPARTMENTS.push(newDept); return newDept; };
export const updateDepartment = async (id: string, data: any): Promise<Department> => { await delay(300); const idx = DEPARTMENTS.findIndex(d => d.id === id); if (idx !== -1) { DEPARTMENTS[idx] = { ...DEPARTMENTS[idx], ...data }; return DEPARTMENTS[idx]; } throw new Error("Not found"); };
export const deleteDepartment = async (id: string): Promise<{success: boolean}> => { await delay(300); const idx = DEPARTMENTS.findIndex(d => d.id === id); if (idx !== -1) { DEPARTMENTS.splice(idx, 1); return { success: true }; } return { success: false }; };
export const getPrograms = async (): Promise<Program[]> => { await delay(300); return [...PROGRAMS]; };
export const createProgram = async (data: any): Promise<Program> => { await delay(300); const newProg = { id: `p-${Date.now()}`, ...data, courseCount: 0, courseIds: [] }; PROGRAMS.push(newProg); return newProg; };
export const updateProgram = async (id: string, data: any): Promise<Program> => { await delay(300); const idx = PROGRAMS.findIndex(p => p.id === id); if (idx !== -1) { PROGRAMS[idx] = { ...PROGRAMS[idx], ...data }; return PROGRAMS[idx]; } throw new Error("Not found"); };
export const deleteProgram = async (id: string): Promise<{success: boolean}> => { await delay(300); const idx = PROGRAMS.findIndex(p => p.id === id); if (idx !== -1) { PROGRAMS.splice(idx, 1); return { success: true }; } return { success: false }; };
export const getSemesters = async (): Promise<Semester[]> => { await delay(300); return [...SEMESTERS]; };
export const createSemester = async (data: any): Promise<Semester> => { await delay(300); const newSem = { id: `sem-${Date.now()}`, ...data, status: SemesterStatus.Upcoming }; SEMESTERS.push(newSem); return newSem; };
export const updateSemester = async (id: string, data: any): Promise<Semester> => { await delay(300); const idx = SEMESTERS.findIndex(s => s.id === id); if (idx !== -1) { SEMESTERS[idx] = { ...SEMESTERS[idx], ...data }; return SEMESTERS[idx]; } throw new Error("Not found"); };
export const deleteSemester = async (id: string): Promise<{success: boolean}> => { await delay(300); const idx = SEMESTERS.findIndex(s => s.id === id); if (idx !== -1) { SEMESTERS.splice(idx, 1); return { success: true }; } return { success: false }; };
export const getOverdueItems = async (studentId: string): Promise<OverdueItem[]> => { await delay(300); return [{ id: 'od1', title: 'Data Types Assignment', courseName: 'Intro to Computer Science', dueDate: '2024-10-15', link: '/courses/c1' }]; };
export const getUpcomingDeadlines = async (studentId: string): Promise<UpcomingDeadline[]> => { await delay(300); return [{ id: 'ud1', title: 'Final Project', courseName: 'Intro to CS', dueDate: '2024-12-10', type: 'assignment' }]; };
export const getRecentActivity = async (studentId: string): Promise<RecentActivity[]> => { await delay(300); return [{ id: 'ra1', type: 'grade', title: 'Quiz Graded', summary: 'You scored 85% on First Program Quiz', timestamp: new Date().toISOString(), link: '/grades', icon: 'BadgeCheck' }]; };
export const getStudentProgramDetails = async (studentId: string): Promise<StudentProgramDetails> => { await delay(400); return { program: PROGRAMS[0], progress: 35, courses: [] }; };
export const getStudentTranscript = async (studentId: string): Promise<StudentTranscript> => { await delay(500); return { studentName: 'Student Alice', studentId: studentId, programName: 'BSc Computer Science', semesters: [{ semesterName: 'Fall 2023', courses: [{ courseCode: 'CS101', courseTitle: 'Intro to CS', credits: 4, grade: 'A', gradePoints: 4.0 }], semesterGpa: 4.0 }], cumulativeGpa: 3.8 }; };
export const getStudentCertificates = async (studentId: string): Promise<Certificate[]> => { await delay(400); return [{ id: 'cert1', courseName: 'Web Development Basics', studentName: 'Student Alice', issueDate: '2023-12-15', certificateId: 'CERT-123' }]; };
export const getStudentAchievements = async (studentId: string): Promise<Achievement[]> => { await delay(400); return [{ id: 'ach1', title: 'First Steps', description: 'Completed your first lesson.', icon: 'BookOpen', unlocked: true }, { id: 'ach2', title: 'Quiz Master', description: 'Scored 100% on a quiz.', icon: 'Trophy', unlocked: true }, { id: 'ach3', title: 'Top of the Class', description: 'Rank #1 on a leaderboard.', icon: 'Star', unlocked: false }]; };
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => { await delay(400); return [...CALENDAR_EVENTS]; };
export const getQuestions = async (instructorId: string): Promise<Question[]> => { await delay(400); return QUESTIONS.filter(q => q.instructorId === instructorId); };
export const getAllQuestionsForAdmin = async (): Promise<(Question & {instructorName: string})[]> => { await delay(400); return QUESTIONS.map(q => ({ ...q, instructorName: USERS.find(u => u.id === q.instructorId)?.name || 'Unknown' })); };
export const getPublicQuestionsFromOthers = async (userId: string): Promise<(Question & {instructorName: string})[]> => { await delay(400); return QUESTIONS.filter(q => q.isPublic && q.instructorId !== userId).map(q => ({ ...q, instructorName: USERS.find(u => u.id === q.instructorId)?.name || 'Unknown' })); };
export const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => { await delay(300); return QUESTIONS.filter(q => ids.includes(q.id)); };
export const createQuestion = async (data: any): Promise<Question> => { await delay(300); const newQ = { id: `q-${Date.now()}`, ...data }; QUESTIONS.push(newQ); return newQ; };
export const updateQuestion = async (id: string, data: any): Promise<Question> => { await delay(300); const idx = QUESTIONS.findIndex(q => q.id === id); if (idx !== -1) { QUESTIONS[idx] = { ...QUESTIONS[idx], ...data }; return QUESTIONS[idx]; } throw new Error("Not found"); };
export const deleteQuestion = async (id: string): Promise<{success: boolean}> => { await delay(300); const idx = QUESTIONS.findIndex(q => q.id === id); if (idx !== -1) { QUESTIONS.splice(idx, 1); return { success: true }; } return { success: false }; };
export const getInstructorGradingSummary = async (instructorId: string): Promise<CourseGradingSummary[]> => { 
    await delay(400); 
    return MOCK_COURSES.filter(c => c.instructorId === instructorId).map(course => {
        const items: GradableItemSummary[] = [];
        course.modules?.forEach(m => m.items.forEach(i => {
            if ([ContentType.Quiz, ContentType.Assignment].includes(i.type)) {
                items.push({
                    id: i.id, title: i.title, type: i.type, dueDate: i.dueDate || new Date().toISOString(),
                    totalEnrolled: 45, 
                    submittedCount: SUBMISSIONS.filter(s => s.contentItemId === i.id).length, 
                    gradedCount: GRADES.filter(g => g.contentItemId === i.id && g.status === 'graded').length
                });
            }
        }));
        return { courseId: course.id, courseTitle: course.title, items };
    });
};
export const getCourseGrades = async (courseId: string): Promise<any> => { 
    await delay(400); 
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) return { gradableItems: [], studentGrades: [] };
    const gradableItems: ContentItem[] = [];
    course.modules?.forEach(m => m.items.forEach(i => { if ([ContentType.Quiz, ContentType.Assignment].includes(i.type)) gradableItems.push(i); }));
    
    const studentGrades = STUDENT_IDS.map(studentId => {
        const student = USERS.find(u => u.id === studentId)!;
        const grades: Record<string, Grade | null> = {};
        gradableItems.forEach(item => {
            grades[item.id] = GRADES.find(g => g.studentId === studentId && g.contentItemId === item.id) || null;
        });
        return { studentId, studentName: student.name, grades };
    });
    return { gradableItems, studentGrades };
};
export const updateGrade = async (studentId: string, courseId: string, contentItemId: string, score: number | null): Promise<void> => { 
    await delay(300); 
    const idx = GRADES.findIndex(g => g.studentId === studentId && g.contentItemId === contentItemId);
    if (idx !== -1) { GRADES[idx].score = score; GRADES[idx].status = 'graded'; } 
    else { GRADES.push({ id: `g-${Date.now()}`, studentId, courseId, contentItemId, score, status: 'graded' }); }
};
export const getStudentGradesForCourse = async (studentId: string, courseId: string): Promise<{ id: string, contentItemTitle: string, score: number | null, type: ContentType, submissionId?: string }[]> => { 
    await delay(400); 
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) return [];
    const items: any[] = [];
    course.modules?.forEach(m => m.items.forEach(i => {
        if ([ContentType.Quiz, ContentType.Assignment].includes(i.type)) {
            const grade = GRADES.find(g => g.studentId === studentId && g.contentItemId === i.id);
            items.push({ id: `sg-${i.id}`, contentItemTitle: i.title, score: grade?.score ?? null, type: i.type, submissionId: grade?.submissionId });
        }
    }));
    return items;
};
export const getStudentSubmissionsForContent = async (studentId: string, contentItemId: string): Promise<QuizSubmission[]> => { await delay(300); return SUBMISSIONS.filter(s => s.studentId === studentId && s.contentItemId === contentItemId && s.type === 'quiz') as QuizSubmission[]; };
export const getSubmissionDetails = async (submissionId: string): Promise<{ submission: Submission, questions: Question[] | null, rubric: Rubric | null } | null> => { 
    await delay(400); 
    const sub = SUBMISSIONS.find(s => s.id === submissionId);
    if (!sub) return null;
    let questions = null; let rubric = null;
    if (sub.type === 'quiz') { questions = await getQuestionsByIds(Object.keys((sub as QuizSubmission).answers)); }
    return { submission: sub, questions, rubric };
};
export const submitQuiz = async (studentId: string, courseId: string, contentItemId: string, answers: any): Promise<Grade> => { await delay(500); const sub = { id: `sub-${Date.now()}`, type: 'quiz' as const, studentId, courseId, contentItemId, submittedAt: new Date().toISOString(), answers, attemptNumber: 1 }; SUBMISSIONS.push(sub); const grade = { id: `g-${Date.now()}`, studentId, courseId, contentItemId, score: 85, status: 'graded' as const, submissionId: sub.id }; GRADES.push(grade); return grade; };
export const submitAssignment = async (studentId: string, courseId: string, contentItemId: string, fileData: any): Promise<AssignmentSubmission> => { await delay(500); const sub: AssignmentSubmission = { id: `sub-${Date.now()}`, type: 'assignment', studentId, courseId, contentItemId, submittedAt: new Date().toISOString(), file: { name: fileData.name, size: fileData.size, url: '#' } }; SUBMISSIONS.push(sub); return sub; };
export const getAssignmentSubmissionForStudent = async (studentId: string, contentItemId: string): Promise<AssignmentSubmission | null> => { await delay(300); return (SUBMISSIONS.find(s => s.studentId === studentId && s.contentItemId === contentItemId && s.type === 'assignment') as AssignmentSubmission) || null; };
export const gradeManualSubmission = async (submissionId: string, gradeData: { score: number, rubricFeedback?: any }): Promise<void> => { await delay(300); const sub = SUBMISSIONS.find(s => s.id === submissionId); if (sub) { const gradeIdx = GRADES.findIndex(g => g.submissionId === submissionId); if (gradeIdx !== -1) { GRADES[gradeIdx].score = gradeData.score; GRADES[gradeIdx].status = 'graded'; GRADES[gradeIdx].rubricFeedback = gradeData.rubricFeedback; } else { GRADES.push({ id: `g-${Date.now()}`, studentId: sub.studentId, courseId: sub.courseId, contentItemId: sub.contentItemId, score: gradeData.score, status: 'graded', submissionId, rubricFeedback: gradeData.rubricFeedback }); } } };
export const getRubrics = async (instructorId: string): Promise<Rubric[]> => { await delay(400); return []; };
export const getRubricById = async (rubricId: string): Promise<Rubric | null> => { await delay(300); return null; };
export const createRubric = async (data: any): Promise<Rubric> => { await delay(300); return { id: `r-${Date.now()}`, ...data }; };
export const updateRubric = async (id: string, data: any): Promise<Rubric> => { await delay(300); return { id, ...data }; };
export const deleteRubric = async (id: string): Promise<{success: boolean}> => { await delay(300); return { success: true }; };
export const getInstructorExaminations = async (instructorId: string): Promise<Examination[]> => { await delay(400); return []; };
export const getAdminAllExaminations = async (): Promise<(Examination & { instructorName: string })[]> => { await delay(400); return []; };
export const createExamination = async (data: any): Promise<Examination> => { await delay(300); return { id: `ex-${Date.now()}`, status: ExaminationStatus.Draft, ...data }; };
export const updateExamination = async (id: string, data: any): Promise<Examination> => { await delay(300); return { id, status: ExaminationStatus.Draft, ...data }; };
export const deleteExamination = async (id: string): Promise<{success: boolean}> => { await delay(300); return { success: true }; };
export const getExaminationDetails = async (examId: string): Promise<Examination | null> => { await delay(300); return null; };
export const submitExamination = async (studentId: string, examId: string, answers: any): Promise<Grade> => { await delay(500); return { id: `g-${Date.now()}`, studentId, courseId: 'c1', contentItemId: examId, score: null, status: 'pending review' }; };
export const getCommunications = async (): Promise<Communication[]> => { await delay(300); return []; };
export const sendCommunication = async (data: any): Promise<Communication> => { await delay(300); return { id: `comm-${Date.now()}`, sentAt: new Date().toISOString(), ...data }; };
export const getMessageThreads = async (userId: string): Promise<MessageThread[]> => { await delay(400); return []; };
export const getMessageThreadDetails = async (threadId: string): Promise<MessageThread | null> => { await delay(300); return null; };
export const createNewThread = async (participants: User[], subject: string, content: string, author: User): Promise<MessageThread> => { 
    await delay(300); 
    return { 
        id: `th-${Date.now()}`, 
        participants, 
        subject, 
        lastMessage: { content, createdAt: new Date().toISOString() }, 
        isRead: true, 
        messages: [{ 
            id: `m-${Date.now()}`, 
            threadId: `th-${Date.now()}`, 
            authorId: author.id, 
            authorName: author.name, 
            authorAvatarUrl: author.avatarUrl, 
            content, 
            createdAt: new Date().toISOString(),
            isRead: true
        }] 
    }; 
};
export const sendMessage = async (threadId: string, content: string, author: User): Promise<Message> => { 
    await delay(300); 
    return { 
        id: `m-${Date.now()}`, 
        threadId, 
        authorId: author.id, 
        authorName: author.name, 
        authorAvatarUrl: author.avatarUrl, 
        content, 
        createdAt: new Date().toISOString(),
        isRead: true
    }; 
};
export const getPostsForDiscussion = async (discussionId: string): Promise<DiscussionPost[]> => { await delay(400); return []; };
export const createDiscussionPost = async (discussionId: string, content: string, author: User, parentId?: string): Promise<DiscussionPost> => { await delay(300); return { id: `dp-${Date.now()}`, discussionId, parentId, authorId: author.id, authorName: author.name, authorAvatarUrl: author.avatarUrl, authorRole: author.role, content, createdAt: new Date().toISOString(), isRead: true }; };
export const markDiscussionPostAsRead = async (postId: string): Promise<void> => { await delay(100); };
export const getCertificateSettings = async (): Promise<CertificateSettings> => { await delay(300); return { logoUrl: '', signatureImageUrl: '', signatureSignerName: '', signatureSignerTitle: '', primaryColor: '#000000', autoIssueOnCompletion: false }; };
export const updateCertificateSettings = async (settings: CertificateSettings): Promise<void> => { await delay(300); };
export const getCertificateRequests = async (): Promise<CertificateRequest[]> => { await delay(300); return []; };
export const approveCertificateRequest = async (requestId: string): Promise<{success: boolean}> => { await delay(300); return { success: true }; };
export const denyCertificateRequest = async (requestId: string): Promise<{success: boolean}> => { await delay(300); return { success: true }; };
export const getInstitutionSettings = async (): Promise<InstitutionSettings> => { await delay(300); return { institutionName: 'Lizoku University', logoUrl: '', primaryColor: '#3B82F6' }; };
export const updateInstitutionSettings = async (settings: InstitutionSettings): Promise<void> => { await delay(300); };
export const getActivityLogs = async (): Promise<ActivityLog[]> => { await delay(300); return [...ACTIVITY_LOGS]; };
export const getActiveSessions = async (): Promise<UserSession[]> => { await delay(300); return []; };
export const terminateSession = async (sessionId: string): Promise<{success: boolean}> => { await delay(300); return { success: true }; };
export const getMediaItems = async (instructorId: string): Promise<MediaItem[]> => { await delay(300); return []; };
export const getPublicMediaItems = async (instructorId: string): Promise<(MediaItem & { instructorName: string })[]> => { await delay(300); return []; };
export const uploadMediaItem = async (instructorId: string, file: File): Promise<MediaItem> => { await delay(1000); return { id: `media-${Date.now()}`, instructorId, name: file.name, type: file.type.startsWith('image') ? MediaType.Image : MediaType.Document, url: URL.createObjectURL(file), size: file.size, uploadedAt: new Date().toISOString(), isPublic: false }; };
export const updateMediaItemVisibility = async (itemId: string, isPublic: boolean): Promise<void> => { await delay(200); };
export const deleteMediaItem = async (itemId: string): Promise<void> => { await delay(200); };
export const getEnrollmentReport = async (): Promise<any[]> => { 
    await delay(300); 
    return STUDENT_IDS.map(sid => {
        const s = USERS.find(u => u.id === sid)!;
        return { studentName: s.name, courseTitle: 'Intro to Computer Science', programName: 'BSc Computer Science', programId: 'p1', enrollmentDate: '2023-09-01' };
    });
};
export const getCourseCompletionReport = async (): Promise<any[]> => { 
    await delay(300); 
    return MOCK_COURSES.map(c => ({ courseTitle: c.title, completionRate: Math.floor(Math.random() * 40) + 60 }));
};
export const getInstructorActivityReport = async (): Promise<any[]> => { 
    await delay(300); 
    return USERS.filter(u => u.role === UserRole.Instructor).map(u => ({ instructorId: u.id, instructorName: u.name, coursesTaught: MOCK_COURSES.filter(c => c.instructorId === u.id).length, totalStudents: Math.floor(Math.random() * 100) + 20 }));
};
export const getGradeDistributionReport = async (): Promise<any[]> => { await delay(300); return [{ range: '90-100', count: 12 }, { range: '80-89', count: 25 }, { range: '70-79', count: 18 }, { range: '60-69', count: 8 }, { range: '<60', count: 3 }]; };
export const getAtRiskStudents = async (instructorId: string): Promise<AtRiskStudent[]> => { await delay(500); const students = USERS.filter(u => u.role === UserRole.Student); return students.map((s, index) => { const isHighRisk = index % 3 === 0; const isModerateRisk = index % 3 === 1; if (isHighRisk || isModerateRisk) { return { studentId: s.id, name: s.name, email: s.email, avatarUrl: s.avatarUrl, riskLevel: isHighRisk ? 'High' : 'Moderate', riskFactors: isHighRisk ? ['Inactive > 14 Days', 'Grade Avg < 50%', '3 Missing Assignments'] : ['Grade Avg < 70%', '1 Missing Assignment'], lastLogin: new Date(Date.now() - (isHighRisk ? 15 : 5) * 24 * 60 * 60 * 1000).toISOString(), currentGradeAverage: isHighRisk ? 45 : 68, missedAssignmentsCount: isHighRisk ? 3 : 1 }; } return null; }).filter(Boolean) as AtRiskStudent[]; };
export const sendNudge = async (studentId: string, message: string): Promise<{ success: boolean }> => { await delay(300); return { success: true }; };
export const getJobOpportunities = async (): Promise<JobOpportunity[]> => { await delay(400); return [...JOBS]; };
export const getStudentApplications = async (studentId: string): Promise<JobApplication[]> => { await delay(300); return APPLICATIONS.filter(app => app.studentId === studentId); };
export const applyForJob = async (studentId: string, jobId: string): Promise<JobApplication> => { await delay(500); const newApplication: JobApplication = { id: `app-${Date.now()}`, jobId, studentId, appliedDate: new Date().toISOString(), status: ApplicationStatus.Applied }; APPLICATIONS.push(newApplication); return newApplication; };
export const submitSurvey = async (studentId: string, surveyId: string, answers: Record<string, any>): Promise<void> => { await delay(500); const submission: SurveySubmission = { id: `surv-sub-${Date.now()}`, studentId, surveyId, answers, submittedAt: new Date().toISOString() }; SURVEY_RESPONSES.push(submission); };
const SURVEY_RESPONSES: SurveySubmission[] = [];
export const getSurveyResults = async (surveyId: string): Promise<SurveySummary | null> => { await delay(600); let surveyItem: ContentItem | undefined; for (const course of MOCK_COURSES) { if (course.modules) { for (const mod of course.modules) { const found = mod.items.find(i => i.id === surveyId); if (found) { surveyItem = found; break; } } } if (surveyItem) break; } if (!surveyItem || !surveyItem.surveyQuestions) return null; const submissions = SURVEY_RESPONSES.filter(s => s.surveyId === surveyId); const effectiveSubmissions = submissions.length > 0 ? submissions : []; const results = surveyItem.surveyQuestions.map(q => { const answers = effectiveSubmissions.map(s => s.answers[q.id]).filter(a => a !== undefined); if (q.type === SurveyQuestionType.Rating) { const numericAnswers = answers.map(a => Number(a)); const sum = numericAnswers.reduce((a, b) => a + b, 0); const avg = numericAnswers.length ? sum / numericAnswers.length : 0; const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; numericAnswers.forEach(n => { if (distribution[n] !== undefined) distribution[n]++ }); return { questionId: q.id, questionText: q.text, type: q.type, responseCount: answers.length, averageRating: Number(avg.toFixed(1)), ratingDistribution: distribution }; } else if (q.type === SurveyQuestionType.YesNo) { const yes = answers.filter(a => a === 'yes').length; const no = answers.filter(a => a === 'no').length; return { questionId: q.id, questionText: q.text, type: q.type, responseCount: answers.length, yesNoDistribution: { yes, no } }; } else { return { questionId: q.id, questionText: q.text, type: q.type, responseCount: answers.length, textResponses: answers as string[] }; } }); return { surveyId, title: surveyItem.title, totalRespondents: effectiveSubmissions.length, results }; };
export const getCourseLeaderboard = async (courseId: string, currentUserId: string): Promise<LeaderboardEntry[]> => { await delay(400); const mockStudents = USERS.filter(u => u.role === UserRole.Student).map(u => ({ id: u.id, name: u.name, avatar: u.avatarUrl, points: Math.floor(Math.random() * 2000) + 500 })); mockStudents.sort((a, b) => b.points - a.points); return mockStudents.map((s, index) => ({ studentId: s.id, name: s.name, avatarUrl: s.avatar, points: s.points, rank: index + 1, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'same' : 'down' })); };

// --- Budgeting ---

export const getDepartmentBudgets = async (): Promise<DepartmentBudget[]> => {
    await delay(300);
    // Dynamic calculation: Revenue = Course Price * Student Count
    return BUDGETS.map(budget => {
        const deptCourses = MOCK_COURSES.filter(c => c.departmentId === budget.departmentId);
        const revenue = deptCourses.reduce((acc, course) => acc + ((course.students || 0) * (course.price || 0)), 0);
        return {
            ...budget,
            generatedRevenue: revenue,
            netIncome: revenue - budget.spentAmount
        };
    });
};

export const getBudgetRequests = async (): Promise<BudgetRequest[]> => {
    await delay(300);
    return [...BUDGET_REQUESTS];
};

export const getFinancialTrends = async (): Promise<FinancialTrend[]> => {
    await delay(400);
    // Mocking 6 months of data
    return [
        { month: 'Jan', revenue: 1500000, expenses: 1200000 },
        { month: 'Feb', revenue: 1800000, expenses: 1300000 },
        { month: 'Mar', revenue: 2100000, expenses: 1250000 },
        { month: 'Apr', revenue: 2400000, expenses: 1400000 },
        { month: 'May', revenue: 2200000, expenses: 1350000 },
        { month: 'Jun', revenue: 2800000, expenses: 1500000 },
    ];
};

export const updateDepartmentBudget = async (deptId: string, amount: number): Promise<void> => {
    await delay(300);
    const budget = BUDGETS.find(b => b.departmentId === deptId);
    if (budget) {
        budget.allocatedAmount = amount;
    }
};

export const approveBudgetRequest = async (requestId: string): Promise<void> => {
    await delay(400);
    const reqIndex = BUDGET_REQUESTS.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
        const req = BUDGET_REQUESTS[reqIndex];
        req.status = 'approved';
        const deptBudget = BUDGETS.find(b => b.departmentName === req.departmentName);
        if (deptBudget) {
            deptBudget.spentAmount += req.amount;
        }
    }
};

export const rejectBudgetRequest = async (requestId: string): Promise<void> => {
    await delay(300);
    const reqIndex = BUDGET_REQUESTS.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
        BUDGET_REQUESTS[reqIndex].status = 'rejected';
    }
};

// --- Geospatial ---
export const getRegionalStats = async (): Promise<RegionalStat[]> => {
    await delay(500);
    return generateRegionalStats();
};
