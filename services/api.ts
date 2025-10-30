import { User, UserRole, UserStatus, StatCardData, CourseSummary, Department, Program, Semester, SemesterStatus, Course, CourseStatus, Module, ContentType, ContentItem, Announcement, Enrollment, Grade, CalendarEvent, CalendarEventType, DiscussionPost, Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, QuizSubmission, MultipleSelectQuestion, FillBlankQuestion, Rubric, StudentProgramDetails, ProgramCourse, Communication, SecuritySettings, StudentTranscript, Message, MessageThread, Examination, ExaminationStatus, Certificate, Achievement, CertificateSettings, CertificateRequest, CertificateRequestStatus, InstitutionSettings, ActivityLog, ActivityActionType, UserSession, Notification, NotificationType, OverdueItem, UpcomingDeadline, RecentActivity, IconName, ContentItemDetails, AssignmentSubmission, Submission, QuestionDifficulty, MediaItem, MediaType, CourseGradingSummary, GradableItemSummary, StudentSubmissionDetails } from '../types';
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
                { id: 'cs101-c9', title: 'Assignment 1: Simple Calculator', type: ContentType.Assignment, rubricId: 'r1', requiresFileUpload: true, instructions: 'Create a simple command-line calculator that can perform addition, subtraction, multiplication, and division.' },
            ]},
            { id: 'cs101-m4', title: 'Week 4: Functions and Scope (Aug 26 - Sep 1)', items: [
                { id: 'cs101-c10', title: 'Lesson: Defining and Calling Functions', type: ContentType.Lesson },
                { id: 'cs101-c11', title: 'Lesson: Parameters, Arguments, and Scope', type: ContentType.Lesson },
                { id: 'cs101-c12', title: 'Quiz 1: Functions', type: ContentType.Quiz, questionIds: ['q11', 'q12', 'q13'], timeLimit: 20, attemptsLimit: 2, instructions: 'A graded quiz on functions.' },
            ]},
            { id: 'cs101-m5', title: 'Week 5: Mid-Term Exam (Sep 2 - Sep 8)', items: [
                { id: 'cs101-c13', title: 'Mid-Term Review Guide', type: ContentType.Resource },
                { id: 'cs101-c14', title: 'Mid-Term Exam', type: ContentType.Examination, examinationId: 'exam1', instructions: 'This is a closed-book exam covering all material from weeks 1 through 4.' },
            ]},
            { id: 'cs101-m6', title: 'Week 6: Data Structures (Sep 9 - Sep 15)', items: [
                { id: 'cs101-c15', title: 'Lesson: Arrays and Lists', type: ContentType.Lesson },
                { id: 'cs101-c16', title: 'Lesson: Objects and Dictionaries', type: ContentType.Lesson },
                { id: 'cs101-c17', title: 'Assignment 2: Contact List Manager', type: ContentType.Assignment, rubricId: 'r1', requiresFileUpload: true, instructions: 'Build a program to manage a list of contacts using arrays and objects.' },
            ]},
            { id: 'cs101-m7', title: 'Introduction to Algorithms (Sep 16 - Sep 22)', items: [
                { id: 'cs101-c18', title: 'Lesson: What is an Algorithm?', type: ContentType.Lesson },
                { id: 'cs101-c19', title: 'Lesson: Searching and Sorting', type: ContentType.Lesson },
                { id: 'cs101-c20', title: 'Discussion: Algorithm Efficiency', type: ContentType.Discussion },
            ]},
            { id: 'cs101-m8', title: 'Week 8: Final Project & Exam (Sep 23 - Sep 29)', items: [
                { id: 'cs101-c21', title: 'Final Project: Overview and Requirements', type: ContentType.Lesson },
                { id: 'cs101-c22', title: 'Final Project Submission', type: ContentType.Assignment, rubricId: 'r2', requiresFileUpload: true, instructions: 'Submit your final project files here.' },
                { id: 'cs101-c23', title: 'Final Exam', type: ContentType.Examination, examinationId: 'exam3', rubricId: 'r2' },
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
    { id: 'g6', studentId: '7', courseId: 'cs101', contentItemId: 'cs101-c17', score: null, status: 'pending review', submissionId: 'asub2' },
];

let QUIZ_SUBMISSIONS: QuizSubmission[] = [
    { id: 'sub1', type: 'quiz', studentId: '3', courseId: 'cs101', contentItemId: 'cs101-c12', submittedAt: '2024-08-03T10:00:00Z', answers: { q11: 1, q12: 'return', q13: false }, attemptNumber: 1 },
    { id: 'sub2', type: 'quiz', studentId: '7', courseId: 'cs101', contentItemId: 'cs101-c12', submittedAt: '2024-08-03T11:00:00Z', answers: { q11: 1, q12: 'return', q13: false }, attemptNumber: 1 },
    { id: 'sub3', type: 'quiz', studentId: '8', courseId: 'cs101', contentItemId: 'cs101-c12', submittedAt: '2024-08-03T12:00:00Z', answers: { q11: 2, q12: 'send', q13: true }, attemptNumber: 1 },
];

let ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [
    { id: 'asub1', type: 'assignment', studentId: '3', courseId: 'cs101', contentItemId: 'cs101-c9', submittedAt: '2024-08-24T18:00:00Z', file: { name: 'Research_Paper.pdf', size: 13264, url: 'https://govfileastorage.s3.us-east-1.amazonaws.com/gazettes/a617802d-44e3-4fd4-8373-2d1634e60fc6-Kenya+Gazette+Vol+CXXVINo+230.pdf' } },
    { id: 'asub2', type: 'assignment', studentId: '7', courseId: 'cs101', contentItemId: 'cs101-c17', submittedAt: '2024-09-14T10:00:00Z', file: { name: 'Final_Essay.docx', size: 25480, url: 'https://docs.google.com/document/d/1HMoDXA16tvxeJycpnTibictO51d5m08M/export?format=docx' } },
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
    { id: 'dp1', discussionId: 'cs101-c3', authorId: '2', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, authorRole: UserRole.Instructor, content: "Welcome aboard, everyone. To get started, please introduce yourselves! Feel free to share your hobbies, what you're excited to learn, or even a picture of your pet. Let's build a great community here!", createdAt: new Date('2024-08-01T09:05:00Z').toISOString(), isRead: true, replyCount: 2 },
    { id: 'dp2', discussionId: 'cs101-c3', parentId: 'dp1', authorId: '3', authorName: 'Student Anna', authorAvatarUrl: USERS[2].avatarUrl, authorRole: UserRole.Student, content: "Hi everyone! I'm Anna, excited to learn with you all. I have a golden retriever named Sparky!", createdAt: new Date('2024-08-01T10:00:00Z').toISOString(), isRead: true, replyCount: 1 },
    { id: 'dp3', discussionId: 'cs101-c3', parentId: 'dp2', authorId: '7', authorName: 'Alice Johnson', authorAvatarUrl: USERS[6].avatarUrl, authorRole: UserRole.Student, content: "Hey Anna! Welcome to the course. I love golden retrievers!", createdAt: new Date('2024-08-01T11:30:00Z').toISOString(), isRead: false, replyCount: 0 },
    { id: 'dp4', discussionId: 'cs101-c3', parentId: 'dp1', authorId: '8', authorName: 'Charlie Brown', authorAvatarUrl: USERS[7].avatarUrl, authorRole: UserRole.Student, content: "Thanks for creating this space, Professor. I have a cat named Whiskers.", createdAt: new Date('2024-08-01T13:00:00Z').toISOString(), isRead: false, replyCount: 0 },

    // --- Discussion: cs101-c20 (Algorithm Efficiency) ---
    { id: 'dp5', discussionId: 'cs101-c20', authorId: '7', authorName: 'Alice Johnson', authorAvatarUrl: USERS[6].avatarUrl, authorRole: UserRole.Student, content: "My real-world analogy for Linear vs Binary search is looking for a specific page in a book. Linear search is flipping through page by page from the start. Binary search is opening the book to the middle, seeing if your page number is higher or lower, and then repeating that with the correct half. It's so much faster!", createdAt: new Date('2024-09-18T10:00:00Z').toISOString(), isRead: true, replyCount: 1 },
    { id: 'dp6', discussionId: 'cs101-c20', parentId: 'dp5', authorId: '2', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, authorRole: UserRole.Instructor, content: "Excellent analogy, Alice! That's a perfect way to describe it.", createdAt: new Date('2024-09-18T11:00:00Z').toISOString(), isRead: true, replyCount: 0 },
];

let QUESTIONS: Question[] = [
    { id: 'q1', type: QuestionType.MultipleChoice, stem: 'What is the correct syntax to output "Hello World" in Python?', options: ['echo "Hello World"', 'printf("Hello World")', 'print("Hello World")', 'cout << "Hello World"'], correctAnswerIndex: 2, instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['python', 'syntax', 'output'], courseId: 'cs101', moduleId: 'cs101-m2', isPublic: true, imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' },
    { id: 'q2', type: QuestionType.MultipleChoice, stem: 'Which of the following data types is mutable in Python?', options: ['Tuple', 'String', 'List', 'Integer'], correctAnswerIndex: 2, instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['python', 'data types', 'mutability'], courseId: 'cs101', moduleId: 'cs101-m2', isPublic: false },
    { id: 'q3', type: QuestionType.MultipleChoice, stem: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], correctAnswerIndex: 0, instructorId: '6', difficulty: QuestionDifficulty.Easy, topics: ['html', 'web dev'], courseId: 'wd101', isPublic: true },
    { id: 'q4', type: QuestionType.TrueFalse, stem: 'The `main` function is the entry point for every C++ program.', correctAnswer: true, instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['c++', 'fundamentals'], courseId: 'cs101', isPublic: false },
    { id: 'q5', type: QuestionType.ShortAnswer, stem: 'What keyword is used to declare a variable that cannot be reassigned in JavaScript?', acceptableAnswers: ['const'], instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['javascript', 'variables'], courseId: 'wd101', isPublic: true },
    { id: 'q6', type: QuestionType.MultipleSelect, stem: 'Which of the following are primitive data types in JavaScript?', options: ['String', 'Object', 'Boolean', 'Array'], correctAnswerIndices: [0, 2], instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['javascript', 'data types'], courseId: 'wd101', isPublic: true },
    { id: 'q7', type: QuestionType.FillBlank, stem: 'The method to add an element to the end of an ____ is `.push()`.', acceptableAnswers: ['array'], instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['javascript', 'arrays'], courseId: 'wd101', isPublic: false },
    // New Questions for CS101
    { id: 'q8', type: QuestionType.MultipleChoice, stem: 'In programming, what is a variable?', options: ['A fixed value that never changes', 'A named storage location for data', 'A type of function', 'A hardware component'], correctAnswerIndex: 1, instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['programming concepts', 'variables'], courseId: 'cs101', moduleId: 'cs101-m2', isPublic: true },
    { id: 'q9', type: QuestionType.TrueFalse, stem: 'In JavaScript, `x = 5` is used for comparing if x is equal to 5.', correctAnswer: false, instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['javascript', 'operators'], courseId: 'cs101', moduleId: 'cs101-m2', isPublic: false },
    { id: 'q10', type: QuestionType.MultipleChoice, stem: 'Which operator checks for both value and type equality in JavaScript?', options: ['=', '==', '===', '!='], correctAnswerIndex: 2, instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['javascript', 'operators'], courseId: 'cs101', moduleId: 'cs101-m2', isPublic: true },
    { id: 'q11', type: QuestionType.MultipleChoice, stem: 'What is the main purpose of a function in programming?', options: ['To store a single piece of data', 'To group reusable code that performs a specific task', 'To create loops', 'To define the color of a web page'], correctAnswerIndex: 1, instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['programming concepts', 'functions'], courseId: 'cs101', moduleId: 'cs101-m4', isPublic: true },
    { id: 'q12', type: QuestionType.ShortAnswer, stem: 'What keyword is used to send a value back from a function?', acceptableAnswers: ['return'], instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['functions'], courseId: 'cs101', moduleId: 'cs101-m4', isPublic: false },
    { id: 'q13', type: QuestionType.TrueFalse, stem: 'Variables declared with `let` inside a function are accessible from anywhere in the program.', correctAnswer: false, instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['scope', 'variables'], courseId: 'cs101', moduleId: 'cs101-m4', isPublic: false },
    { id: 'q14', type: QuestionType.MultipleChoice, stem: 'Which data structure is best for storing a collection of key-value pairs?', options: ['Array', 'Object', 'Set', 'String'], correctAnswerIndex: 1, instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['data structures', 'objects'], courseId: 'cs101', moduleId: 'cs101-m6', isPublic: true },
    { id: 'q15', type: QuestionType.MultipleSelect, stem: 'Which of the following are common sorting algorithms? (Select all that apply)', options: ['Bubble Sort', 'Linear Search', 'Merge Sort', 'Binary Search'], correctAnswerIndices: [0, 2], instructorId: '2', difficulty: QuestionDifficulty.Hard, topics: ['algorithms', 'sorting'], courseId: 'cs101', moduleId: 'cs101-m7', isPublic: true },
    { id: 'q16', type: QuestionType.FillBlank, stem: 'Big O notation is used to describe the ____ of an algorithm.', acceptableAnswers: ['efficiency', 'performance', 'complexity'], instructorId: '2', difficulty: QuestionDifficulty.Hard, topics: ['algorithms', 'big o'], courseId: 'ds202', isPublic: true },
    { id: 'q17', type: QuestionType.TrueFalse, stem: 'On a large, sorted dataset, a linear search is generally faster than a binary search.', correctAnswer: false, instructorId: '2', difficulty: QuestionDifficulty.Medium, topics: ['algorithms', 'search'], courseId: 'ds202', isPublic: false },
    { id: 'q18', type: QuestionType.ShortAnswer, stem: 'What does the acronym IDE stand for?', acceptableAnswers: ['Integrated Development Environment'], instructorId: '2', difficulty: QuestionDifficulty.Easy, topics: ['tools'], courseId: 'cs101', isPublic: true },
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
            { id: 'c1', description: 'Code Correctness & Functionality', longDescription: 'The program runs without errors and produces the correct output for all test cases.', points: 4, levelDescriptions: { 'l1': 'Code is fully functional and correct.', 'l2': 'Code has minor errors but is mostly functional.', 'l3': 'Code has significant errors.', 'l4': 'Code does not run or is fundamentally incorrect.'} },
            { id: 'c2', description: 'Code Readability & Style', longDescription: 'Code is well-formatted, uses meaningful variable names, and includes helpful comments.', points: 4, levelDescriptions: { 'l1': 'Excellent readability and style.', 'l2': 'Good style with some minor issues.', 'l3': 'Code is difficult to read.', 'l4': 'Code is unreadable.'} },
            { id: 'c3', description: 'Problem-Solving Approach', longDescription: 'The solution is efficient and demonstrates a clear understanding of the concepts.', points: 4, levelDescriptions: { 'l1': 'Elegant and efficient solution.', 'l2': 'A working solution that could be more efficient.', 'l3': 'An inefficient or overly complex solution.', 'l4': 'The approach does not solve the problem.'} },
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

let MEDIA_ITEMS: MediaItem[] = [
    { id: 'media1', instructorId: '2', name: 'python_logo.png', type: MediaType.Image, url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713', size: 125829, uploadedAt: new Date('2024-08-01T10:00:00Z').toISOString() },
    { id: 'media2', instructorId: '2', name: 'lecture-intro.mp4', type: MediaType.Video, url: '#', size: 58291039, uploadedAt: new Date('2024-08-02T14:30:00Z').toISOString() },
    { id: 'media3', instructorId: '2', name: 'syllabus.pdf', type: MediaType.Document, url: '#', size: 50293, uploadedAt: new Date('2024-07-30T09:00:00Z').toISOString() },
    { id: 'media4', instructorId: '6', name: 'business-chart.png', type: MediaType.Image, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', size: 203948, uploadedAt: new Date('2024-07-25T11:00:00Z').toISOString() },
    { id: 'media5', instructorId: '2', name: 'welcome-audio.mp3', type: MediaType.Audio, url: '#', size: 2048576, uploadedAt: new Date('2024-08-03T18:00:00Z').toISOString() },
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
        content: `<h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-2">CS101: Introduction to Computer Science - Syllabus</h2><section class="syllabus-section"><h3 class="syllabus-header">Course Description</h3><p class="syllabus-content">This course provides a comprehensive introduction to the fundamental concepts of computer science and programming. Students will learn the basics of computational thinking, problem-solving, and software development. Topics include data types, control flow, functions, data structures, and basic algorithms. The course is language-agnostic in its concepts but will use JavaScript for examples and assignments.</p></section><section class="syllabus-section"><h3 class="syllabus-header">Learning Objectives</h3><ul class="syllabus-list"><li>Understand and apply fundamental programming concepts.</li><li>Analyze problems and develop algorithmic solutions.</li><li>Write, debug, and test simple computer programs.</li><li>Understand the role of basic data structures like arrays and objects.</li><li>Work with functions to create modular and reusable code.</li></ul></section><section class="syllabus-section"><h3 class="syllabus-header">Grading Policy</h3><p class="syllabus-content mb-4">Your final grade will be determined by your performance on the following components:</p><table class="grading-table border-collapse w-full"><thead><tr><th class="p-2 border font-medium text-left">Component</th><th class="p-2 border font-medium text-center">Weight</th></tr></thead><tbody><tr><td class="p-2 border">Assignments (2)</td><td class="p-2 border text-center">30%</td></tr><tr><td class="p-2 border">Quizzes (2)</td><td class="p-2 border text-center">20%</td></tr><tr><td class="p-2 border">Mid-Term Exam</td><td class="p-2 border text-center">20%</td></tr><tr><td class="p-2 border">Final Project</td><td class="p-2 border text-center">30%</td></tr><tr><td class="p-2 border font-bold">Total</td><td class="p-2 border text-center font-bold">100%</td></tr></tbody></table></section><style>.syllabus-section{margin-bottom:1.5rem;}.syllabus-header{font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;padding-bottom:0.25rem;border-bottom-width:2px;}.syllabus-list{list-style-position:inside;list-style-type:disc;padding-left:1.25rem;}.grading-table th, .grading-table td{padding:0.75rem;border-width:1px;}</style>`
    },
];

// --- MOCK API IMPLEMENTATION ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth & User ---
export const login = async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    const user = USERS.find(u => u.email === email);
    // In a real app, you'd check the password hash
    if (user) {
        return user;
    }
    return null;
};

export const signupUser = async (userData: Omit<User, 'id' | 'avatarUrl' | 'createdAt'>): Promise<User> => {
    await delay(500);
    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    USERS.unshift(newUser);
    return newUser;
};

export const getAllUsers = async (): Promise<User[]> => {
    await delay(500);
    return [...USERS];
};

export const getRecentUsers = async (limit: number): Promise<User[]> => {
    await delay(300);
    return USERS.slice(0, limit);
};

export const getAllInstructors = async (): Promise<User[]> => {
    await delay(300);
    return USERS.filter(u => u.role === UserRole.Instructor);
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
    await delay(500);
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'New User',
        email: userData.email || `new${Date.now()}@example.com`,
        role: userData.role || UserRole.Student,
        status: userData.status || UserStatus.Pending,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    USERS.unshift(newUser);
    return newUser;
};

export const updateUser = async (userId: string, updatedData: Partial<User>): Promise<User | null> => {
    await delay(500);
    const userIndex = USERS.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        USERS[userIndex] = { ...USERS[userIndex], ...updatedData };
        return USERS[userIndex];
    }
    return null;
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    await delay(500);
    const initialLength = USERS.length;
    USERS = USERS.filter(u => u.id !== userId);
    return { success: USERS.length < initialLength };
};

export const changeUserPassword = async (userId: string, current: string, newPass: string): Promise<{ success: boolean, message: string }> => {
    await delay(800);
    // This is a mock; in a real app, you'd validate the current password.
    if (current === "password123") { // Mock "wrong password"
        return { success: false, message: "Your current password is not correct." };
    }
    return { success: true, message: "Password updated successfully." };
};

// --- Notifications ---
export const getNotifications = async (userId: string): Promise<Notification[]> => {
    await delay(300);
    return NOTIFICATIONS.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await delay(100);
    const notification = NOTIFICATIONS.find(n => n.id === notificationId);
    if (notification) {
        notification.isRead = true;
    }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    await delay(300);
    NOTIFICATIONS.forEach(n => {
        if (n.userId === userId) {
            n.isRead = true;
        }
    });
};

// --- Settings ---
export const getSecuritySettings = async (): Promise<SecuritySettings> => {
    await delay(400);
    return SECURITY_SETTINGS;
};

export const updateSecuritySettings = async (settings: SecuritySettings): Promise<void> => {
    await delay(600);
    SECURITY_SETTINGS = settings;
};

export const getInstitutionSettings = async (): Promise<InstitutionSettings> => {
    await delay(300);
    return INSTITUTION_SETTINGS;
};

export const updateInstitutionSettings = async (settings: InstitutionSettings): Promise<void> => {
    await delay(500);
    INSTITUTION_SETTINGS = settings;
};


// --- Admin ---
export const getAdminStats = async (): Promise<StatCardData[]> => {
    await delay(500);
    return [
        { icon: 'Users', title: 'Total Users', value: USERS.length.toString(), color: 'primary' },
        { icon: 'Book', title: 'Total Courses', value: COURSES_DETAILED.length.toString(), color: 'secondary' },
        { icon: 'GraduationCap', title: 'Active Students', value: USERS.filter(u => u.role === UserRole.Student && u.status === UserStatus.Active).length.toString(), color: 'success' },
        { icon: 'Presentation', title: 'Instructors', value: USERS.filter(u => u.role === UserRole.Instructor).length.toString(), color: 'info' },
    ];
};

export const getLatestAnnouncement = async (): Promise<Announcement | null> => {
    await delay(300);
    return ANNOUNCEMENTS.length > 0 ? ANNOUNCEMENTS[0] : null;
};

// --- Academic Structure ---
export const getDepartments = async (): Promise<Department[]> => {
    await delay(300);
    // Recalculate program counts
    return DEPARTMENTS.map(d => ({
        ...d,
        programCount: PROGRAMS.filter(p => p.departmentId === d.id).length
    }));
};

export const createDepartment = async (deptData: Partial<Department>): Promise<Department> => {
    await delay(400);
    const newDept: Department = {
        id: `d-${Date.now()}`,
        name: deptData.name!,
        head: deptData.head!,
        programCount: 0,
    };
    DEPARTMENTS.push(newDept);
    return newDept;
};

export const updateDepartment = async (deptId: string, data: Partial<Department>): Promise<Department | null> => {
    await delay(400);
    const index = DEPARTMENTS.findIndex(d => d.id === deptId);
    if (index > -1) {
        DEPARTMENTS[index] = { ...DEPARTMENTS[index], ...data };
        return DEPARTMENTS[index];
    }
    return null;
};

export const deleteDepartment = async (deptId: string): Promise<{ success: boolean }> => {
    await delay(400);
    DEPARTMENTS = DEPARTMENTS.filter(d => d.id !== deptId);
    // also orphan programs
    PROGRAMS = PROGRAMS.map(p => p.departmentId === deptId ? { ...p, departmentId: '', departmentName: 'N/A' } : p);
    return { success: true };
};

export const getPrograms = async (): Promise<Program[]> => {
    await delay(300);
    return PROGRAMS.map(p => {
        const dept = DEPARTMENTS.find(d => d.id === p.departmentId);
        return {
            ...p,
            departmentName: dept?.name || 'N/A'
        };
    });
};

export const createProgram = async (progData: Partial<Program>): Promise<Program> => {
    await delay(400);
    const newProg: Program = {
        id: `p-${Date.now()}`,
        name: progData.name!,
        departmentId: progData.departmentId!,
        departmentName: DEPARTMENTS.find(d => d.id === progData.departmentId)?.name || 'N/A',
        duration: progData.duration!,
        courseCount: 0,
        courseIds: [],
    };
    PROGRAMS.push(newProg);
    return newProg;
};

export const updateProgram = async (progId: string, data: Partial<Program>): Promise<Program | null> => {
    await delay(400);
    const index = PROGRAMS.findIndex(p => p.id === progId);
    if (index > -1) {
        PROGRAMS[index] = { ...PROGRAMS[index], ...data };
        const dept = DEPARTMENTS.find(d => d.id === PROGRAMS[index].departmentId);
        PROGRAMS[index].departmentName = dept?.name || 'N/A';
        return PROGRAMS[index];
    }
    return null;
};

export const deleteProgram = async (progId: string): Promise<{ success: boolean }> => {
    await delay(400);
    PROGRAMS = PROGRAMS.filter(p => p.id !== progId);
    return { success: true };
};

export const getSemesters = async (): Promise<Semester[]> => {
    await delay(300);
    return [...SEMESTERS];
};

export const createSemester = async (data: Partial<Semester>): Promise<Semester> => {
    await delay(400);
    const newSemester: Semester = {
        id: `s-${Date.now()}`,
        name: data.name!,
        startDate: data.startDate!,
        endDate: data.endDate!,
        status: SemesterStatus.Upcoming, // Default
    };
    SEMESTERS.push(newSemester);
    return newSemester;
};

export const updateSemester = async (id: string, data: Partial<Semester>): Promise<Semester | null> => {
    await delay(400);
    const index = SEMESTERS.findIndex(s => s.id === id);
    if (index > -1) {
        SEMESTERS[index] = { ...SEMESTERS[index], ...data };
        return SEMESTERS[index];
    }
    return null;
};

export const deleteSemester = async (id: string): Promise<{ success: boolean }> => {
    await delay(400);
    SEMESTERS = SEMESTERS.filter(s => s.id !== id);
    return { success: true };
};

// --- Courses ---
export const getAllCourses = async (): Promise<Course[]> => {
    await delay(500);
    return [...COURSES_DETAILED];
};

export const getCourseDetails = async (courseId: string): Promise<Course | null> => {
    await delay(400);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    return course ? { ...course } : null;
};

export const getStudentCourses = async (studentId: string): Promise<CourseSummary[]> => {
    await delay(500);
    const studentEnrollments = ENROLLMENTS.filter(e => e.studentId === studentId).map(e => e.courseId);
    return COURSES_SUMMARY.filter(c => studentEnrollments.includes(c.id));
};

export const createCourse = async (courseData: Partial<Course>): Promise<Course> => {
    await delay(500);
    const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseData.title!,
        description: courseData.description || '',
        instructorId: courseData.instructorId!,
        instructorName: USERS.find(u => u.id === courseData.instructorId)?.name || 'N/A',
        departmentId: courseData.departmentId!,
        departmentName: DEPARTMENTS.find(d => d.id === courseData.departmentId)?.name || 'N/A',
        status: CourseStatus.Draft,
        modules: [],
    };
    COURSES_DETAILED.push(newCourse);
    return newCourse;
};

export const updateCourse = async (courseId: string, data: Partial<Course>): Promise<Course | null> => {
    await delay(500);
    const index = COURSES_DETAILED.findIndex(c => c.id === courseId);
    if (index > -1) {
        COURSES_DETAILED[index] = { ...COURSES_DETAILED[index], ...data };
        return COURSES_DETAILED[index];
    }
    return null;
};

export const deleteCourse = async (courseId: string): Promise<{ success: boolean }> => {
    await delay(500);
    COURSES_DETAILED = COURSES_DETAILED.filter(c => c.id !== courseId);
    return { success: true };
};

export const updateCourseModules = async (courseId: string, modules: Module[]): Promise<Course | null> => {
    await delay(600);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (course) {
        course.modules = modules;
        return { ...course };
    }
    return null;
};

export const getContentItemDetails = async (contentId: string): Promise<ContentItemDetails | null> => {
    await delay(300);
    const details = CONTENT_ITEM_DETAILS.find(d => d.id === contentId);
    return details || { id: contentId, content: "<p>Content not found.</p>" };
};

// --- Instructor ---
export const getInstructorStats = async (instructorId: string): Promise<StatCardData[]> => {
    await delay(500);
    const courses = COURSES_DETAILED.filter(c => c.instructorId === instructorId);
    const courseIds = courses.map(c => c.id);
    const studentCount = new Set(ENROLLMENTS.filter(e => courseIds.includes(e.courseId)).map(e => e.studentId)).size;
    const pendingCount = GRADES.filter(g => courseIds.includes(g.courseId) && g.status === 'pending review').length;

    return [
        { icon: 'BookOpen', title: 'My Courses', value: courses.length.toString(), color: 'primary' },
        { icon: 'Users', title: 'Total Students', value: studentCount.toString(), color: 'secondary' },
        { icon: 'PenSquare', title: 'Pending Submissions', value: pendingCount.toString(), color: 'warning' },
        { icon: 'ListChecks', title: 'Total Content Items', value: courses.reduce((acc, c) => acc + (c.modules?.reduce((iAcc, m) => iAcc + m.items.length, 0) || 0), 0).toString(), color: 'info' },
    ];
};

export const getInstructorCourses = async (instructorId: string): Promise<Course[]> => {
    await delay(400);
    return COURSES_DETAILED.filter(c => c.instructorId === instructorId);
};

// --- Questions ---
export const getQuestions = async (instructorId: string): Promise<Question[]> => {
    await delay(500);
    return QUESTIONS.filter(q => q.instructorId === instructorId);
};

export const getPublicQuestionsFromOthers = async (currentInstructorId: string): Promise<(Question & { instructorName: string })[]> => {
    await delay(500);
    const publicQuestions = QUESTIONS.filter(q => q.isPublic && q.instructorId !== currentInstructorId);
    return publicQuestions.map(q => ({
        ...q,
        instructorName: USERS.find(u => u.id === q.instructorId)?.name || 'Unknown Instructor'
    }));
};


export const getAllQuestionsForAdmin = async (): Promise<(Question & { instructorName: string })[]> => {
    await delay(700);
    return QUESTIONS.map(q => ({
        ...q,
        instructorName: USERS.find(u => u.id === q.instructorId)?.name || 'Unknown'
    }));
};

export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
    await delay(300);
    return QUESTIONS.filter(q => questionIds.includes(q.id));
};

// FIX: Refactored to address a complex type inference issue with discriminated unions.
// Using a type assertion is a pragmatic way to resolve the compiler errors while
// maintaining the intended structure of the function, which is guaranteed by the `data` parameter.
export const createQuestion = async (data: Omit<Question, 'id'>): Promise<Question> => {
    await delay(400);
    const newQuestion = { ...data, id: `q-${Date.now()}` } as Question;
    QUESTIONS.unshift(newQuestion);
    return newQuestion;
};

// FIX: Refactored to ensure type safety when updating questions.
// This version uses a type guard to ensure the original and new question types match,
// then uses a type assertion to resolve a complex type inference issue when spreading union types.
export const updateQuestion = async (id: string, data: Omit<Question, 'id' | 'instructorId'>): Promise<Question | null> => {
    await delay(400);
    const index = QUESTIONS.findIndex(q => q.id === id);
    if (index > -1) {
        const originalQuestion = QUESTIONS[index];

        // Type guard to ensure we don't mix question types
        if (originalQuestion.type !== data.type) {
            return null;
        }
        
        // TypeScript struggles with spreading discriminated unions after Omit, so we use an assertion.
        const updatedQuestion = { ...originalQuestion, ...data } as Question;
        
        QUESTIONS[index] = updatedQuestion;
        return QUESTIONS[index];
    }
    return null;
};

export const deleteQuestion = async (id: string): Promise<{ success: boolean }> => {
    await delay(400);
    QUESTIONS = QUESTIONS.filter(q => q.id !== id);
    return { success: true };
};

// --- Calendar ---
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    await delay(400);
    return [...CALENDAR_EVENTS];
};

// --- Announcements ---
export const getAnnouncements = async (): Promise<Announcement[]> => {
    await delay(300);
    return [...ANNOUNCEMENTS];
};

export const createAnnouncement = async (data: Omit<Announcement, 'id'|'createdAt'>): Promise<Announcement> => {
    await delay(400);
    const newAnn: Announcement = {
        ...data,
        id: `ann-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    ANNOUNCEMENTS.unshift(newAnn);
    return newAnn;
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>): Promise<Announcement | null> => {
    await delay(400);
    const index = ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (index > -1) {
        ANNOUNCEMENTS[index] = { ...ANNOUNCEMENTS[index], ...data };
        return ANNOUNCEMENTS[index];
    }
    return null;
};

export const deleteAnnouncement = async (id: string): Promise<{ success: boolean }> => {
    await delay(400);
    ANNOUNCEMENTS = ANNOUNCEMENTS.filter(a => a.id !== id);
    return { success: true };
};

// --- Communications ---
export const getCommunications = async (): Promise<Communication[]> => {
    await delay(400);
    return [...COMMUNICATIONS];
};

export const sendCommunication = async (data: Omit<Communication, 'id'|'sentAt'>): Promise<Communication> => {
    await delay(700);
    const newComm: Communication = {
        ...data,
        id: `comm-${Date.now()}`,
        sentAt: new Date().toISOString(),
    };
    COMMUNICATIONS.unshift(newComm);
    return newComm;
};

// --- Messages ---
export const getMessageThreads = async (userId: string): Promise<MessageThread[]> => {
    await delay(600);
    return MESSAGE_THREADS.sort((a,b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
};

export const getMessageThreadDetails = async (threadId: string): Promise<MessageThread | null> => {
    await delay(400);
    const thread = MESSAGE_THREADS.find(t => t.id === threadId);
    if (!thread) return null;
    return {
        ...thread,
        messages: MESSAGES.filter(m => m.threadId === threadId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    };
};

export const sendMessage = async (threadId: string, content: string, author: User): Promise<Message> => {
    await delay(300);
    const newMessage: Message = {
        id: `m-${Date.now()}`,
        threadId,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
    };
    MESSAGES.push(newMessage);
    // update thread last message
    const thread = MESSAGE_THREADS.find(t => t.id === threadId);
    if (thread) {
        thread.lastMessage = { content, createdAt: newMessage.createdAt };
    }
    return newMessage;
};

export const createNewThread = async (participants: Pick<User, 'id'|'name'|'avatarUrl'>[], subject: string, content: string, author: User): Promise<MessageThread> => {
    await delay(700);
    const threadId = `mt-${Date.now()}`;
    const firstMessage: Message = {
        id: `m-${Date.now()}`,
        threadId,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
    };
    MESSAGES.push(firstMessage);

    const newThread: MessageThread = {
        id: threadId,
        participants,
        subject,
        lastMessage: { content, createdAt: firstMessage.createdAt },
        isRead: true, // read for the sender
    };
    MESSAGE_THREADS.unshift(newThread);
    return newThread;
};

// --- Discussions ---
export const getPostsForDiscussion = async (discussionId: string): Promise<DiscussionPost[]> => {
    await delay(500);
    return DISCUSSION_POSTS.filter(p => p.discussionId === discussionId);
};

export const createDiscussionPost = async (discussionId: string, content: string, author: User, parentId?: string): Promise<DiscussionPost> => {
    await delay(500);
    const newPost: DiscussionPost = {
        id: `dp-${Date.now()}`,
        discussionId,
        parentId,
        authorId: author.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        authorRole: author.role,
        content,
        createdAt: new Date().toISOString(),
        isRead: true,
    };
    DISCUSSION_POSTS.push(newPost);
    return newPost;
};

export const markDiscussionPostAsRead = async (postId: string): Promise<void> => {
    await delay(100);
    const post = DISCUSSION_POSTS.find(p => p.id === postId);
    if (post) {
        post.isRead = true;
    }
};

// --- Student Data ---

export const getStudentProgramDetails = async (studentId: string): Promise<StudentProgramDetails | null> => {
    await delay(600);
    const student = USERS.find(u => u.id === studentId);
    if (!student || !student.programId) return null;

    const program = PROGRAMS.find(p => p.id === student.programId);
    if (!program) return null;
    
    const programCourses: ProgramCourse[] = COURSES_DETAILED.filter(c => program.courseIds.includes(c.id)).map(c => ({
        ...c,
        enrollmentStatus: 'in_progress', // Mock
        finalGrade: null, // Mock
    }));

    return {
        program,
        progress: 35, // Mock
        courses: programCourses,
    };
};

export const getStudentGradesForCourse = async (studentId: string, courseId: string): Promise<{ contentItemTitle: string, score: number | null }[]> => {
    await delay(400);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (!course) return [];

    const gradableItems = course.modules?.flatMap(m => m.items.filter(i => i.type === 'quiz' || i.type === 'assignment')) || [];
    const studentGrades = GRADES.filter(g => g.studentId === studentId && g.courseId === courseId);

    return gradableItems.map(item => {
        const grade = studentGrades.find(g => g.contentItemId === item.id);
        return {
            contentItemTitle: item.title,
            score: grade ? grade.score : null,
        };
    });
};

export const getStudentTranscript = async (studentId: string): Promise<StudentTranscript | null> => {
    await delay(700);
    const student = USERS.find(u => u.id === studentId);
    if (!student) return null;

    // This is heavily mocked
    return {
        studentName: student.name,
        studentId: student.id,
        programName: 'BSc. in Computer Science',
        semesters: [
            {
                semesterName: 'Spring 2024',
                courses: [
                    { courseCode: 'CS101', courseTitle: 'Introduction to Computer Science', credits: 3, grade: 'A', gradePoints: 4.0 },
                    { courseCode: 'MA105', courseTitle: 'Calculus I', credits: 4, grade: 'B+', gradePoints: 3.3 },
                ],
                semesterGpa: 3.6,
            }
        ],
        cumulativeGpa: 3.6,
    };
};

export const getOverdueItems = async (studentId: string): Promise<OverdueItem[]> => {
    await delay(300);
    return [
        { id: 'ov1', title: 'Assignment 1: Simple Calculator', courseName: 'Introduction to Computer Science', dueDate: '2 days ago', link: '/courses/cs101' }
    ];
};

export const getUpcomingDeadlines = async (studentId: string): Promise<UpcomingDeadline[]> => {
    await delay(300);
    return [
        { id: 'ud1', title: 'Quiz 1: Functions', courseName: 'Introduction to Computer Science', dueDate: 'in 2 days', type: 'quiz' },
        { id: 'ud2', title: 'Mid-Term Exam', courseName: 'Introduction to Computer Science', dueDate: 'in 6 days', type: 'exam' },
    ];
};

export const getRecentActivity = async (studentId: string): Promise<RecentActivity[]> => {
    await delay(300);
    return [
        { id: 'ra1', type: 'grade', title: 'New Grade Posted', summary: 'Your quiz "Fundamentals" has been graded.', timestamp: new Date().toISOString(), link: '/grades', icon: 'PenSquare'},
        { id: 'ra2', type: 'message', title: 'New Message', summary: 'From Instructor Sam: "Feedback on Assignment 1"', timestamp: new Date(Date.now() - 3600000).toISOString(), link: '/my-messages/mt1', icon: 'MessageSquare' },
        { id: 'ra3', type: 'announcement', title: 'New Announcement', summary: 'System Maintenance Scheduled', timestamp: new Date(Date.now() - 86400000).toISOString(), link: '/dashboard', icon: 'ScrollText' },
    ];
};

export const getStudentCertificates = async (studentId: string): Promise<Certificate[]> => {
    await delay(500);
    return CERTIFICATES.filter(c => c.studentName === USERS.find(u => u.id === studentId)?.name);
};

export const getStudentAchievements = async (studentId: string): Promise<Achievement[]> => {
    await delay(400);
    return [...ACHIEVEMENTS];
};

// ... more functions to be added
// fix all the errors
// This will be a huge file

// FIX: Add new functions for the Grading Hub.
// --- Grading Hub ---
export const getInstructorGradingSummary = async (instructorId: string): Promise<CourseGradingSummary[]> => {
    await delay(700);
    const instructorCourses = COURSES_DETAILED.filter(c => c.instructorId === instructorId);
    
    const summary: CourseGradingSummary[] = instructorCourses.map(course => {
        const enrolledStudentIds = new Set(ENROLLMENTS.filter(e => e.courseId === course.id).map(e => e.studentId));
        const totalEnrolled = enrolledStudentIds.size;

        const gradableItems = course.modules?.flatMap(m => m.items.filter(i => 
            i.type === ContentType.Assignment || 
            i.type === ContentType.Quiz || 
            i.type === ContentType.Examination
        )) || [];

        const itemsSummary: GradableItemSummary[] = gradableItems.map(item => {
            const allSubmissions: (QuizSubmission | AssignmentSubmission)[] = [...QUIZ_SUBMISSIONS, ...ASSIGNMENT_SUBMISSIONS];
            const submissionsForItem = allSubmissions.filter(s => s.contentItemId === item.id && enrolledStudentIds.has(s.studentId));
            const submittedCount = new Set(submissionsForItem.map(s => s.studentId)).size;
            const gradedCount = GRADES.filter(g => g.contentItemId === item.id && g.status === 'graded' && enrolledStudentIds.has(g.studentId)).length;
            
            // Find a due date from calendar events as a fallback
            const calendarEvent = CALENDAR_EVENTS.find(e => e.title === item.title && e.courseName === course.title);
            
            return {
                id: item.id,
                title: item.title,
                type: item.type,
                dueDate: item.dueDate || calendarEvent?.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mock due date if not present
                totalEnrolled,
                submittedCount,
                gradedCount
            };
        });

        return {
            courseId: course.id,
            courseTitle: course.title,
            items: itemsSummary
        };
    });

    return summary;
};

export const getSubmissionsForContentItem = async (contentItemId: string): Promise<StudentSubmissionDetails[]> => {
    await delay(600);
    
    // Find the course this content item belongs to
    const course = COURSES_DETAILED.find(c => c.modules?.some(m => m.items.some(i => i.id === contentItemId)));
    if (!course) return [];

    const enrolledStudentIds = ENROLLMENTS.filter(e => e.courseId === course.id).map(e => e.studentId);
    const allStudentsInCourse = USERS.filter(u => enrolledStudentIds.includes(u.id));

    const allSubmissions: Submission[] = [...QUIZ_SUBMISSIONS, ...ASSIGNMENT_SUBMISSIONS];

    const details: StudentSubmissionDetails[] = allStudentsInCourse.map(student => {
        // Find the latest submission for a student for this item, in case of multiple attempts.
        const studentSubmissions = allSubmissions
            .filter(s => s.studentId === student.id && s.contentItemId === contentItemId)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            
        const submission = studentSubmissions[0] || null;
        const grade = GRADES.find(g => g.studentId === student.id && g.contentItemId === contentItemId) || null;

        return {
            student: {
                id: student.id,
                name: student.name,
                avatarUrl: student.avatarUrl,
            },
            submission,
            grade
        };
    });

    return details;
};

// --- Gradebook and Submissions ---
export const getCourseGrades = async (courseId: string): Promise<{ gradableItems: ContentItem[], studentGrades: { studentId: string, studentName: string, grades: Record<string, Grade | null> }[] }> => {
    await delay(800);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (!course) return { gradableItems: [], studentGrades: [] };

    const gradableItems = course.modules?.flatMap(m => m.items.filter(i => i.type === 'quiz' || i.type === 'assignment')) || [];
    const enrolledStudentIds = ENROLLMENTS.filter(e => e.courseId === courseId).map(e => e.studentId);
    
    const studentGrades = enrolledStudentIds.map(studentId => {
        const student = USERS.find(u => u.id === studentId);
        const gradesForStudent = GRADES.filter(g => g.studentId === studentId && g.courseId === courseId);
        const gradesRecord: Record<string, Grade | null> = {};
        gradableItems.forEach(item => {
            gradesRecord[item.id] = gradesForStudent.find(g => g.contentItemId === item.id) || null;
        });
        return {
            studentId,
            studentName: student?.name || 'Unknown Student',
            grades: gradesRecord,
        };
    });

    return { gradableItems, studentGrades };
};

export const updateGrade = async (studentId: string, courseId: string, contentItemId: string, score: number | null): Promise<void> => {
    await delay(300);
    const gradeIndex = GRADES.findIndex(g => g.studentId === studentId && g.contentItemId === contentItemId);
    if (gradeIndex > -1) {
        GRADES[gradeIndex].score = score;
        GRADES[gradeIndex].status = 'graded';
    } else {
        GRADES.push({
            id: `g-${Date.now()}`,
            studentId,
            courseId,
            contentItemId,
            score,
            status: 'graded',
        });
    }
};

export const getStudentSubmissionsForContent = async (studentId: string, contentItemId: string): Promise<QuizSubmission[]> => {
    await delay(200);
    return QUIZ_SUBMISSIONS.filter(s => s.studentId === studentId && s.contentItemId === contentItemId);
};

export const getAssignmentSubmissionForStudent = async (studentId: string, assignmentId: string): Promise<AssignmentSubmission | null> => {
    await delay(300);
    return ASSIGNMENT_SUBMISSIONS.find(s => s.studentId === studentId && s.contentItemId === assignmentId) || null;
}

export const submitQuiz = async (studentId: string, courseId: string, contentItemId: string, answers: Record<string, any>): Promise<Grade> => {
    await delay(1000);
    // Mock grading logic
    const questions = QUESTIONS.filter(q => QUIZ_SUBMISSIONS.find(qs => qs.contentItemId === contentItemId));
    let score = 75; // Mock score

    const grade: Grade = {
        id: `g-${Date.now()}`,
        studentId,
        courseId,
        contentItemId,
        score,
        status: 'graded',
    };
    GRADES.push(grade);
    return grade;
};

export const submitAssignment = async (studentId: string, courseId: string, contentItemId: string, file: {name: string, size: number}): Promise<AssignmentSubmission> => {
    await delay(1200);
    const newSubmission: AssignmentSubmission = {
        id: `asub-${Date.now()}`,
        type: 'assignment',
        studentId,
        courseId,
        contentItemId,
        submittedAt: new Date().toISOString(),
        file: { ...file, url: '#' },
    };
    ASSIGNMENT_SUBMISSIONS.push(newSubmission);

    // Create a pending grade
    GRADES.push({
        id: `g-${Date.now()}`,
        studentId,
        courseId,
        contentItemId,
        score: null,
        status: 'pending review',
        submissionId: newSubmission.id
    });

    return newSubmission;
}

export const getSubmissionDetails = async (submissionId: string): Promise<{ submission: Submission, questions: Question[] | null, rubric: Rubric | null } | null> => {
    await delay(600);
    const submission = [...QUIZ_SUBMISSIONS, ...ASSIGNMENT_SUBMISSIONS].find(s => s.id === submissionId);
    if (!submission) return null;
    
    const contentItem = COURSES_DETAILED.flatMap(c => c.modules || []).flatMap(m => m.items).find(i => i.id === submission.contentItemId);
    if (!contentItem) return { submission, questions: null, rubric: null };

    const questions = contentItem.questionIds ? QUESTIONS.filter(q => contentItem.questionIds!.includes(q.id)) : null;
    const rubric = contentItem.rubricId ? RUBRICS.find(r => r.id === contentItem.rubricId) : null;

    return { submission, questions, rubric: rubric || null };
};

export const gradeManualSubmission = async (submissionId: string, payload: { score: number, rubricFeedback?: Grade['rubricFeedback'], feedback?: string }): Promise<void> => {
    await delay(700);
    const grade = GRADES.find(g => g.submissionId === submissionId);
    if (grade) {
        grade.score = payload.score;
        grade.rubricFeedback = payload.rubricFeedback;
        grade.feedback = payload.feedback;
        grade.status = 'graded';
    }
};

// --- Rubrics ---
export const getRubrics = async (instructorId: string): Promise<Rubric[]> => {
    await delay(400);
    return RUBRICS.filter(r => r.instructorId === instructorId);
};

export const createRubric = async (data: Omit<Rubric, 'id'>): Promise<Rubric> => {
    await delay(500);
    const newRubric: Rubric = { ...data, id: `r-${Date.now()}` };
    RUBRICS.push(newRubric);
    return newRubric;
};

export const updateRubric = async (id: string, data: Omit<Rubric, 'id' | 'instructorId'>): Promise<Rubric | null> => {
    await delay(500);
    const index = RUBRICS.findIndex(r => r.id === id);
    if (index > -1) {
        RUBRICS[index] = { ...RUBRICS[index], ...data };
        return RUBRICS[index];
    }
    return null;
};

export const deleteRubric = async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    RUBRICS = RUBRICS.filter(r => r.id !== id);
    return { success: true };
};

export const getRubricById = async (id: string): Promise<Rubric | null> => {
    await delay(200);
    return RUBRICS.find(r => r.id === id) || null;
};

// --- Examinations ---
export const getInstructorExaminations = async (instructorId: string): Promise<Examination[]> => {
    await delay(500);
    return EXAMINATIONS.filter(e => e.instructorId === instructorId).map(e => ({
        ...e,
        courseTitle: COURSES_DETAILED.find(c => c.id === e.courseId)?.title || 'N/A'
    }));
};

export const getAdminAllExaminations = async (): Promise<(Examination & { instructorName: string })[]> => {
    await delay(600);
    return EXAMINATIONS.map(e => ({
        ...e,
        courseTitle: COURSES_DETAILED.find(c => c.id === e.courseId)?.title || 'N/A',
        instructorName: USERS.find(u => u.id === e.instructorId)?.name || 'N/A',
    }));
};

export const getExaminationDetails = async (examId: string): Promise<Examination | null> => {
    await delay(400);
    return EXAMINATIONS.find(e => e.id === examId) || null;
}

export const createExamination = async (data: Omit<Examination, 'id' | 'status' | 'courseTitle'>): Promise<Examination> => {
    await delay(600);
    const newExam: Examination = {
        ...data,
        id: `exam-${Date.now()}`,
        status: ExaminationStatus.Draft,
        courseTitle: COURSES_DETAILED.find(c => c.id === data.courseId)?.title || 'N/A',
    };
    EXAMINATIONS.push(newExam);
    return newExam;
};

export const updateExamination = async (id: string, data: Omit<Examination, 'id' | 'status' | 'courseTitle'>): Promise<Examination | null> => {
    await delay(600);
    const index = EXAMINATIONS.findIndex(e => e.id === id);
    if (index > -1) {
        EXAMINATIONS[index] = { ...EXAMINATIONS[index], ...data };
        return EXAMINATIONS[index];
    }
    return null;
};

export const deleteExamination = async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    EXAMINATIONS = EXAMINATIONS.filter(e => e.id !== id);
    return { success: true };
};

export const submitExamination = async (studentId: string, examId: string, answers: Record<string, any>): Promise<Grade> => {
    await delay(1000);
    const exam = EXAMINATIONS.find(e => e.id === examId)!;
    const grade: Grade = { id: `g-exam-${Date.now()}`, studentId, courseId: exam.courseId, contentItemId: exam.id, score: 85, status: 'graded' };
    GRADES.push(grade);
    return grade;
}

// --- Certificates ---
export const getCertificateSettings = async (): Promise<CertificateSettings> => {
    await delay(300);
    return CERTIFICATE_SETTINGS;
};

export const updateCertificateSettings = async (settings: CertificateSettings): Promise<void> => {
    await delay(500);
    CERTIFICATE_SETTINGS = settings;
};

export const getCertificateRequests = async (): Promise<CertificateRequest[]> => {
    await delay(400);
    return CERTIFICATE_REQUESTS.filter(r => r.status === CertificateRequestStatus.Pending);
};

export const approveCertificateRequest = async (requestId: string): Promise<{ success: boolean }> => {
    await delay(500);
    const req = CERTIFICATE_REQUESTS.find(r => r.id === requestId);
    if (req) {
        req.status = CertificateRequestStatus.Approved;
        // In a real app, this would trigger certificate generation
        return { success: true };
    }
    return { success: false };
};

export const denyCertificateRequest = async (requestId: string): Promise<{ success: boolean }> => {
    await delay(500);
    const req = CERTIFICATE_REQUESTS.find(r => r.id === requestId);
    if (req) {
        req.status = CertificateRequestStatus.Denied;
        return { success: true };
    }
    return { success: false };
};

// --- System Admin ---
export const getActivityLogs = async (): Promise<ActivityLog[]> => {
    await delay(500);
    return [...ACTIVITY_LOGS];
};

export const getActiveSessions = async (): Promise<UserSession[]> => {
    await delay(400);
    return [...ACTIVE_SESSIONS];
};

export const terminateSession = async (sessionId: string): Promise<{ success: boolean }> => {
    await delay(300);
    ACTIVE_SESSIONS = ACTIVE_SESSIONS.filter(s => s.id !== sessionId);
    return { success: true };
};

// --- Reporting ---
export const getEnrollmentReport = async (): Promise<any[]> => {
    await delay(800);
    return ENROLLMENTS.map(e => {
        const student = USERS.find(u => u.id === e.studentId);
        const course = COURSES_DETAILED.find(c => c.id === e.courseId);
        const program = PROGRAMS.find(p => p.id === student?.programId);
        return {
            studentName: student?.name,
            courseTitle: course?.title,
            programName: program?.name,
            programId: program?.id,
            enrollmentDate: '2024-07-28', // Mock
        };
    });
};

export const getCourseCompletionReport = async (): Promise<any[]> => {
    await delay(700);
    return [
        { courseTitle: 'Introduction to Computer Science', completionRate: 78 },
        { courseTitle: 'Data Structures and Algorithms', completionRate: 62 },
        { courseTitle: 'Web Development Fundamentals', completionRate: 91 },
    ];
};

export const getInstructorActivityReport = async (): Promise<any[]> => {
    await delay(600);
    return USERS.filter(u => u.role === UserRole.Instructor).map(inst => {
        const courses = COURSES_DETAILED.filter(c => c.instructorId === inst.id);
        const courseIds = courses.map(c => c.id);
        const studentCount = new Set(ENROLLMENTS.filter(e => courseIds.includes(e.courseId)).map(e => e.studentId)).size;
        return {
            instructorId: inst.id,
            instructorName: inst.name,
            coursesTaught: courses.length,
            totalStudents: studentCount,
        };
    });
};

export const getGradeDistributionReport = async (): Promise<any[]> => {
    await delay(500);
    return [
        { range: '90-100%', count: 120 },
        { range: '80-89%', count: 250 },
        { range: '70-79%', count: 180 },
        { range: '60-69%', count: 90 },
        { range: '<60%', count: 45 },
    ];
};

// --- Media Library ---
export const getMediaItems = async (instructorId: string): Promise<MediaItem[]> => {
    await delay(500);
    return MEDIA_ITEMS.filter(item => item.instructorId === instructorId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

export const uploadMediaItem = async (instructorId: string, file: File): Promise<MediaItem> => {
    await delay(1000); // Simulate upload time
    let type: MediaType;
    if (file.type.startsWith('image/')) type = MediaType.Image;
    else if (file.type.startsWith('video/')) type = MediaType.Video;
    else if (file.type.startsWith('audio/')) type = MediaType.Audio;
    else type = MediaType.Document;

    const newItem: MediaItem = {
        id: `media-${Date.now()}`,
        instructorId,
        name: file.name,
        type,
        url: URL.createObjectURL(file), // Use a temporary local URL for the mock
        size: file.size,
        uploadedAt: new Date().toISOString(),
    };
    MEDIA_ITEMS.unshift(newItem);
    return newItem;
};