import { User, UserRole, UserStatus, StatCardData, CourseSummary, Department, Program, Semester, SemesterStatus, Course, CourseStatus, Module, ContentType, ContentItem, Announcement, Enrollment, Grade, CalendarEvent, CalendarEventType, DiscussionPost, Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, QuizSubmission, MultipleSelectQuestion, FillBlankQuestion, Rubric, StudentProgramDetails, ProgramCourse, Communication, SecuritySettings, StudentTranscript, Message, MessageThread, Examination, ExaminationStatus, Certificate, Achievement, CertificateSettings, CertificateRequest, CertificateRequestStatus, InstitutionSettings, ActivityLog, ActivityActionType, UserSession, Notification, NotificationType, OverdueItem, UpcomingDeadline, RecentActivity, IconName, ContentItemDetails, AssignmentSubmission, Submission } from '../types';
import { generateAIAvatar } from './geminiService';

// --- MOCK DATABASE ---

let USERS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@lizoku.com', role: UserRole.Admin, avatarUrl: `https://i.pravatar.cc/150?u=admin@lizoku.com`, status: UserStatus.Active, createdAt: '2024-05-10' },
    { id: '2', name: 'Instructor Sam', email: 'instructor@lizoku.com', role: UserRole.Instructor, avatarUrl: `https://i.pravatar.cc/150?u=instructor@lizoku.com`, status: UserStatus.Active, createdAt: '2024-06-15' },
    { id: '3', name: 'Student Anna', email: 'student@lizoku.com', role: UserRole.Student, avatarUrl: `https://i.pravatar.cc/150?u=student@lizoku.com`, status: UserStatus.Active, createdAt: '2024-07-20', programId: 'p1' },
    { id: '4', name: 'Pending John', email: 'john.doe@example.com', role: UserRole.Student, avatarUrl: `https://i.pravatar.cc/150?u=john.doe@example.com`, status: UserStatus.Pending, createdAt: '2024-08-01' },
    { id: '5', name: 'Banned Eve', email: 'eve@example.com', role: UserRole.Student, avatarUrl: `https://i.pravatar.cc/150?u=eve@example.com`, status: UserStatus.Banned, createdAt: '2024-07-11' },
    { id: '6', name: 'Inactive Bob', email: 'bob@example.com', role: UserRole.Instructor, avatarUrl: `https://i.pravatar.cc/150?u=bob@example.com`, status: UserStatus.Inactive, createdAt: '2024-03-22' },
    { id: '7', name: 'Alice Johnson', email: 'alice@example.com', role: UserRole.Student, avatarUrl: `https://i.pravatar.cc/150?u=alice@example.com`, status: UserStatus.Active, createdAt: '2024-07-28', programId: 'p1' },
    { id: '8', name: 'Charlie Brown', email: 'charlie@example.com', role: UserRole.Student, avatarUrl: `https://i.pravatar.cc/150?u=charlie@example.com`, status: UserStatus.Active, createdAt: '2024-07-25', programId: 'p1' },
];

const COURSES_SUMMARY: CourseSummary[] = [
    { id: 'cs101', title: 'Introduction to Computer Science', progress: 25, imageUrl: '', students: 3, instructor: 'Instructor Sam', rating: 4.5 },
    { id: 'ds202', title: 'Data Structures and Algorithms', progress: 60, imageUrl: '', students: 32, instructor: 'Instructor Sam', rating: 4.7 },
    { id: 'wd101', title: 'Web Development Fundamentals', progress: 90, imageUrl: '', students: 58, instructor: 'Inactive Bob', rating: 4.8 },
    { id: 'db301', title: 'Database Management', progress: 45, imageUrl: '', students: 25, instructor: 'Inactive Bob', rating: 4.2 },
];

let DEPARTMENTS: Department[] = [
    { id: 'd1', name: 'School of Computing', head: '2', programCount: 2 },
    { id: 'd2', name: 'Business School', head: '6', programCount: 1 },
    { id: 'd3', name: 'School of Design', head: '1', programCount: 1 },
];

let PROGRAMS: Program[] = [
    { id: 'p1', name: 'BSc. in Computer Science', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 4, duration: '4 Years', courseIds: ['cs101', 'ds202', 'wd101', 'db301'] },
    { id: 'p2', name: 'BSc. in Information Technology', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 22, duration: '4 Years', courseIds: [] },
    { id: 'p3', name: 'Bachelor of Business Administration', departmentId: 'd2', departmentName: 'Business School', courseCount: 18, duration: '3 Years', courseIds: [] },
    { id: 'p4', name: 'Diploma in Graphic Design', departmentId: 'd3', departmentName: 'School of Design', courseCount: 12, duration: '2 Years', courseIds: [] },
];

let SEMESTERS: Semester[] = [
    { id: 's1', name: 'Fall 2024', startDate: '2024-09-01', endDate: '2024-12-20', status: SemesterStatus.Upcoming },
    { id: 's2', name: 'Summer 2024', startDate: '2024-05-15', endDate: '2024-08-15', status: SemesterStatus.Active },
    { id: 's3', name: 'Spring 2024', startDate: '2024-01-10', endDate: '2024-05-05', status: SemesterStatus.Past },
];

let COURSES_DETAILED: Course[] = [
    { 
        id: 'cs101', 
        title: 'Introduction to Computer Science', 
        description: 'A comprehensive 8-week course on the fundamentals of programming and computer science, covering core concepts, data structures, and basic algorithms.', 
        instructorId: '2', 
        instructorName: 'Instructor Sam', 
        departmentId: 'd1', 
        departmentName: 'School of Computing', 
        status: CourseStatus.Published,
        modules: [
             { id: 'cs101-m1', title: 'Week 1: Foundations (Aug 5 - Aug 11)', items: [
                { id: 'cs101-c1', title: 'Welcome to CS101!', type: ContentType.Lesson },
                { id: 'cs101-c2', title: 'Course Syllabus', type: ContentType.Resource },
                { id: 'cs101-c3', title: 'Discussion: Introduce Yourself', type: ContentType.Discussion },
            ]},
            { id: 'cs101-m2', title: 'Week 2: Programming Fundamentals (Aug 12 - Aug 18)', items: [
                { id: 'cs101-c4', title: 'Lesson: Variables and Data Types', type: ContentType.Lesson },
                { id: 'cs101-c5', title: 'Lesson: Operators and Expressions', type: ContentType.Lesson },
                { id: 'cs101-c6', title: 'Knowledge Check: Fundamentals', type: ContentType.Quiz, questionIds: ['q8', 'q9', 'q10'], instructions: 'An ungraded quiz to check your understanding.' },
            ]},
            { id: 'cs101-m3', title: 'Week 3: Control Flow (Aug 19 - Aug 25)', items: [
                { id: 'cs101-c7', title: 'Lesson: Conditional Statements (If/Else)', type: ContentType.Lesson },
                { id: 'cs101-c8', title: 'Lesson: Loops (For/While)', type: ContentType.Lesson },
                { id: 'cs101-c9', title: 'Assignment 1: Simple Calculator', type: ContentType.Assignment, rubricId: 'r1', requiresFileUpload: true },
            ]},
            { id: 'cs101-m4', title: 'Week 4: Functions and Scope (Aug 26 - Sep 1)', items: [
                { id: 'cs101-c10', title: 'Lesson: Defining and Calling Functions', type: ContentType.Lesson },
                { id: 'cs101-c11', title: 'Lesson: Parameters, Arguments, and Scope', type: ContentType.Lesson },
                { id: 'cs101-c12', title: 'Quiz 1: Functions', type: ContentType.Quiz, questionIds: ['q11', 'q12', 'q13'], timeLimit: 20, attemptsLimit: 2, instructions: 'A graded quiz on functions.' },
            ]},
            { id: 'cs101-m5', title: 'Week 5: Mid-Term Exam (Sep 2 - Sep 8)', items: [
                { id: 'cs101-c13', title: 'Mid-Term Review Guide', type: ContentType.Resource },
                { id: 'cs101-c14', title: 'Mid-Term Exam', type: ContentType.Quiz, questionIds: ['q1', 'q2', 'q4', 'q10', 'q11', 'q12'], timeLimit: 60, attemptsLimit: 1, instructions: 'This is a closed-book exam covering all material from weeks 1 through 4.' },
            ]},
            { id: 'cs101-m6', title: 'Week 6: Data Structures (Sep 9 - Sep 15)', items: [
                { id: 'cs101-c15', title: 'Lesson: Arrays and Lists', type: ContentType.Lesson },
                { id: 'cs101-c16', title: 'Lesson: Objects and Dictionaries', type: ContentType.Lesson },
                { id: 'cs101-c17', title: 'Assignment 2: Contact List Manager', type: ContentType.Assignment, rubricId: 'r1', requiresFileUpload: true },
            ]},
            { id: 'cs101-m7', title: 'Introduction to Algorithms (Sep 16 - Sep 22)', items: [
                { id: 'cs101-c18', title: 'Lesson: What is an Algorithm?', type: ContentType.Lesson },
                { id: 'cs101-c19', title: 'Lesson: Searching and Sorting', type: ContentType.Lesson },
                { id: 'cs101-c20', title: 'Discussion: Algorithm Efficiency', type: ContentType.Discussion },
            ]},
            { id: 'cs101-m8', title: 'Week 8: Final Project & Exam (Sep 23 - Sep 29)', items: [
                { id: 'cs101-c21', title: 'Final Project: Overview and Requirements', type: ContentType.Lesson },
                { id: 'cs101-c22', title: 'Final Project Submission', type: ContentType.Assignment, rubricId: 'r2', requiresFileUpload: true },
                { id: 'cs101-c23', title: 'Final Exam', type: ContentType.Examination, examinationId: 'exam3' },
            ]},
        ]
    },
    { 
        id: 'ds202', 
        title: 'Data Structures and Algorithms', 
        description: 'In-depth look at data structures.', 
        instructorId: '2', 
        instructorName: 'Instructor Sam', 
        departmentId: 'd1', 
        departmentName: 'School of Computing', 
        status: CourseStatus.Published,
        modules: [
            { id: 'm3', title: 'Module 1: Arrays & Lists', items: [
                { id: 'c7', title: 'Quiz 1: Big O Notation', type: ContentType.Quiz, questionIds: ['q3'], timeLimit: 5, attemptsLimit: 1 },
            ]}
        ]
    },
    { 
        id: 'wd101', 
        title: 'Web Development Fundamentals', 
        description: 'Learn HTML, CSS, and JavaScript.', 
        instructorId: '6', 
        instructorName: 'Inactive Bob', 
        departmentId: 'd1', 
        departmentName: 'School of Computing', 
        status: CourseStatus.Draft,
        modules: [
            { id: 'm4', title: 'Introduction to HTML', items: [] }
        ]
    },
    { 
      id: 'db301',
      title: 'Database Management',
      description: 'Learn SQL and database design.',
      instructorId: '2',
      instructorName: 'Instructor Sam',
      departmentId: 'd1',
      departmentName: 'School of Computing',
      status: CourseStatus.Published,
      modules: []
    },
    { 
        id: 'ba101', 
        title: 'Introduction to Business', 
        description: 'Overview of modern business practices.', 
        instructorId: '6', 
        instructorName: 'Inactive Bob', 
        departmentId: 'd2', 
        departmentName: 'Business School', 
        status: CourseStatus.Published,
        modules: []
    },
];

let ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'System Maintenance Scheduled', content: 'Please be advised that we will be performing scheduled maintenance this Friday at 10 PM. The platform may be unavailable for up to 1 hour.', author: 'Admin User', createdAt: '2024-08-01' },
    { id: 'a2', title: 'Welcome to the New Semester!', content: 'We are excited to kick off the Fall 2024 semester. Please check your course dashboards for updates from your instructors.', author: 'Admin User', createdAt: '2024-07-28' },
];

const ENROLLMENTS: Enrollment[] = [
    { id: 'e1', studentId: '3', courseId: 'cs101' },
    { id: 'e2', studentId: '7', courseId: 'cs101' },
    { id: 'e3', studentId: '8', courseId: 'cs101' },
    { id: 'e4', studentId: '3', courseId: 'ds202' },
];

let GRADES: Grade[] = [
    { id: 'g1', studentId: '3', courseId: 'cs101', contentItemId: 'cs101-c12', score: 88, status: 'graded', submissionId: 'sub1' },
    { id: 'g2', studentId: '7', courseId: 'cs101', contentItemId: 'cs101-c12', score: 92, status: 'graded', submissionId: 'sub2' },
    { id: 'g3', studentId: '3', courseId: 'cs101', contentItemId: 'cs101-c9', score: null, status: 'pending review', submissionId: 'asub1' },
    { id: 'g4', studentId: '8', courseId: 'cs101', contentItemId: 'cs101-c12', score: null, status: 'pending review', submissionId: 'sub3' },
    { id: 'g5', studentId: '3', courseId: 'ds202', contentItemId: 'c7', score: 78, status: 'graded' },

];

let QUIZ_SUBMISSIONS: QuizSubmission[] = [
    { id: 'sub1', type: 'quiz', studentId: '3', courseId: 'cs101', contentItemId: 'cs101-c12', submittedAt: '2024-08-03T10:00:00Z', answers: { q11: 1, q12: 'return', q13: false }, attemptNumber: 1 },
    { id: 'sub2', type: 'quiz', studentId: '7', courseId: 'cs101', contentItemId: 'cs101-c12', submittedAt: '2024-08-03T11:00:00Z', answers: { q11: 1, q12: 'return', q13: false }, attemptNumber: 1 },
    { id: 'sub3', type: 'quiz', studentId: '8', courseId: 'cs101', contentItemId: 'cs101-c12', submittedAt: '2024-08-03T12:00:00Z', answers: { q11: 2, q12: 'send', q13: true }, attemptNumber: 1 },
];

let ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [
    { id: 'asub1', type: 'assignment', studentId: '3', courseId: 'cs101', contentItemId: 'cs101-c9', submittedAt: '2024-08-24T18:00:00Z', file: { name: 'calculator_anna.txt', size: 1024, url: '#' } },
];

const CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'ce1', title: 'Quiz 1: Functions', date: '2024-09-01', type: CalendarEventType.Quiz, courseName: 'Introduction to Computer Science' },
    { id: 'ce2', title: 'Assignment 1: Simple Calculator', date: '2024-08-25', type: CalendarEventType.Assignment, courseName: 'Introduction to Computer Science' },
    { id: 'ce3', title: 'Public Holiday', date: '2024-08-20', type: CalendarEventType.Holiday },
    { id: 'ce4', title: 'System Maintenance', date: '2024-08-28', type: CalendarEventType.Maintenance },
    { id: 'ce5', title: 'Quiz: Big O Notation Due', date: '2024-09-02', type: CalendarEventType.Quiz, courseName: 'Data Structures' },
    { id: 'ce6', title: 'Mid-Term Exam', date: '2024-09-08', type: CalendarEventType.Quiz, courseName: 'Introduction to Computer Science' },
    { id: 'ce7', title: 'Assignment 2: Contact List Manager', date: '2024-09-15', type: CalendarEventType.Assignment, courseName: 'Introduction to Computer Science' },
    { id: 'ce8', title: 'Final Project Submission', date: '2024-09-27', type: CalendarEventType.Assignment, courseName: 'Introduction to Computer Science' },
    { id: 'ce9', title: 'Final Exam', date: '2024-09-29', type: CalendarEventType.Quiz, courseName: 'Introduction to Computer Science' },
];

let DISCUSSION_POSTS: DiscussionPost[] = [
    // --- Discussion: cs101-c3 (Introduce Yourself) ---
    { id: 'dp1', discussionId: 'cs101-c3', authorId: '2', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, content: "Welcome aboard, everyone. To get started, please introduce yourselves! Feel free to share your hobbies, what you're excited to learn, or even a picture of your pet. Let's build a great community here!", createdAt: new Date('2024-08-01T09:05:00Z').toISOString(), isRead: true, replyCount: 2 },
    { id: 'dp2', discussionId: 'cs101-c3', parentId: 'dp1', authorId: '3', authorName: 'Student Anna', authorAvatarUrl: USERS[2].avatarUrl, content: "Hi everyone! I'm Anna, excited to learn with you all. I have a golden retriever named Sparky!", createdAt: new Date('2024-08-01T10:00:00Z').toISOString(), isRead: true, replyCount: 1 },
    { id: 'dp3', discussionId: 'cs101-c3', parentId: 'dp2', authorId: '7', authorName: 'Alice Johnson', authorAvatarUrl: USERS[6].avatarUrl, content: "Hey Anna! Welcome to the course. I love golden retrievers!", createdAt: new Date('2024-08-01T11:30:00Z').toISOString(), isRead: false, replyCount: 0 },
    { id: 'dp4', discussionId: 'cs101-c3', parentId: 'dp1', authorId: '8', authorName: 'Charlie Brown', authorAvatarUrl: USERS[7].avatarUrl, content: "Thanks for creating this space, Professor. I have a cat named Whiskers.", createdAt: new Date('2024-08-01T13:00:00Z').toISOString(), isRead: false, replyCount: 0 },

    // --- Discussion: cs101-c20 (Algorithm Efficiency) ---
    { id: 'dp5', discussionId: 'cs101-c20', authorId: '7', authorName: 'Alice Johnson', authorAvatarUrl: USERS[6].avatarUrl, content: "My real-world analogy for Linear vs Binary search is looking for a specific page in a book. Linear search is flipping through page by page from the start. Binary search is opening the book to the middle, seeing if your page number is higher or lower, and then repeating that with the correct half. It's so much faster!", createdAt: new Date('2024-09-18T10:00:00Z').toISOString(), isRead: true, replyCount: 1 },
    { id: 'dp6', discussionId: 'cs101-c20', parentId: 'dp5', authorId: '2', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, content: "Excellent analogy, Alice! That's a perfect way to describe it.", createdAt: new Date('2024-09-18T11:00:00Z').toISOString(), isRead: true, replyCount: 0 },
];

let QUESTIONS: Question[] = [
    { id: 'q1', type: QuestionType.MultipleChoice, stem: 'What is the correct syntax to output "Hello World" in Python?', options: ['echo "Hello World"', 'printf("Hello World")', 'print("Hello World")', 'cout << "Hello World"'], correctAnswerIndex: 2, instructorId: '2' },
    { id: 'q2', type: QuestionType.MultipleChoice, stem: 'Which of the following data types is mutable in Python?', options: ['Tuple', 'String', 'List', 'Integer'], correctAnswerIndex: 2, instructorId: '2' },
    { id: 'q3', type: QuestionType.MultipleChoice, stem: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], correctAnswerIndex: 0, instructorId: '6' },
    { id: 'q4', type: QuestionType.TrueFalse, stem: 'The `main` function is the entry point for every C++ program.', correctAnswer: true, instructorId: '2' },
    { id: 'q5', type: QuestionType.ShortAnswer, stem: 'What keyword is used to declare a variable that cannot be reassigned in JavaScript?', acceptableAnswers: ['const'], instructorId: '2' },
    { id: 'q6', type: QuestionType.MultipleSelect, stem: 'Which of the following are primitive data types in JavaScript?', options: ['String', 'Object', 'Boolean', 'Array'], correctAnswerIndices: [0, 2], instructorId: '2' },
    { id: 'q7', type: QuestionType.FillBlank, stem: 'The method to add an element to the end of an ____ is `.push()`.', acceptableAnswers: ['array'], instructorId: '2' },
    // New Questions for CS101
    { id: 'q8', type: QuestionType.MultipleChoice, stem: 'In programming, what is a variable?', options: ['A fixed value that never changes', 'A named storage location for data', 'A type of function', 'A hardware component'], correctAnswerIndex: 1, instructorId: '2' },
    { id: 'q9', type: QuestionType.TrueFalse, stem: 'In JavaScript, `x = 5` is used for comparing if x is equal to 5.', correctAnswer: false, instructorId: '2' },
    { id: 'q10', type: QuestionType.MultipleChoice, stem: 'Which operator checks for both value and type equality in JavaScript?', options: ['=', '==', '===', '!='], correctAnswerIndex: 2, instructorId: '2' },
    { id: 'q11', type: QuestionType.MultipleChoice, stem: 'What is the main purpose of a function in programming?', options: ['To store a single piece of data', 'To group reusable code that performs a specific task', 'To create loops', 'To define the color of a web page'], correctAnswerIndex: 1, instructorId: '2' },
    { id: 'q12', type: QuestionType.ShortAnswer, stem: 'What keyword is used to send a value back from a function?', acceptableAnswers: ['return'], instructorId: '2' },
    { id: 'q13', type: QuestionType.TrueFalse, stem: 'Variables declared with `let` inside a function are accessible from anywhere in the program.', correctAnswer: false, instructorId: '2' },
    { id: 'q14', type: QuestionType.MultipleChoice, stem: 'Which data structure is best for storing a collection of key-value pairs?', options: ['Array', 'Object', 'Set', 'String'], correctAnswerIndex: 1, instructorId: '2' },
    { id: 'q15', type: QuestionType.MultipleSelect, stem: 'Which of the following are common sorting algorithms? (Select all that apply)', options: ['Bubble Sort', 'Linear Search', 'Merge Sort', 'Binary Search'], correctAnswerIndices: [0, 2], instructorId: '2' },
    { id: 'q16', type: QuestionType.FillBlank, stem: 'Big O notation is used to describe the ____ of an algorithm.', acceptableAnswers: ['efficiency', 'performance', 'complexity'], instructorId: '2' },
    { id: 'q17', type: QuestionType.TrueFalse, stem: 'On a large, sorted dataset, a linear search is generally faster than a binary search.', correctAnswer: false, instructorId: '2' },
    { id: 'q18', type: QuestionType.ShortAnswer, stem: 'What does the acronym IDE stand for?', acceptableAnswers: ['Integrated Development Environment'], instructorId: '2' },
];

let RUBRICS: Rubric[] = [
    {
        id: 'r1',
        instructorId: '2',
        title: 'Basic Programming Assignment Rubric',
        levels: [
            { id: 'l1', name: 'Excellent', points: 4 },
            { id: 'l2', name: 'Good', points: 3 },
            { id: 'l3', name: 'Satisfactory', points: 2 },
            { id: 'l4', name: 'Needs Improvement', points: 1 },
        ],
        criteria: [
            { id: 'c1', description: 'Code Correctness & Functionality', points: 4 },
            { id: 'c2', description: 'Code Readability & Style', points: 4 },
            { id: 'c3', description: 'Problem-Solving Approach', points: 4 },
        ],
    },
    {
        id: 'r2',
        instructorId: '2',
        title: 'Final Project Rubric',
        levels: [
            { id: 'r2-l1', name: 'Exemplary', points: 25 },
            { id: 'r2-l2', name: 'Proficient', points: 20 },
            { id: 'r2-l3', name: 'Developing', points: 15 },
            { id: 'r2-l4', name: 'Beginning', points: 10 },
        ],
        criteria: [
            { id: 'r2-c1', description: 'Project Functionality & Correctness', points: 25 },
            { id: 'r2-c2', description: 'Code Quality & Readability', points: 25 },
            { id: 'r2-c3', description: 'Problem-Solving & Algorithm Choice', points: 25 },
            { id: 'r2-c4', description: 'Documentation & Comments', points: 25 },
        ],
    },
];

let COMMUNICATIONS: Communication[] = [
    { id: 'comm1', subject: 'Final Exam Schedule', content: 'Dear students, the final exam schedule for the Summer 2024 semester has been posted. Please check the examinations page for details.', recipientsSummary: 'All Students', sentAt: '2024-07-25T10:00:00Z', authorName: 'Admin User' },
    { id: 'comm2', subject: 'Grade Submission Deadline', content: 'Reminder to all instructors: The deadline for submitting final grades for the Spring 2024 semester is this Friday. Please ensure all grades are entered in the gradebook.', recipientsSummary: 'All Instructors', sentAt: '2024-05-02T14:30:00Z', authorName: 'Admin User' },
];

let SECURITY_SETTINGS: SecuritySettings = {
    enableAiFeatures: true,
    aiSafetyFilter: 'Medium',
    passwordPolicy: {
        minLength: true,
        requireUppercase: true,
        requireNumber: true,
    },
};

let MESSAGES: Message[] = [
    // Thread 1
    { id: 'm1', threadId: 'mt1', authorId: '2', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, content: "Hi Anna, I've reviewed your first assignment. Great work on the core logic! I've left some feedback on your variable naming conventions. Let me know if you have any questions.", createdAt: new Date('2024-08-02T09:00:00Z').toISOString() },
    { id: 'm2', threadId: 'mt1', authorId: '3', authorName: 'Student Anna', authorAvatarUrl: USERS[2].avatarUrl, content: "Thank you, Professor Sam! I'll review the feedback right away. I appreciate you taking the time to look it over.", createdAt: new Date('2024-08-02T11:30:00Z').toISOString() },
    // Thread 2
    { id: 'm3', threadId: 'mt2', authorId: '1', authorName: 'Admin User', authorAvatarUrl: USERS[0].avatarUrl, content: "Dear Student, this is a reminder that the deadline for tuition fee payment for the Fall 2024 semester is approaching. Please ensure all payments are made by August 15th to avoid any interruptions to your course access.", createdAt: new Date('2024-08-01T15:00:00Z').toISOString() },
    // Thread 3
    { id: 'm4', threadId: 'mt3', authorId: '7', authorName: 'Alice Johnson', authorAvatarUrl: USERS[6].avatarUrl, content: "Hey Anna, are you free to work on the Data Structures group project this weekend? I was thinking we could meet at the library on Saturday afternoon.", createdAt: new Date('2024-08-03T14:20:00Z').toISOString() },
];

let MESSAGE_THREADS: MessageThread[] = [
    { 
        id: 'mt1', 
        participants: [
            { id: '2', name: 'Instructor Sam', avatarUrl: USERS[1].avatarUrl }, 
            { id: '3', name: 'Student Anna', avatarUrl: USERS[2].avatarUrl }
        ],
        subject: 'Feedback on Assignment 1', 
        lastMessage: { content: "Thank you, Professor Sam! I'll review the feedback right away...", createdAt: MESSAGES[1].createdAt },
        isRead: false 
    },
    { 
        id: 'mt2', 
        participants: [
            { id: '1', name: 'Admin User', avatarUrl: USERS[0].avatarUrl }, 
            { id: '3', name: 'Student Anna', avatarUrl: USERS[2].avatarUrl }
        ],
        subject: 'Important: Tuition Fee Deadline', 
        lastMessage: { content: "Dear Student, this is a reminder that the deadline for tuition...", createdAt: MESSAGES[2].createdAt },
        isRead: true
    },
    { 
        id: 'mt3', 
        participants: [
            { id: '7', name: 'Alice Johnson', avatarUrl: USERS[6].avatarUrl },
            { id: '3', name: 'Student Anna', avatarUrl: USERS[2].avatarUrl }
        ],
        subject: 'Data Structures Project', 
        lastMessage: { content: "Hey Anna, are you free to work on the Data Structures group project...", createdAt: MESSAGES[3].createdAt },
        isRead: true
    },
];

let EXAMINATIONS: Examination[] = [
    {
        id: 'exam1',
        instructorId: '2',
        title: 'Mid-Term Examination',
        instructions: 'This is a closed-book exam. You have 60 minutes to complete the questions. Read each question carefully before answering.',
        courseId: 'cs101',
        courseTitle: 'Introduction to Computer Science',
        scheduledStart: '2024-09-08T09:00:00Z',
        scheduledEnd: '2024-09-08T17:00:00Z',
        durationMinutes: 60,
        questionIds: ['q1', 'q2', 'q4', 'q10', 'q11', 'q12'],
        shuffleQuestions: true,
        status: ExaminationStatus.Scheduled,
    },
    {
        id: 'exam2',
        instructorId: '2',
        title: 'Final Examination',
        instructions: 'This is a comprehensive final exam covering all modules. You have 120 minutes.',
        courseId: 'ds202',
        courseTitle: 'Data Structures and Algorithms',
        scheduledStart: '2024-12-10T14:00:00Z',
        scheduledEnd: '2024-12-10T17:00:00Z',
        durationMinutes: 120,
        questionIds: ['q3', 'q6'],
        shuffleQuestions: false,
        status: ExaminationStatus.Draft,
    },
    {
        id: 'exam3',
        instructorId: '2',
        title: 'Final Examination',
        instructions: 'This is a comprehensive final exam covering all course material. You have 90 minutes. This is a closed-book exam.',
        courseId: 'cs101',
        courseTitle: 'Introduction to Computer Science',
        scheduledStart: '2024-09-29T09:00:00Z',
        scheduledEnd: '2024-09-29T17:00:00Z',
        durationMinutes: 90,
        questionIds: ['q14', 'q15', 'q16', 'q17', 'q18'],
        shuffleQuestions: true,
        status: ExaminationStatus.Scheduled,
    }
];

const CERTIFICATES: Certificate[] = [
    {
        id: 'cert1',
        courseName: 'Introduction to Computer Science',
        studentName: 'Student Anna',
        issueDate: '2024-08-15',
        certificateId: 'LIZOKU-CS101-ANNA-2024',
    },
    {
        id: 'cert2',
        courseName: 'Data Structures and Algorithms',
        studentName: 'Student Anna',
        issueDate: '2024-08-20',
        certificateId: 'LIZOKU-DS202-ANNA-2024',
    }
];

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'ach1',
        title: 'First Steps',
        description: 'Completed your first lesson in any course.',
        icon: 'CheckCircle',
        unlocked: true,
    },
    {
        id: 'ach2',
        title: 'Knowledge Check',
        description: 'Passed your first quiz with a score of 80% or higher.',
        icon: 'ClipboardCheck',
        unlocked: true,
    },
    {
        id: 'ach3',
        title: 'Course Conqueror',
        description: 'Successfully completed an entire course.',
        icon: 'Trophy',
        unlocked: true,
    },
    {
        id: 'ach4',
        title: 'Weekend Warrior',
        description: 'Logged in and studied on a Saturday or Sunday.',
        icon: 'Calendar',
        unlocked: false,
    },
    {
        id: 'ach5',
        title: 'Discussion Starter',
        description: 'Started a new thread in a discussion forum.',
        icon: 'MessageSquare',
        unlocked: false,
    },
    {
        id: 'ach6',
        title: 'Perfect Attendance',
        description: 'Logged in every day for a week.',
        icon: 'History',
        unlocked: false,
    },
];

let CERTIFICATE_SETTINGS: CertificateSettings = {
    logoUrl: 'https://i.imgur.com/J8r5m2y.png', // Placeholder URL
    signatureImageUrl: 'https://i.imgur.com/q3vXNn9.png', // Placeholder URL
    signatureSignerName: 'Dr. Jane Doe',
    signatureSignerTitle: 'University Registrar',
    primaryColor: '#FFD700', // Matches theme primary
    autoIssueOnCompletion: true,
};

let CERTIFICATE_REQUESTS: CertificateRequest[] = [
    {
        id: 'cr1',
        studentId: '3',
        studentName: 'Student Anna',
        courseId: 'cs101',
        courseName: 'Introduction to Computer Science',
        requestDate: '2024-08-16T10:00:00Z',
        status: CertificateRequestStatus.Pending,
    },
    {
        id: 'cr2',
        studentId: '7',
        studentName: 'Alice Johnson',
        courseId: 'cs101',
        courseName: 'Introduction to Computer Science',
        requestDate: '2024-08-17T14:30:00Z',
        status: CertificateRequestStatus.Pending,
    },
    {
        id: 'cr3',
        studentId: '8',
        studentName: 'Charlie Brown',
        courseId: 'ds202',
        courseName: 'Data Structures and Algorithms',
        requestDate: '2024-08-18T09:00:00Z',
        status: CertificateRequestStatus.Approved,
    },
];

let INSTITUTION_SETTINGS: InstitutionSettings = {
    institutionName: 'Lizoku LMS',
    logoUrl: 'https://i.imgur.com/J8r5m2y.png',
    primaryColor: '#FFD700',
};

const ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'log1', userId: '1', userName: 'Admin User', userAvatarUrl: USERS[0].avatarUrl, action: ActivityActionType.Login, description: 'Logged in successfully.', timestamp: '2024-08-04T10:00:00Z' },
    { id: 'log2', userId: '1', userName: 'Admin User', userAvatarUrl: USERS[0].avatarUrl, action: ActivityActionType.Update, description: "Updated user 'Inactive Bob' status to inactive.", timestamp: '2024-08-04T10:05:00Z' },
    { id: 'log3', userId: '2', userName: 'Instructor Sam', userAvatarUrl: USERS[1].avatarUrl, action: ActivityActionType.Create, description: "Created new quiz 'Quiz 1: Core Concepts' in course 'Introduction to Computer Science'.", timestamp: '2024-08-03T14:30:00Z' },
    { id: 'log4', userId: '3', userName: 'Student Anna', userAvatarUrl: USERS[2].avatarUrl, action: ActivityActionType.Login, description: 'Logged in successfully.', timestamp: '2024-08-03T12:00:00Z' },
    { id: 'log5', userId: '1', userName: 'Admin User', userAvatarUrl: USERS[0].avatarUrl, action: ActivityActionType.Delete, description: "Deleted course 'Temporary Course'.", timestamp: '2024-08-02T09:15:00Z' },
    { id: 'log6', userId: '7', userName: 'Alice Johnson', userAvatarUrl: USERS[6].avatarUrl, action: ActivityActionType.Enroll, description: "Enrolled in course 'Introduction to Computer Science'.", timestamp: '2024-08-01T18:00:00Z' },
];

let ACTIVE_SESSIONS: UserSession[] = [
    { id: 'sess1', userId: '1', userName: 'Admin User', userAvatarUrl: USERS[0].avatarUrl, userRole: UserRole.Admin, loginTime: '2024-08-04T10:00:00Z', lastActiveTime: new Date().toISOString(), ipAddress: '192.168.1.1' },
    { id: 'sess2', userId: '3', userName: 'Student Anna', userAvatarUrl: USERS[2].avatarUrl, userRole: UserRole.Student, loginTime: '2024-08-04T11:30:00Z', lastActiveTime: new Date(Date.now() - 5 * 60000).toISOString(), ipAddress: '203.0.113.25' },
    { id: 'sess3', userId: '7', userName: 'Alice Johnson', userAvatarUrl: USERS[6].avatarUrl, userRole: UserRole.Student, loginTime: '2024-08-04T09:45:00Z', lastActiveTime: new Date(Date.now() - 20 * 60000).toISOString(), ipAddress: '198.51.100.10' },
];

let NOTIFICATIONS: Notification[] = [
    { id: 'n1', userId: '3', type: NotificationType.NewGrade, title: 'Grade for Assignment 1', message: 'Your grade for "First Program" in Intro to CS is 95%.', link: '/courses/cs101', isRead: true, createdAt: new Date('2024-08-04T11:00:00Z').toISOString() },
    { id: 'n2', userId: '3', type: NotificationType.NewMessage, title: 'Message from Instructor Sam', message: 'Hi Anna, I\'ve reviewed your first assignment. Great work on the core logic!', link: '/my-messages/mt1', isRead: false, createdAt: new Date('2024-08-04T14:00:00Z').toISOString() },
    { id: 'n3', userId: '3', type: NotificationType.NewAnnouncement, title: 'New Site Announcement', message: 'System Maintenance Scheduled this Friday at 10 PM.', link: '/dashboard', isRead: false, createdAt: new Date('2024-08-05T09:00:00Z').toISOString() },
    { id: 'n4', userId: '3', type: NotificationType.AssignmentDueSoon, title: 'Assignment Due Soon', message: 'Quiz 1: Core Concepts is due in 3 days.', link: '/courses/cs101', isRead: false, createdAt: new Date('2024-08-07T10:00:00Z').toISOString() },
];

const CONTENT_ITEM_DETAILS: ContentItemDetails[] = [
    { 
        id: 'cs101-c3', 
        content: `<div class="prose prose-sans max-w-none">
        <p class="text-lg">Welcome to our first class discussion!</p>
        <p>The goal of this first discussion is simple: to get to know each other. Building a supportive community is key to a successful course, and that starts here.</p>
        <div class="p-4 bg-secondary-light/40 dark:bg-secondary/20 border-l-4 border-secondary dark:border-blue-400 my-6">
            <h4 class="font-bold text-secondary dark:text-blue-300">Your Task:</h4>
            <p>Please post a new thread introducing yourself. You can talk about:</p>
            <ul class="list-disc pl-5 mt-2">
                <li>Your academic interests or what you hope to learn in this course.</li>
                <li>Your hobbies, passions, or a fun fact about yourself.</li>
                <li>You're welcome to share about your family, pets, or anything that makes you, you!</li>
            </ul>
        </div>
        <p><strong>Participation:</strong> Part of your grade for this discussion will come from not only posting your own introduction but also replying to at least <strong>two</strong> of your classmates' posts.</p>
        <hr class="my-6">
        <h4 class="font-bold">Guidelines:</h4>
        <ul class="list-disc pl-5 text-sm">
            <li>Keep conversations professional and friendly.</li>
            <li>Be respectful of different viewpoints and experiences.</li>
            <li>Please avoid sensitive topics such as politics or religion to maintain a positive and inclusive environment.</li>
        </ul>
    </div>` 
    },
    { 
        id: 'cs101-c20', 
        content: `<div class="prose prose-sans max-w-none">
        <p class="text-lg">This week's discussion is about algorithm efficiency.</p>
        <p>We've learned about Linear Search vs. Binary Search, and simple sorting algorithms like Bubble Sort. While they all get the job done, *how* they do it matters immensely, especially as data scales up. This is where we analyze an algorithm's efficiency, often using Big O notation.</p>
        <div class="p-4 bg-secondary-light/40 dark:bg-secondary/20 border-l-4 border-secondary dark:border-blue-400 my-6">
            <h4 class="font-bold text-secondary dark:text-blue-300">Your Task:</h4>
            <p>Choose <strong>one</strong> of the following prompts and start a new thread with your response:</p>
            <ol class="list-decimal pl-5 mt-2">
                <li><strong>Real-World Analogy:</strong> Explain the difference between Linear Search and Binary Search using a real-world analogy (that isn't a phone book!). Why is it critical for the data to be sorted for Binary Search?</li>
                <li><strong>Why Not Bubble Sort?:</strong> Bubble Sort is simple to understand, but it's rarely used in practice. Research and explain why, and name a more efficient sorting algorithm that is commonly used instead.</li>
            </ol>
        </div>
        <p><strong>Participation:</strong> After posting your own thread, please find at least <strong>two</strong> posts from your peers (ideally on the topic you didn't choose) and write a thoughtful reply. Ask a clarifying question, offer a different perspective, or provide another example to support their point.</p>
    </div>`
    },
    { 
        id: 'cs101-c1', 
        content: `<div class="welcome-container">
    <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Welcome to the Adventure of Computer Science!</h2>
    <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">Hello and a warm welcome to CS101. Whether you're completely new to programming or have dabbled a bit before, this course is your gateway into the fascinating world of how computers think, solve problems, and shape our modern world.</p>
    
    <section class="p-6 bg-secondary-light/40 dark:bg-secondary/20 rounded-lg border border-secondary/20 dark:border-secondary/30">
        <h3 class="text-2xl font-bold text-secondary dark:text-blue-300 mb-4">What to Expect</h3>
        <ul class="space-y-4">
            <li class="flex items-start">
                <span class="bg-primary/30 dark:bg-primary/20 text-primary-dark dark:text-primary rounded-full p-2 mr-4 mt-1 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </span>
                <div>
                    <strong class="font-semibold text-gray-800 dark:text-gray-200">Engaging Lessons:</strong>
                    <p class="text-gray-600 dark:text-gray-300">Each week introduces new concepts through easy-to-understand lessons.</p>
                </div>
            </li>
            <li class="flex items-start">
                 <span class="bg-primary/30 dark:bg-primary/20 text-primary-dark dark:text-primary rounded-full p-2 mr-4 mt-1 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                </span>
                <div>
                    <strong class="font-semibold text-gray-800 dark:text-gray-200">Hands-On Practice:</strong>
                    <p class="text-gray-600 dark:text-gray-300">You'll apply what you learn through quizzes and programming assignments.</p>
                </div>
            </li>
            <li class="flex items-start">
                 <span class="bg-primary/30 dark:bg-primary/20 text-primary-dark dark:text-primary rounded-full p-2 mr-4 mt-1 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
                <div>
                    <strong class="font-semibold text-gray-800 dark:text-gray-200">Supportive Community:</strong>
                    <p class="text-gray-600 dark:text-gray-300">Use the discussion boards to ask questions and collaborate with your peers.</p>
                </div>
            </li>
        </ul>
    </section>

    <p class="my-8 text-gray-700 dark:text-gray-300">My name is Instructor Sam, and I'll be your guide. My goal is to make this subject approachable, exciting, and rewarding. Please don't hesitate to reach out or post in the forums if you're ever feeling stuck.</p>

    <div class="p-6 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-600 rounded-r-lg flex items-center">
         <span class="text-green-600 dark:text-green-300 mr-4 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.09-3.1a2 2 0 0 0-2.83-2.83c-.8.61-2.26.62-3.1.09z"></path><path d="m12 15-3-3a2 2 0 0 1 2.83-2.83l.09.09c.8.61 2.26.62 3.1.09s1.26-1.5.09-3.1l-3-3c-1.5-1.26-5-2-5-2s.5 3.74 2 5"></path><path d="M9 12c-2 2.24-2.68 4.31-2.68 4.31s2.07-.68 4.31-2.68"></path><path d="M15 9c2.24-2 4.31-2.68 4.31-2.68s-.68 2.07-2.68 4.31"></path></svg>
        </span>
        <div>
            <h4 class="font-bold text-green-800 dark:text-green-200">Ready to Begin?</h4>
            <p class="text-sm text-green-700 dark:text-green-300">Your first step is to review the <strong>Course Syllabus</strong> and then head over to the Week 1 Discussion to <strong>Introduce Yourself</strong>.</p>
        </div>
    </div>
</div>` 
    },
    { 
        id: 'cs101-c2', 
        content: `<h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-2">CS101: Introduction to Computer Science - Syllabus</h2><section class="syllabus-section"><h3 class="syllabus-header">Course Description</h3><p class="syllabus-content">This course provides a comprehensive introduction to the fundamental concepts of computer science and programming. Students will learn the basics of computational thinking, problem-solving, and software development. Topics include data types, control flow, functions, data structures, and basic algorithms. The course is language-agnostic in its concepts but will use JavaScript for examples and assignments.</p></section><section class="syllabus-section"><h3 class="syllabus-header">Learning Objectives</h3><ul class="syllabus-list"><li>Understand and apply fundamental programming concepts.</li><li>Analyze problems and develop algorithmic solutions.</li><li>Write, debug, and test simple computer programs.</li><li>Understand the role of basic data structures like arrays and objects.</li><li>Work with functions to create modular and reusable code.</li></ul></section><section class="syllabus-section"><h3 class="syllabus-header">Grading Policy</h3><p class="syllabus-content mb-4">Your final grade will be determined by your performance on the following components:</p><table class="grading-table"><thead><tr><th>Component</th><th>Weight</th></tr></thead><tbody><tr><td>Assignments (2)</td><td>30%</td></tr><tr><td>Quizzes (2)</td><td>30%</td></tr><tr><td>Mid-Term Exam</td><td>15%</td></tr><tr><td>Final Exam</td><td>15%</td></tr><tr><td>Final Project</td><td>10%</td></tr></tbody><tfoot><tr><td>Total</td><td>100%</td></tr></tfoot></table></section><section class="syllabus-section"><h3 class="syllabus-header">Weekly Schedule</h3><ul class="syllabus-list schedule-list"><li><strong>Week 1:</strong> Foundations & Course Overview</li><li><strong>Week 2:</strong> Programming Fundamentals (Variables, Data Types, Operators)</li><li><strong>Week 3:</strong> Control Flow (Conditionals, Loops)</li><li><strong>Week 4:</strong> Functions and Scope</li><li><strong>Week 5:</strong> Mid-Term Exam</li><li><strong>Week 6:</strong> Data Structures (Arrays, Objects)</li><li><strong>Week 7:</strong> Introduction to Algorithms</li><li><strong>Week 8:</strong> Final Project & Final Exam</li></ul></section>` 
    },
    { id: 'cs101-c4', content: `<p class="lesson-intro">At the heart of any computer program is <strong>data</strong>. But how do we store and manage it? The answer is <strong>variables</strong>, the fundamental building blocks for storing information.</p><div class="key-concept"><h3 class="font-bold text-secondary dark:text-blue-300">Key Concept: Variable</h3><p>A variable is a named storage location for data. Think of it as a labeled box where you can store information. You can change what's inside the box later.</p></div><p>In programming, we use variables to hold values like numbers, text, and more complex information so we can refer to it and manipulate it throughout our code.</p><div class="code-block"><div class="code-header"><span>script.js</span></div><pre><code>// 'message' is the variable name, "Hello, world!" is the value.
let message = "Hello, world!";

// We can change the value later.
message = "Hello, Anna!";
console.log(message); // Output: "Hello, Anna!"</code></pre></div><div class="lesson-section-header"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2Z"/><path d="M12 15V7"/><path d="M12 5a2 2 0 1 0-4 0"/><path d="M12 5a2 2 0 1 1 4 0"/></svg><span>Common Data Types</span></div><p>The "type" of data determines what you can do with it. Here are the most common primitive data types:</p><ul><li><strong>String:</strong> Represents text. You create strings by wrapping text in quotes (<code>""</code> or <code>''</code>).<br><code>let name = "Student Anna";</code></li><li><strong>Number:</strong> Represents both whole numbers (integers) and decimal numbers (floats).<br><code>let age = 21; let price = 99.95;</code></li><li><strong>Boolean:</strong> Represents a logical value of either <code>true</code> or <code>false</code>.</li></ul>`},
    { id: 'cs101-c5', content: `
<p class="lesson-intro">Once you have data in variables, you need to be able to work with it. <strong>Operators</strong> are the symbols that perform operations on variables and values.</p>

<div class="lesson-section-header">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
    <span>Arithmetic Operators</span>
</div>
<p>These are the mathematical operators you're already familiar with:</p>
<ul class="list-disc pl-5">
    <li><code>+</code> (Addition)</li>
    <li><code>-</code> (Subtraction)</li>
    <li><code>*</code> (Multiplication)</li>
    <li><code>/</code> (Division)</li>
    <li><code>%</code> (Modulus - remainder of a division)</li>
</ul>
<div class="code-block"><div class="code-header"><span>script.js</span></div><pre><code>let x = 10;
let y = 3;

console.log(x + y); // Output: 13
console.log(x * y); // Output: 30
console.log(x % y); // Output: 1 (10 divided by 3 is 3 with a remainder of 1)</code></pre></div>


<div class="lesson-section-header">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    <span>Comparison Operators</span>
</div>
<p>Comparison operators compare two values and evaluate to a Boolean (<code>true</code> or <code>false</code>).</p>
<ul class="list-disc pl-5">
    <li><code>==</code> (Equal to)</li>
    <li><code>===</code> (Strictly equal to - checks value AND type)</li>
    <li><code>!=</code> (Not equal to)</li>
    <li><code>></code> (Greater than)</li>
    <li><code><</code> (Less than)</li>
</ul>
<div class="key-concept">
    <h3 class="font-bold text-secondary dark:text-blue-300">Important: <code>==</code> vs <code>===</code></h3>
    <p>Always prefer using the strict equality operator <code>===</code>. It prevents unexpected behavior by ensuring both the value and the data type are the same.</p>
</div>
<div class="code-block"><div class="code-header"><span>script.js</span></div><pre><code>let score = 95;
console.log(score > 90); // Output: true

console.log(5 == "5");   // Output: true (bad!)
console.log(5 === "5");  // Output: false (good!)</code></pre></div>

<div class="lesson-section-header">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/><path d="M12 16v-2"/><path d="M12 8V6"/></svg>
    <span>Logical Operators</span>
</div>
<p>Logical operators are used to combine conditional statements.</p>
<ul class="list-disc pl-5">
    <li><code>&&</code> (AND - both sides must be true)</li>
    <li><code>||</code> (OR - at least one side must be true)</li>
    <li><code>!</code> (NOT - inverts a boolean value)</li>
</ul>
<div class="code-block"><div class="code-header"><span>script.js</span></div><pre><code>let loggedIn = true;
let isAdmin = false;

console.log(loggedIn && isAdmin); // Output: false
console.log(loggedIn || isAdmin); // Output: true
console.log(!loggedIn);          // Output: false</code></pre></div>
`},
];

const simulateNetwork = <T,>(data: T, delay = 500): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// --- MOCK API FUNCTIONS ---

// FIX: Corrected a string method call by removing a redundant String() wrapper.
const isShortAnswerCorrect = (question: ShortAnswerQuestion, answer: string): boolean => {
    return question.acceptableAnswers.some(acceptable => acceptable.toLowerCase() === answer.toLowerCase());
};

const isMultipleSelectCorrect = (question: MultipleSelectQuestion, answer: number[]): boolean => {
    if (question.correctAnswerIndices.length !== answer.length) return false;
    const correctAnswerSet = new Set(question.correctAnswerIndices);
    return answer.every(index => correctAnswerSet.has(index));
};

const isFillBlankCorrect = (question: FillBlankQuestion, answer: string): boolean => {
    return question.acceptableAnswers.some(acceptable => acceptable.toLowerCase() === answer.toLowerCase());
};

// --- AUTH & USER MANAGEMENT ---

export const login = (email: string, password: string): Promise<User | null> => {
    console.log(`Attempting login for ${email}`);
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    // In a real app, you'd check a hashed password. Here, we just check if the user exists and is active.
    if (user && user.status === UserStatus.Active) {
        return simulateNetwork(user, 1000);
    }
    return simulateNetwork(null, 1000);
};

export const signupUser = async (userData: Omit<User, 'id' | 'avatarUrl' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
        id: `u${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    USERS.unshift(newUser);
    return simulateNetwork(newUser);
};

export const getAllUsers = (): Promise<User[]> => simulateNetwork(USERS);
export const getRecentUsers = (count: number): Promise<User[]> => simulateNetwork(USERS.slice(0, count));
export const getAllInstructors = (): Promise<User[]> => simulateNetwork(USERS.filter(u => u.role === UserRole.Instructor));

export const createUser = async (userData: Omit<User, 'id' | 'avatarUrl' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
        id: `u${Date.now()}`,
        ...userData,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    USERS.unshift(newUser);
    return simulateNetwork(newUser);
};

export const updateUser = (userId: string, updatedData: Partial<User>): Promise<User | null> => {
    const userIndex = USERS.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        USERS[userIndex] = { ...USERS[userIndex], ...updatedData };
        return simulateNetwork(USERS[userIndex]);
    }
    return simulateNetwork(null);
};

export const deleteUser = (userId: string): Promise<{ success: boolean }> => {
    const initialLength = USERS.length;
    USERS = USERS.filter(u => u.id !== userId);
    return simulateNetwork({ success: USERS.length < initialLength });
};

export const changeUserPassword = (userId: string, current: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    // Mock API - in a real app, you'd validate the current password against the DB
    if (current === 'password123') { // Mock "wrong password"
        return simulateNetwork({ success: false, message: "Incorrect current password." });
    }
    return simulateNetwork({ success: true, message: "Password updated successfully." });
};

// --- SETTINGS ---

export const getSecuritySettings = (): Promise<SecuritySettings> => simulateNetwork(SECURITY_SETTINGS);
export const updateSecuritySettings = (settings: SecuritySettings): Promise<SecuritySettings> => {
    Object.assign(SECURITY_SETTINGS, settings);
    return simulateNetwork(SECURITY_SETTINGS);
};
export const getInstitutionSettings = (): Promise<InstitutionSettings> => simulateNetwork(INSTITUTION_SETTINGS);
export const updateInstitutionSettings = (settings: InstitutionSettings): Promise<InstitutionSettings> => {
    Object.assign(INSTITUTION_SETTINGS, settings);
    return simulateNetwork(INSTITUTION_SETTINGS);
};

// --- ACADEMIC STRUCTURE ---

export const getDepartments = (): Promise<Department[]> => simulateNetwork(DEPARTMENTS);

export const createDepartment = (deptData: Omit<Department, 'id' | 'programCount'>): Promise<Department> => {
    const newDept: Department = {
        id: `d${Date.now()}`,
        ...deptData,
        programCount: 0,
    };
    DEPARTMENTS.push(newDept);
    return simulateNetwork(newDept);
};

export const updateDepartment = (id: string, data: Partial<Department>): Promise<Department | null> => {
    const index = DEPARTMENTS.findIndex(d => d.id === id);
    if (index > -1) {
        DEPARTMENTS[index] = { ...DEPARTMENTS[index], ...data };
        return simulateNetwork(DEPARTMENTS[index]);
    }
    return simulateNetwork(null);
};

export const deleteDepartment = (id: string): Promise<{ success: boolean }> => {
    const initialLength = DEPARTMENTS.length;
    DEPARTMENTS = DEPARTMENTS.filter(d => d.id !== id);
    return simulateNetwork({ success: DEPARTMENTS.length < initialLength });
};

export const getPrograms = (): Promise<Program[]> => simulateNetwork(PROGRAMS);

export const createProgram = (programData: Omit<Program, 'id' | 'departmentName' | 'courseCount' | 'courseIds'>): Promise<Program> => {
    const dept = DEPARTMENTS.find(d => d.id === programData.departmentId);
    if (!dept) {
        return Promise.reject(new Error("Department not found"));
    }
    const newProgram: Program = {
        id: `p${Date.now()}`,
        name: programData.name,
        departmentId: programData.departmentId,
        departmentName: dept.name,
        duration: programData.duration,
        courseCount: 0,
        courseIds: [],
    };
    PROGRAMS.push(newProgram);
    dept.programCount += 1;
    return simulateNetwork(newProgram);
};

export const updateProgram = (id: string, data: Partial<Program>): Promise<Program | null> => {
    const index = PROGRAMS.findIndex(p => p.id === id);
    if (index > -1) {
        const oldDeptId = PROGRAMS[index].departmentId;
        PROGRAMS[index] = { ...PROGRAMS[index], ...data };
        const newDeptId = PROGRAMS[index].departmentId;

        if (oldDeptId !== newDeptId) {
            const oldDept = DEPARTMENTS.find(d => d.id === oldDeptId);
            if (oldDept) oldDept.programCount = Math.max(0, oldDept.programCount - 1);
            const newDept = DEPARTMENTS.find(d => d.id === newDeptId);
            if (newDept) newDept.programCount += 1;
        }
        
        // Update department name if department changed
        const dept = DEPARTMENTS.find(d => d.id === newDeptId);
        if (dept) PROGRAMS[index].departmentName = dept.name;

        return simulateNetwork(PROGRAMS[index]);
    }
    return simulateNetwork(null);
};

export const deleteProgram = (id: string): Promise<{ success: boolean }> => {
    const index = PROGRAMS.findIndex(p => p.id === id);
    if (index > -1) {
        const program = PROGRAMS[index];
        const dept = DEPARTMENTS.find(d => d.id === program.departmentId);
        if (dept) {
            dept.programCount = Math.max(0, dept.programCount - 1);
        }
        PROGRAMS.splice(index, 1);
        return simulateNetwork({ success: true });
    }
    return simulateNetwork({ success: false });
};

export const getSemesters = (): Promise<Semester[]> => simulateNetwork(SEMESTERS.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
export const createSemester = (data: Omit<Semester, 'id' | 'status'>): Promise<Semester> => {
     const newSemester: Semester = {
        id: `s${Date.now()}`,
        ...data,
        status: SemesterStatus.Upcoming, // This would be calculated server-side
    };
    SEMESTERS.push(newSemester);
    return simulateNetwork(newSemester);
};
export const updateSemester = (id: string, data: Partial<Semester>): Promise<Semester | null> => {
     const index = SEMESTERS.findIndex(s => s.id === id);
    if (index > -1) {
        SEMESTERS[index] = { ...SEMESTERS[index], ...data };
        return simulateNetwork(SEMESTERS[index]);
    }
    return simulateNetwork(null);
};
export const deleteSemester = (id: string): Promise<{ success: boolean }> => {
    const initialLength = SEMESTERS.length;
    SEMESTERS = SEMESTERS.filter(s => s.id !== id);
    return simulateNetwork({ success: SEMESTERS.length < initialLength });
};

// --- COURSES ---

export const getAllCourses = (): Promise<Course[]> => simulateNetwork(COURSES_DETAILED);
export const getInstructorCourses = (instructorId: string): Promise<Course[]> => simulateNetwork(COURSES_DETAILED.filter(c => c.instructorId === instructorId));

export const getStudentCourses = (studentId: string): Promise<CourseSummary[]> => {
    const enrolledCourseIds = new Set(ENROLLMENTS.filter(e => e.studentId === studentId).map(e => e.courseId));
    const enrolledCourses = COURSES_SUMMARY.filter(c => enrolledCourseIds.has(c.id));
    return simulateNetwork(enrolledCourses);
};

export const getCourseDetails = (courseId: string): Promise<Course | null> => {
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    return simulateNetwork(course || null);
};

export const createCourse = (data: Partial<Omit<Course, 'id' | 'instructorName' | 'departmentName'>>): Promise<Course> => {
    const instructor = USERS.find(u => u.id === data.instructorId);
    const department = DEPARTMENTS.find(d => d.id === data.departmentId);
    const newCourse: Course = {
        id: `c${Date.now()}`,
        title: data.title || 'New Course',
        description: data.description || '',
        instructorId: data.instructorId!,
        instructorName: instructor?.name || 'N/A',
        departmentId: data.departmentId!,
        departmentName: department?.name || 'N/A',
        status: data.status || CourseStatus.Draft,
        modules: [],
    };
    COURSES_DETAILED.push(newCourse);
    return simulateNetwork(newCourse);
};

export const updateCourse = (id: string, data: Partial<Course>): Promise<Course | null> => {
    const index = COURSES_DETAILED.findIndex(c => c.id === id);
    if (index > -1) {
        COURSES_DETAILED[index] = { ...COURSES_DETAILED[index], ...data };
        // Update denormalized names if IDs changed
        const instructor = USERS.find(u => u.id === COURSES_DETAILED[index].instructorId);
        const department = DEPARTMENTS.find(d => d.id === COURSES_DETAILED[index].departmentId);
        if (instructor) COURSES_DETAILED[index].instructorName = instructor.name;
        if (department) COURSES_DETAILED[index].departmentName = department.name;

        return simulateNetwork(COURSES_DETAILED[index]);
    }
    return simulateNetwork(null);
};

export const deleteCourse = (id: string): Promise<{ success: boolean }> => {
    const initialLength = COURSES_DETAILED.length;
    COURSES_DETAILED = COURSES_DETAILED.filter(c => c.id !== id);
    return simulateNetwork({ success: COURSES_DETAILED.length < initialLength });
};

export const updateCourseModules = (courseId: string, modules: Module[]): Promise<Course | null> => {
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (course) {
        course.modules = modules;
        return simulateNetwork(course);
    }
    return simulateNetwork(null);
};

// --- CONTENT & ASSESSMENTS ---

export const getContentItemDetails = (itemId: string): Promise<ContentItemDetails | null> => {
    const details = CONTENT_ITEM_DETAILS.find(d => d.id === itemId);
    return simulateNetwork(details || null, 300);
};

export const getQuestions = (instructorId: string): Promise<Question[]> => simulateNetwork(QUESTIONS.filter(q => q.instructorId === instructorId));
export const getQuestionsByIds = (ids: string[]): Promise<Question[]> => simulateNetwork(QUESTIONS.filter(q => ids.includes(q.id)));
export const getAllQuestionsForAdmin = (): Promise<(Question & { instructorName: string })[]> => {
    const data = QUESTIONS.map(q => {
        const instructor = USERS.find(u => u.id === q.instructorId);
        return { ...q, instructorName: instructor?.name || 'Unknown' };
    });
    return simulateNetwork(data);
};

export const createQuestion = (data: Omit<Question, 'id'>): Promise<Question> => {
    // FIX: Add a type assertion to resolve TypeScript's confusion with discriminated unions and spread syntax.
    const newQuestion = {
        ...data,
        id: `q${Date.now()}`,
    } as Question;
    QUESTIONS.unshift(newQuestion);
    return simulateNetwork(newQuestion);
};
export const updateQuestion = (id: string, data: Omit<Question, 'id' | 'instructorId'>): Promise<Question | null> => {
    const index = QUESTIONS.findIndex(q => q.id === id);
    if (index > -1) {
        // FIX: Add a type assertion to resolve TypeScript's confusion with discriminated unions and spread syntax.
        QUESTIONS[index] = { ...QUESTIONS[index], ...data } as Question;
        return simulateNetwork(QUESTIONS[index]);
    }
    return simulateNetwork(null);
};
export const deleteQuestion = (id: string): Promise<{ success: boolean }> => {
    const initialLength = QUESTIONS.length;
    QUESTIONS = QUESTIONS.filter(q => q.id !== id);
    return simulateNetwork({ success: QUESTIONS.length < initialLength });
};

export const getRubrics = (instructorId: string): Promise<Rubric[]> => simulateNetwork(RUBRICS.filter(r => r.instructorId === instructorId));
export const createRubric = (data: Omit<Rubric, 'id'>): Promise<Rubric> => {
    const newRubric: Rubric = { ...data, id: `r${Date.now()}` };
    RUBRICS.unshift(newRubric);
    return simulateNetwork(newRubric);
};
export const updateRubric = (id: string, data: Omit<Rubric, 'id' | 'instructorId'>): Promise<Rubric | null> => {
    const index = RUBRICS.findIndex(r => r.id === id);
    if (index > -1) {
        RUBRICS[index] = { ...RUBRICS[index], ...data };
        return simulateNetwork(RUBRICS[index]);
    }
    return simulateNetwork(null);
};
export const deleteRubric = (id: string): Promise<{ success: boolean }> => {
    const initialLength = RUBRICS.length;
    RUBRICS = RUBRICS.filter(r => r.id !== id);
    return simulateNetwork({ success: RUBRICS.length < initialLength });
};

export const getInstructorExaminations = (instructorId: string): Promise<Examination[]> => simulateNetwork(EXAMINATIONS.filter(e => e.instructorId === instructorId));
export const getAdminAllExaminations = (): Promise<(Examination & { instructorName: string })[]> => {
     const data = EXAMINATIONS.map(e => {
        const instructor = USERS.find(u => u.id === e.instructorId);
        return { ...e, instructorName: instructor?.name || 'Unknown' };
    });
    return simulateNetwork(data);
};
export const createExamination = (data: Omit<Examination, 'id' | 'status' | 'courseTitle'>): Promise<Examination> => {
    const course = COURSES_DETAILED.find(c => c.id === data.courseId);
    const newExam: Examination = {
        ...data,
        id: `exam${Date.now()}`,
        status: ExaminationStatus.Draft,
        courseTitle: course?.title || 'Unknown Course',
    };
    EXAMINATIONS.unshift(newExam);
    return simulateNetwork(newExam);
};
export const updateExamination = (id: string, data: Partial<Omit<Examination, 'id' | 'status' | 'courseTitle'>>): Promise<Examination | null> => {
    const index = EXAMINATIONS.findIndex(e => e.id === id);
    if (index > -1) {
        EXAMINATIONS[index] = { ...EXAMINATIONS[index], ...data };
        const course = COURSES_DETAILED.find(c => c.id === EXAMINATIONS[index].courseId);
        EXAMINATIONS[index].courseTitle = course?.title || 'Unknown Course';
        return simulateNetwork(EXAMINATIONS[index]);
    }
    return simulateNetwork(null);
};
export const deleteExamination = (id: string): Promise<{ success: boolean }> => {
    const initialLength = EXAMINATIONS.length;
    EXAMINATIONS = EXAMINATIONS.filter(e => e.id !== id);
    return simulateNetwork({ success: EXAMINATIONS.length < initialLength });
};

export const getExaminationDetails = (examId: string): Promise<Examination | null> => {
    const exam = EXAMINATIONS.find(e => e.id === examId);
    return simulateNetwork(exam || null);
};

export const submitExamination = (studentId: string, examId: string, answers: Record<string, any>): Promise<Grade> => {
    const exam = EXAMINATIONS.find(e => e.id === examId)!;
    
    // Find the content item that links to this exam to create a grade
    let contentItemId: string | undefined;
    let courseId: string | undefined;
    COURSES_DETAILED.find(course => {
        return course.modules?.find(module => {
            return module.items.find(item => {
                if (item.examinationId === examId) {
                    contentItemId = item.id;
                    courseId = course.id;
                    return true;
                }
                return false;
            });
        });
    });

    if (!contentItemId || !courseId) {
        // Fallback if no linking item found, though this indicates a data consistency issue
        console.error(`Could not find a content item linking to examination ID ${examId}`);
        courseId = exam.courseId; // Use the courseId on the exam object itself
        contentItemId = `exam-submission-${examId}`; // Create a placeholder ID
    }
    
    let score = 0;
    let total = exam.questionIds.length;
    let needsManualGrading = false;

    exam.questionIds.forEach(qId => {
        const question = QUESTIONS.find(q => q.id === qId)!;
        const answer = answers[qId];
        if (answer === undefined) return;

        let isCorrect = false;
        switch(question.type) {
            case QuestionType.MultipleChoice: isCorrect = question.correctAnswerIndex === answer; break;
            case QuestionType.TrueFalse: isCorrect = question.correctAnswer === answer; break;
            case QuestionType.MultipleSelect: isCorrect = isMultipleSelectCorrect(question, answer as number[]); break;
            case QuestionType.FillBlank: isCorrect = isFillBlankCorrect(question, answer as string); break;
            case QuestionType.ShortAnswer: needsManualGrading = true; break;
        }
        if (isCorrect) score++;
    });
    
    const finalScore = total > 0 ? Math.round((score / total) * 100) : 100;

    const newGrade: Grade = {
        id: `g${Date.now()}`,
        studentId,
        courseId: courseId,
        contentItemId: contentItemId,
        score: needsManualGrading ? null : finalScore,
        status: needsManualGrading ? 'pending review' : 'graded',
    };
    GRADES.push(newGrade);
    
    return simulateNetwork(newGrade);
};


// --- STUDENT DATA ---

export const getStudentProgramDetails = (studentId: string): Promise<StudentProgramDetails | null> => {
    const student = USERS.find(u => u.id === studentId);
    if (!student?.programId) return simulateNetwork(null);
    
    const program = PROGRAMS.find(p => p.id === student.programId);
    if (!program) return simulateNetwork(null);

    const programCourses: ProgramCourse[] = program.courseIds.map(courseId => {
        const course = COURSES_DETAILED.find(c => c.id === courseId)!;
        const studentGrades = GRADES.filter(g => g.studentId === studentId && g.courseId === courseId && g.score !== null);
        const finalGrade = studentGrades.length > 0 ? Math.round(studentGrades.reduce((acc, g) => acc + g.score!, 0) / studentGrades.length) : null;
        let enrollmentStatus: ProgramCourse['enrollmentStatus'] = 'not_started';
        if (finalGrade) {
            enrollmentStatus = 'completed';
        } else if (ENROLLMENTS.some(e => e.studentId === studentId && e.courseId === courseId)) {
            enrollmentStatus = 'in_progress';
        }

        return {
            ...course,
            enrollmentStatus,
            finalGrade,
        };
    });
    
    const completedCourses = programCourses.filter(c => c.enrollmentStatus === 'completed').length;
    const progress = programCourses.length > 0 ? Math.round((completedCourses / programCourses.length) * 100) : 0;
    
    const details: StudentProgramDetails = {
        program,
        progress,
        courses: programCourses,
    };
    
    return simulateNetwork(details);
};

export const getStudentTranscript = (studentId: string): Promise<StudentTranscript | null> => {
    const student = USERS.find(u => u.id === studentId);
    if (!student) return simulateNetwork(null);

    // This is a complex mock. For demo purposes, we'll create a static transcript.
    const transcript: StudentTranscript = {
        studentName: student.name,
        studentId: student.id,
        programName: 'BSc. in Computer Science',
        semesters: [
            {
                semesterName: 'Spring 2024',
                courses: [
                    { courseCode: 'CS101', courseTitle: 'Introduction to Computer Science', credits: 3, grade: 'A-', gradePoints: 3.7 },
                    { courseCode: 'MA120', courseTitle: 'Calculus I', credits: 4, grade: 'B+', gradePoints: 3.3 },
                ],
                semesterGpa: 3.49,
            },
             {
                semesterName: 'Summer 2024',
                courses: [
                    { courseCode: 'DS202', courseTitle: 'Data Structures and Algorithms', credits: 3, grade: 'A', gradePoints: 4.0 },
                    { courseCode: 'PH201', courseTitle: 'Physics I', credits: 4, grade: 'B', gradePoints: 3.0 },
                ],
                semesterGpa: 3.43,
            }
        ],
        cumulativeGpa: 3.46,
    };
    return simulateNetwork(transcript);
};

export const getOverdueItems = (studentId: string): Promise<OverdueItem[]> => {
    const overdue: OverdueItem[] = [
        { id: 'ov1', title: 'Assignment 1: Simple Calculator', courseName: 'Introduction to Computer Science', dueDate: 'Yesterday', link: '/courses/cs101' },
    ];
    // A real implementation would check dates against today.
    return simulateNetwork(ENROLLMENTS.some(e => e.studentId === studentId) ? overdue : []);
};

export const getUpcomingDeadlines = (studentId: string): Promise<UpcomingDeadline[]> => {
    const deadlines: UpcomingDeadline[] = [
        { id: 'ud1', title: 'Quiz 1: Functions', courseName: 'Introduction to Computer Science', dueDate: 'in 3 days', type: 'quiz' },
        { id: 'ud2', title: 'Mid-Term Exam', courseName: 'Introduction to Computer Science', dueDate: 'in 6 days', type: 'exam' },
    ];
    return simulateNetwork(ENROLLMENTS.some(e => e.studentId === studentId) ? deadlines : []);
};

export const getRecentActivity = (studentId: string): Promise<RecentActivity[]> => {
    const activities: RecentActivity[] = [
        { id: 'ra1', type: 'grade', title: 'Grade Received', summary: 'Assignment 1 in Intro to CS was graded.', timestamp: '2024-08-04T11:00:00Z', link: '/grades', icon: 'PenSquare' },
        { id: 'ra2', type: 'message', title: 'New Message', summary: 'You have a new message from Instructor Sam.', timestamp: '2024-08-04T14:00:00Z', link: '/my-messages/mt1', icon: 'MessageSquare' },
        { id: 'ra3', type: 'announcement', title: 'New Announcement', summary: 'System Maintenance Scheduled...', timestamp: '2024-08-05T09:00:00Z', link: '/dashboard', icon: 'ScrollText' },
    ];
    return simulateNetwork(activities);
};


// --- GRADES & SUBMISSIONS ---

export const getCourseGrades = (courseId: string): Promise<{ gradableItems: ContentItem[], studentGrades: any[] }> => {
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (!course) return simulateNetwork({ gradableItems: [], studentGrades: [] });

    const gradableItems = course.modules?.flatMap(m => m.items.filter(i => i.type === ContentType.Quiz || i.type === ContentType.Assignment)) || [];
    const enrolledStudentIds = ENROLLMENTS.filter(e => e.courseId === courseId).map(e => e.studentId);
    const students = USERS.filter(u => enrolledStudentIds.includes(u.id));

    const studentGrades = students.map(student => {
        const grades: Record<string, Grade | null> = {};
        gradableItems.forEach(item => {
            const grade = GRADES.find(g => g.studentId === student.id && g.contentItemId === item.id);
            grades[item.id] = grade || null;
        });
        return {
            studentId: student.id,
            studentName: student.name,
            grades,
        };
    });

    return simulateNetwork({ gradableItems, studentGrades });
};

export const updateGrade = (studentId: string, courseId: string, contentItemId: string, score: number | null): Promise<Grade> => {
    let grade = GRADES.find(g => g.studentId === studentId && g.contentItemId === contentItemId);
    if (grade) {
        grade.score = score;
        grade.status = 'graded';
    } else {
        grade = {
            id: `g${Date.now()}`,
            studentId,
            courseId,
            contentItemId,
            score,
            status: 'graded',
        };
        GRADES.push(grade);
    }
    return simulateNetwork(grade);
};

export const getStudentGradesForCourse = (studentId: string, courseId: string): Promise<{ contentItemTitle: string, score: number | null }[]> => {
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (!course) return simulateNetwork([]);

    const studentGrades = GRADES.filter(g => g.studentId === studentId && g.courseId === courseId);
    const gradableItems = course.modules?.flatMap(m => m.items) || [];

    const result = studentGrades.map(grade => {
        const item = gradableItems.find(i => i.id === grade.contentItemId);
        return {
            contentItemTitle: item?.title || 'Unknown Item',
            score: grade.score,
        };
    });
    return simulateNetwork(result);
};

export const getStudentSubmissionsForContent = (studentId: string, contentItemId: string): Promise<QuizSubmission[]> => {
    const submissions = QUIZ_SUBMISSIONS.filter(s => s.studentId === studentId && s.contentItemId === contentItemId);
    return simulateNetwork(submissions);
};

export const submitQuiz = (studentId: string, courseId: string, contentItemId: string, answers: Record<string, any>): Promise<Grade> => {
    // In a real app, this would be a complex scoring logic on the backend.
    // For mock, let's calculate a simple score.
    const course = COURSES_DETAILED.find(c => c.id === courseId)!;
    const item = course.modules!.flatMap(m => m.items).find(i => i.id === contentItemId)!;
    
    let score = 0;
    let total = item.questionIds!.length;
    let needsManualGrading = false;

    item.questionIds!.forEach(qId => {
        const question = QUESTIONS.find(q => q.id === qId)!;
        const answer = answers[qId];
        if (answer === undefined) return;

        let isCorrect = false;
        switch(question.type) {
            case QuestionType.MultipleChoice: isCorrect = question.correctAnswerIndex === answer; break;
            case QuestionType.TrueFalse: isCorrect = question.correctAnswer === answer; break;
            case QuestionType.MultipleSelect: isCorrect = isMultipleSelectCorrect(question, answer); break;
            case QuestionType.FillBlank: isCorrect = isFillBlankCorrect(question, answer); break;
            case QuestionType.ShortAnswer: needsManualGrading = true; break;
        }
        if (isCorrect) score++;
    });
    
    const newSubmission: QuizSubmission = {
        id: `sub${Date.now()}`,
        type: 'quiz',
        studentId,
        courseId,
        contentItemId,
        submittedAt: new Date().toISOString(),
        answers,
        attemptNumber: 1, // Mock
    };
    QUIZ_SUBMISSIONS.push(newSubmission);

    const finalScore = total > 0 ? Math.round((score / total) * 100) : 100;
    const newGrade: Grade = {
        id: `g${Date.now()}`,
        studentId,
        courseId,
        contentItemId,
        score: needsManualGrading ? null : finalScore,
        status: needsManualGrading ? 'pending review' : 'graded',
        submissionId: newSubmission.id,
    };
    GRADES.push(newGrade);
    
    return simulateNetwork(newGrade);
};

export const submitAssignment = (studentId: string, courseId: string, contentItemId: string, file: { name: string, size: number }): Promise<AssignmentSubmission> => {
    const newSubmission: AssignmentSubmission = {
        id: `asub${Date.now()}`,
        type: 'assignment',
        studentId,
        courseId,
        contentItemId,
        submittedAt: new Date().toISOString(),
        file: { ...file, url: '#' }
    };
    ASSIGNMENT_SUBMISSIONS.push(newSubmission);

    const newGrade: Grade = {
        id: `g${Date.now()}`,
        studentId,
        courseId,
        contentItemId,
        score: null,
        status: 'pending review',
        submissionId: newSubmission.id,
    };
    GRADES.push(newGrade);
    
    return simulateNetwork(newSubmission);
};

export const getAssignmentSubmissionForStudent = (studentId: string, assignmentId: string): Promise<AssignmentSubmission | null> => {
    const submission = ASSIGNMENT_SUBMISSIONS.find(s => s.studentId === studentId && s.contentItemId === assignmentId);
    return simulateNetwork(submission || null);
};


export const getSubmissionDetails = (submissionId: string): Promise<{ submission: Submission, questions: Question[] | null, rubric: Rubric | null } | null> => {
    const submission: Submission | undefined = [...QUIZ_SUBMISSIONS, ...ASSIGNMENT_SUBMISSIONS].find(s => s.id === submissionId);
    if (!submission) return simulateNetwork(null);

    const course = COURSES_DETAILED.find(c => c.id === submission.courseId)!;
    const item = course.modules!.flatMap(m => m.items).find(i => i.id === submission.contentItemId)!;

    let questions: Question[] | null = null;
    if (submission.type === 'quiz' && item.questionIds) {
        questions = QUESTIONS.filter(q => item.questionIds!.includes(q.id));
    }
    
    let rubric: Rubric | null = null;
    if (item.rubricId) {
        rubric = RUBRICS.find(r => r.id === item.rubricId) || null;
    }
    
    return simulateNetwork({ submission, questions, rubric });
};

export const gradeManualSubmission = (submissionId: string, scores: Record<string, number>): Promise<{ success: boolean }> => {
    const grade = GRADES.find(g => g.submissionId === submissionId);
    if (!grade) return simulateNetwork({ success: false });

    // Mock scoring
    let totalScore = 0;
    let maxScore = 0;

    const submission = [...QUIZ_SUBMISSIONS, ...ASSIGNMENT_SUBMISSIONS].find(s => s.id === submissionId)!;
    const course = COURSES_DETAILED.find(c => c.id === submission.courseId)!;
    const item = course.modules!.flatMap(m => m.items).find(i => i.id === submission.contentItemId)!;
    
    if (item.rubricId) {
        const rubric = RUBRICS.find(r => r.id === item.rubricId)!;
        rubric.criteria.forEach(c => {
            totalScore += scores[`criterion-${c.id}`] || 0;
            maxScore += c.points;
        });
    } else if (item.questionIds) {
        // Simple quiz scoring
        item.questionIds.forEach(qId => {
            totalScore += scores[qId] || 0;
            maxScore += 1;
        });
    }
    
    grade.score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    grade.status = 'graded';

    return simulateNetwork({ success: true });
};


// --- COMMUNICATIONS ---

export const getAnnouncements = (): Promise<Announcement[]> => simulateNetwork(ANNOUNCEMENTS);
export const getLatestAnnouncement = (): Promise<Announcement | null> => simulateNetwork(ANNOUNCEMENTS.length > 0 ? ANNOUNCEMENTS[0] : null);
export const createAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    const newAnnouncement: Announcement = { ...data, id: `a${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    ANNOUNCEMENTS.unshift(newAnnouncement);
    return simulateNetwork(newAnnouncement);
};
export const updateAnnouncement = (id: string, data: Partial<Announcement>): Promise<Announcement | null> => {
    const index = ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (index > -1) {
        ANNOUNCEMENTS[index] = { ...ANNOUNCEMENTS[index], ...data };
        return simulateNetwork(ANNOUNCEMENTS[index]);
    }
    return simulateNetwork(null);
};
export const deleteAnnouncement = (id: string): Promise<{ success: boolean }> => {
    const initialLength = ANNOUNCEMENTS.length;
    ANNOUNCEMENTS = ANNOUNCEMENTS.filter(a => a.id !== id);
    return simulateNetwork({ success: ANNOUNCEMENTS.length < initialLength });
};

export const getNotifications = (userId: string): Promise<Notification[]> => simulateNetwork(NOTIFICATIONS.filter(n => n.userId === userId));
export const markNotificationAsRead = (notificationId: string): Promise<{ success: boolean }> => {
    const notification = NOTIFICATIONS.find(n => n.id === notificationId);
    if (notification) {
        notification.isRead = true;
        return simulateNetwork({ success: true });
    }
    return simulateNetwork({ success: false });
};
export const markAllNotificationsAsRead = (userId: string): Promise<{ success: boolean }> => {
    NOTIFICATIONS.forEach(n => {
        if (n.userId === userId) {
            n.isRead = true;
        }
    });
    return simulateNetwork({ success: true });
};

export const getCommunications = (): Promise<Communication[]> => simulateNetwork(COMMUNICATIONS);
export const sendCommunication = (data: Omit<Communication, 'id' | 'sentAt'>): Promise<Communication> => {
    const newComm: Communication = { ...data, id: `comm${Date.now()}`, sentAt: new Date().toISOString() };
    COMMUNICATIONS.unshift(newComm);
    return simulateNetwork(newComm);
};

export const getMessageThreads = (userId: string): Promise<MessageThread[]> => {
    const threads = MESSAGE_THREADS.filter(t => t.participants.some(p => p.id === userId));
    return simulateNetwork(threads.sort((a,b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()));
};

export const getMessageThreadDetails = (threadId: string): Promise<MessageThread | null> => {
    const thread = MESSAGE_THREADS.find(t => t.id === threadId);
    if (!thread) return simulateNetwork(null);
    const messages = MESSAGES.filter(m => m.threadId === threadId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return simulateNetwork({ ...thread, messages });
};

export const sendMessage = (threadId: string, content: string, author: User): Promise<Message> => {
    const newMessage: Message = {
        id: `m${Date.now()}`,
        threadId,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
    };
    MESSAGES.push(newMessage);
    
    // Update last message in thread
    const thread = MESSAGE_THREADS.find(t => t.id === threadId);
    if (thread) {
        thread.lastMessage = { content, createdAt: newMessage.createdAt };
    }
    
    return simulateNetwork(newMessage);
};

export const createNewThread = (participants: Pick<User, 'id' | 'name' | 'avatarUrl'>[], subject: string, content: string, author: User): Promise<MessageThread> => {
    const newThread: MessageThread = {
        id: `mt${Date.now()}`,
        participants,
        subject,
        lastMessage: { content, createdAt: new Date().toISOString() },
        isRead: false,
    };
    
    const newMessage: Message = {
        id: `m${Date.now()}`,
        threadId: newThread.id,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: newThread.lastMessage.createdAt,
    };
    
    MESSAGE_THREADS.unshift(newThread);
    MESSAGES.push(newMessage);
    
    return simulateNetwork(newThread);
};

// --- ADMIN & REPORTING ---

export const getAdminStats = (): Promise<StatCardData[]> => {
    const stats: StatCardData[] = [
        { icon: 'Users', title: 'Total Users', value: USERS.length.toString(), color: 'primary' },
        { icon: 'Book', title: 'Total Courses', value: COURSES_DETAILED.length.toString(), color: 'secondary' },
        { icon: 'GraduationCap', title: 'Active Students', value: USERS.filter(u => u.role === UserRole.Student && u.status === UserStatus.Active).length.toString(), color: 'success' },
        { icon: 'User', title: 'Pending Users', value: USERS.filter(u => u.status === UserStatus.Pending).length.toString(), color: 'warning' },
    ];
    return simulateNetwork(stats);
};

export const getInstructorStats = (instructorId: string): Promise<StatCardData[]> => {
    const coursesTaught = COURSES_DETAILED.filter(c => c.instructorId === instructorId).length;
    const studentCount = new Set(ENROLLMENTS.filter(e => COURSES_DETAILED.some(c => c.id === e.courseId && c.instructorId === instructorId)).map(e => e.studentId)).size;
    
    const stats: StatCardData[] = [
        { icon: 'BookOpen', title: 'My Courses', value: coursesTaught.toString(), color: 'primary' },
        { icon: 'Users', title: 'Total Students', value: studentCount.toString(), color: 'secondary' },
        { icon: 'PenSquare', title: 'Grading Queue', value: '3', color: 'warning' },
        { icon: 'ClipboardCheck', title: 'Published Quizzes', value: '12', color: 'info' },
    ];
    return simulateNetwork(stats);
};

export const getActivityLogs = (): Promise<ActivityLog[]> => simulateNetwork(ACTIVITY_LOGS);
export const getActiveSessions = (): Promise<UserSession[]> => simulateNetwork(ACTIVE_SESSIONS);
export const terminateSession = (sessionId: string): Promise<{ success: boolean }> => {
    const initialLength = ACTIVE_SESSIONS.length;
    ACTIVE_SESSIONS = ACTIVE_SESSIONS.filter(s => s.id !== sessionId);
    return simulateNetwork({ success: ACTIVE_SESSIONS.length < initialLength });
};

export const getEnrollmentReport = (): Promise<any[]> => {
     const report = ENROLLMENTS.map(e => {
        const student = USERS.find(u => u.id === e.studentId);
        const course = COURSES_DETAILED.find(c => c.id === e.courseId);
        const program = PROGRAMS.find(p => p.id === student?.programId);
        return {
            studentName: student?.name,
            courseTitle: course?.title,
            programName: program?.name,
            programId: program?.id,
            enrollmentDate: 'N/A'
        };
    });
    return simulateNetwork(report);
};
export const getCourseCompletionReport = (): Promise<any[]> => {
    const report = [
        { courseTitle: 'Introduction to Computer Science', completionRate: 85 },
        { courseTitle: 'Data Structures and Algorithms', completionRate: 72 },
        { courseTitle: 'Web Development Fundamentals', completionRate: 91 },
    ];
    return simulateNetwork(report);
};
export const getInstructorActivityReport = (): Promise<any[]> => {
    const instructors = USERS.filter(u => u.role === UserRole.Instructor);
    const report = instructors.map(inst => {
        const courses = COURSES_DETAILED.filter(c => c.instructorId === inst.id);
        const courseIds = new Set(courses.map(c => c.id));
        const totalStudents = new Set(ENROLLMENTS.filter(e => courseIds.has(e.courseId)).map(e => e.studentId)).size;
        return {
            instructorId: inst.id,
            instructorName: inst.name,
            coursesTaught: courses.length,
            totalStudents
        };
    });
    return simulateNetwork(report);
};
export const getGradeDistributionReport = (): Promise<any[]> => {
    const report = [
        { range: '90-100%', count: 23 },
        { range: '80-89%', count: 45 },
        { range: '70-79%', count: 31 },
        { range: '60-69%', count: 15 },
        { range: '<60%', count: 8 },
    ];
    return simulateNetwork(report);
};

// --- CERTIFICATES ---

export const getCertificateSettings = (): Promise<CertificateSettings> => simulateNetwork(CERTIFICATE_SETTINGS);
export const updateCertificateSettings = (settings: CertificateSettings): Promise<CertificateSettings> => {
    Object.assign(CERTIFICATE_SETTINGS, settings);
    return simulateNetwork(CERTIFICATE_SETTINGS);
};
export const getCertificateRequests = (): Promise<CertificateRequest[]> => simulateNetwork(CERTIFICATE_REQUESTS.filter(r => r.status === CertificateRequestStatus.Pending));
export const approveCertificateRequest = (requestId: string): Promise<{ success: boolean }> => {
    const req = CERTIFICATE_REQUESTS.find(r => r.id === requestId);
    if(req) req.status = CertificateRequestStatus.Approved;
    return simulateNetwork({ success: !!req });
};
export const denyCertificateRequest = (requestId: string): Promise<{ success: boolean }> => {
    const req = CERTIFICATE_REQUESTS.find(r => r.id === requestId);
    if(req) req.status = CertificateRequestStatus.Denied;
    return simulateNetwork({ success: !!req });
};
export const getStudentCertificates = (studentId: string): Promise<Certificate[]> => {
    const student = USERS.find(u => u.id === studentId);
    return simulateNetwork(student ? CERTIFICATES.filter(c => c.studentName === student.name) : []);
};
export const getStudentAchievements = (studentId: string): Promise<Achievement[]> => simulateNetwork(ACHIEVEMENTS);


// --- CALENDAR ---

export const getCalendarEvents = (): Promise<CalendarEvent[]> => simulateNetwork(CALENDAR_EVENTS);

// --- DISCUSSIONS ---
export const getPostsForDiscussion = (discussionId: string): Promise<DiscussionPost[]> => {
    return simulateNetwork(DISCUSSION_POSTS.filter(p => p.discussionId === discussionId));
};

export const createDiscussionPost = (discussionId: string, content: string, author: User, parentId?: string): Promise<DiscussionPost> => {
    const newPost: DiscussionPost = {
        id: `dp${Date.now()}`,
        discussionId,
        parentId,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
        isRead: true, // It's read by the author
    };
    DISCUSSION_POSTS.push(newPost);
    return simulateNetwork(newPost);
};

export const markDiscussionPostAsRead = (postId: string): Promise<{ success: boolean }> => {
    const post = DISCUSSION_POSTS.find(p => p.id === postId);
    if(post) {
        post.isRead = true;
        return simulateNetwork({ success: true });
    }
    return simulateNetwork({ success: false });
};