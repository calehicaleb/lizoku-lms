import { User, UserRole, UserStatus, StatCardData, CourseSummary, Department, Program, Semester, SemesterStatus, Course, CourseStatus, Module, ContentType, Announcement, Enrollment, Grade, CalendarEvent, CalendarEventType, DiscussionThread, DiscussionPost, Question, QuestionType, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion, QuizSubmission, MultipleSelectQuestion, FillBlankQuestion, Rubric, StudentProgramDetails, ProgramCourse } from '../types';

// --- MOCK DATABASE ---

const USERS: User[] = [
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
    { id: 'cs101', title: 'Introduction to Computer Science', progress: 75, imageUrl: '', students: 45, instructor: 'Instructor Sam', rating: 4.5 },
    { id: 'ds202', title: 'Data Structures and Algorithms', progress: 60, imageUrl: '', students: 32, instructor: 'Instructor Sam', rating: 4.7 },
    { id: 'wd101', title: 'Web Development Fundamentals', progress: 90, imageUrl: '', students: 58, instructor: 'Inactive Bob', rating: 4.8 },
    { id: 'db301', title: 'Database Management', progress: 45, imageUrl: '', students: 25, instructor: 'Inactive Bob', rating: 4.2 },
];

const DEPARTMENTS: Department[] = [
    { id: 'd1', name: 'School of Computing', head: 'Instructor Sam', programCount: 2 },
    { id: 'd2', name: 'Business School', head: 'Inactive Bob', programCount: 1 },
    { id: 'd3', name: 'School of Design', head: 'Admin User', programCount: 1 },
];

const PROGRAMS: Program[] = [
    { id: 'p1', name: 'BSc. in Computer Science', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 4, duration: '4 Years', courseIds: ['cs101', 'ds202', 'wd101', 'db301'] },
    { id: 'p2', name: 'BSc. in Information Technology', departmentId: 'd1', departmentName: 'School of Computing', courseCount: 22, duration: '4 Years', courseIds: [] },
    { id: 'p3', name: 'Bachelor of Business Administration', departmentId: 'd2', departmentName: 'Business School', courseCount: 18, duration: '3 Years', courseIds: [] },
    { id: 'p4', name: 'Diploma in Graphic Design', departmentId: 'd3', departmentName: 'School of Design', courseCount: 12, duration: '2 Years', courseIds: [] },
];

const SEMESTERS: Semester[] = [
    { id: 's1', name: 'Fall 2024', startDate: '2024-09-01', endDate: '2024-12-20', status: SemesterStatus.Upcoming },
    { id: 's2', name: 'Summer 2024', startDate: '2024-05-15', endDate: '2024-08-15', status: SemesterStatus.Active },
    { id: 's3', name: 'Spring 2024', startDate: '2024-01-10', endDate: '2024-05-05', status: SemesterStatus.Past },
];

const COURSES_DETAILED: Course[] = [
    { 
        id: 'cs101', 
        title: 'Introduction to Computer Science', 
        description: 'Fundamentals of programming and computer science.', 
        instructorId: '2', 
        instructorName: 'Instructor Sam', 
        departmentId: 'd1', 
        departmentName: 'School of Computing', 
        status: CourseStatus.Published,
        modules: [
            { id: 'm1', title: 'Module 1: Welcome to the Course', items: [
                { id: 'c1', title: 'Course Overview', type: ContentType.Lesson },
                { id: 'c2', title: 'Introduction Forum', type: ContentType.Discussion },
            ]},
            { id: 'm2', title: 'Module 2: Core Concepts', items: [
                { id: 'c3', title: 'Variables and Data Types', type: ContentType.Lesson },
                { id: 'c4', title: 'Control Flow', type: ContentType.Lesson },
                { id: 'c5', title: 'Quiz 1: Core Concepts', type: ContentType.Quiz, questionIds: ['q1', 'q2', 'q4', 'q5', 'q6', 'q7'], timeLimit: 15, attemptsLimit: 2, randomizeQuestions: true },
                { id: 'c6', title: 'Assignment 1: First Program', type: ContentType.Assignment, rubricId: 'r1' },
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

const ANNOUNCEMENTS: Announcement[] = [
    { id: 'a1', title: 'System Maintenance Scheduled', content: 'Please be advised that we will be performing scheduled maintenance this Friday at 10 PM. The platform may be unavailable for up to 1 hour.', author: 'Admin User', createdAt: '2024-08-01' },
    { id: 'a2', title: 'Welcome to the New Semester!', content: 'We are excited to kick off the Fall 2024 semester. Please check your course dashboards for updates from your instructors.', author: 'Admin User', createdAt: '2024-07-28' },
];

const ENROLLMENTS: Enrollment[] = [
    { id: 'e1', studentId: '3', courseId: 'cs101' },
    { id: 'e2', studentId: '7', courseId: 'cs101' },
    { id: 'e3', studentId: '8', courseId: 'cs101' },
    { id: 'e4', studentId: '3', courseId: 'ds202' },
];

const GRADES: Grade[] = [
    { id: 'g1', studentId: '3', courseId: 'cs101', contentItemId: 'c5', score: 88, status: 'graded', submissionId: 'sub1' },
    { id: 'g2', studentId: '7', courseId: 'cs101', contentItemId: 'c5', score: 92, status: 'graded', submissionId: 'sub2' },
    { id: 'g3', studentId: '3', courseId: 'cs101', contentItemId: 'c6', score: 95, status: 'graded' },
    { id: 'g4', studentId: '8', courseId: 'cs101', contentItemId: 'c5', score: null, status: 'pending review', submissionId: 'sub3' },
];

const SUBMISSIONS: QuizSubmission[] = [
    { id: 'sub1', studentId: '3', courseId: 'cs101', contentItemId: 'c5', submittedAt: '2024-08-03T10:00:00Z', answers: { q1: 2, q2: 2, q4: true, q5: 'const', q6: [0, 2], q7: 'array' }, attemptNumber: 1 },
    { id: 'sub2', studentId: '7', courseId: 'cs101', contentItemId: 'c5', submittedAt: '2024-08-03T11:00:00Z', answers: { q1: 2, q2: 2, q4: true, q5: 'const', q6: [0, 2], q7: 'array' }, attemptNumber: 1 },
    { id: 'sub3', studentId: '8', courseId: 'cs101', contentItemId: 'c5', submittedAt: '2024-08-03T12:00:00Z', answers: { q1: 2, q2: 2, q4: true, q5: 'a variable', q6: [0, 1, 2], q7: 'string' }, attemptNumber: 1 },
];

const CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'ce1', title: 'Quiz 1 Due', date: '2024-08-10', type: CalendarEventType.Quiz, courseName: 'Intro to CS' },
    { id: 'ce2', title: 'Assignment 1 Due', date: '2024-08-15', type: CalendarEventType.Assignment, courseName: 'Intro to CS' },
    { id: 'ce3', title: 'Public Holiday', date: '2024-08-20', type: CalendarEventType.Holiday },
    { id: 'ce4', title: 'System Maintenance', date: '2024-08-25', type: CalendarEventType.Maintenance },
    { id: 'ce5', title: 'Quiz: Big O Notation Due', date: '2024-09-02', type: CalendarEventType.Quiz, courseName: 'Data Structures' },
    { id: 'ce6', title: 'Final Project Due', date: '2024-08-30', type: CalendarEventType.Assignment, courseName: 'Web Dev' },
];

const DISCUSSION_POSTS: DiscussionPost[] = [
    { id: 'dp1', threadId: 'dt1', authorName: 'Student Anna', authorAvatarUrl: USERS[2].avatarUrl, content: "Hi everyone! I'm Anna, excited to learn with you all.", createdAt: new Date('2024-08-01T10:00:00Z').toISOString() },
    { id: 'dp2', threadId: 'dt1', authorName: 'Alice Johnson', authorAvatarUrl: USERS[6].avatarUrl, content: "Hey Anna! Welcome to the course.", createdAt: new Date('2024-08-01T11:30:00Z').toISOString() },
    { id: 'dp3', threadId: 'dt1', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, content: "Welcome aboard, everyone. Feel free to ask any questions here.", createdAt: new Date('2024-08-01T12:00:00Z').toISOString() },
    { id: 'dp4', threadId: 'dt2', authorName: 'Charlie Brown', authorAvatarUrl: USERS[7].avatarUrl, content: "I'm a bit confused about the difference between a variable and a constant. Can anyone explain?", createdAt: new Date('2024-08-02T14:00:00Z').toISOString() },
    { id: 'dp5', threadId: 'dt2', authorName: 'Instructor Sam', authorAvatarUrl: USERS[1].avatarUrl, content: "Great question, Charlie! A variable's value can be changed after it's declared, while a constant's value cannot. Think of a variable like a whiteboard where you can erase and rewrite, and a constant like a carved stone tablet.", createdAt: new Date('2024-08-02T15:15:00Z').toISOString() },
];

const DISCUSSION_THREADS: DiscussionThread[] = [
    { id: 'dt1', discussionId: 'c2', title: "Introduce Yourself!", authorName: 'Instructor Sam', createdAt: new Date('2024-08-01T09:00:00Z').toISOString(), postCount: 3 },
    { id: 'dt2', discussionId: 'c2', title: "Question about Variables", authorName: 'Charlie Brown', createdAt: new Date('2024-08-02T14:00:00Z').toISOString(), postCount: 2 },
];

const QUESTIONS: Question[] = [
    { id: 'q1', type: QuestionType.MultipleChoice, stem: 'What is the correct syntax to output "Hello World" in Python?', options: ['echo "Hello World"', 'printf("Hello World")', 'print("Hello World")', 'cout << "Hello World"'], correctAnswerIndex: 2, instructorId: '2' },
    { id: 'q2', type: QuestionType.MultipleChoice, stem: 'Which of the following data types is mutable in Python?', options: ['Tuple', 'String', 'List', 'Integer'], correctAnswerIndex: 2, instructorId: '2' },
    { id: 'q3', type: QuestionType.MultipleChoice, stem: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup Language', 'Home Tool Markup Language'], correctAnswerIndex: 0, instructorId: '6' },
    { id: 'q4', type: QuestionType.TrueFalse, stem: 'The `main` function is the entry point for every C++ program.', correctAnswer: true, instructorId: '2' },
    { id: 'q5', type: QuestionType.ShortAnswer, stem: 'What keyword is used to declare a variable that cannot be reassigned in JavaScript?', acceptableAnswers: ['const'], instructorId: '2' },
    { id: 'q6', type: QuestionType.MultipleSelect, stem: 'Which of the following are primitive data types in JavaScript?', options: ['String', 'Object', 'Boolean', 'Array'], correctAnswerIndices: [0, 2], instructorId: '2' },
    { id: 'q7', type: QuestionType.FillBlank, stem: 'The method to add an element to the end of an ____ is `.push()`.', acceptableAnswers: ['array'], instructorId: '2' },
];

const RUBRICS: Rubric[] = [
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
];

// --- UTILS ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- API FUNCTIONS ---

export const login = async (email: string, password: string): Promise<User | null> => {
    await delay(500);
    // Check against mock DB for specific users
    const userByEmail = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (userByEmail) return userByEmail; // For demo, ignore password

    // Fallback for generic role-based login during demo (e.g., admin@test.com)
    if (email.toLowerCase().includes('admin')) return USERS.find(u => u.role === UserRole.Admin)!;
    if (email.toLowerCase().includes('instructor')) return USERS.find(u => u.role === UserRole.Instructor)!;
    
    // If it's a new student email, log them in as the default student for the demo
    if (email.toLowerCase().includes('@')) return USERS.find(u => u.role === UserRole.Student)!;

    return null;
};

export const getAdminStats = async (): Promise<StatCardData[]> => {
    await delay(300);
    return [
        { icon: 'Users', title: 'Total Users', value: USERS.length.toString(), color: 'primary' },
        { icon: 'Clock', title: 'Pending Approvals', value: USERS.filter(u => u.status === UserStatus.Pending).length.toString(), color: 'warning' },
        { icon: 'Book', title: 'Total Courses', value: COURSES_DETAILED.length.toString(), color: 'secondary' },
        { icon: 'FileText', title: 'Content Items', value: '342', color: 'info' }
    ];
};

export const getRecentUsers = async (limit: number = 5): Promise<User[]> => {
    await delay(300);
    return [...USERS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
};

export const getAllUsers = async (): Promise<User[]> => {
    await delay(300);
    return USERS;
};

export const createUser = async (userData: Pick<User, 'name' | 'email' | 'role' | 'status'>): Promise<User> => {
    await delay(300);
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    USERS.unshift(newUser); // Add to the beginning of the list
    return newUser;
};

export const updateUser = async (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'role' | 'status'>>): Promise<User | null> => {
    await delay(300);
    const userIndex = USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;
    USERS[userIndex] = { ...USERS[userIndex], ...updates };
    return USERS[userIndex];
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = USERS.findIndex(u => u.id === userId);
    if (index === -1) return { success: false };
    USERS.splice(index, 1);
    return { success: true };
};

export const getInstructorStats = async (): Promise<StatCardData[]> => {
    await delay(300);
    return [
        { icon: 'Presentation', title: 'Courses Taught', value: '3', color: 'primary' },
        { icon: 'Users', title: 'Total Students', value: '135', color: 'secondary' },
        { icon: 'BadgeCheck', title: 'Certificates Issued', value: '45', color: 'success' },
        { icon: 'ListChecks', title: 'Pending Grading', value: '12', color: 'warning' }
    ];
};

export const getInstructorCourses = async (): Promise<Course[]> => {
    await delay(300);
    // Assuming instructor '2' is logged in for this mock
    // Fix: Merge detailed course data with summary data to provide a complete object for all views.
    const detailedCourses = COURSES_DETAILED.filter(c => c.instructorId === '2');
    return detailedCourses.map(course => {
        const summary = COURSES_SUMMARY.find(s => s.id === course.id);
        return {
            ...course,
            progress: summary?.progress,
            students: summary?.students,
        };
    });
};

export const getCourseDetails = async (courseId: string): Promise<Course | null> => {
    await delay(300);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    return course || null;
}

export const getStudentCourses = async (): Promise<CourseSummary[]> => {
    await delay(300);
    // Assuming student '3' is logged in
    const studentEnrollments = ENROLLMENTS.filter(e => e.studentId === '3');
    return COURSES_SUMMARY.filter(cs => studentEnrollments.some(e => e.courseId === cs.id));
};

// --- Departments API ---
export const getDepartments = async (): Promise<Department[]> => {
    await delay(300);
    return DEPARTMENTS;
};

export const createDepartment = async (deptData: Pick<Department, 'name' | 'head'>): Promise<Department> => {
    await delay(300);
    const newDept: Department = {
        ...deptData,
        id: `dept-${Date.now()}`,
        programCount: 0,
    };
    DEPARTMENTS.push(newDept);
    return newDept;
};

export const updateDepartment = async (deptId: string, updates: Pick<Department, 'name' | 'head'>): Promise<Department | null> => {
    await delay(300);
    const deptIndex = DEPARTMENTS.findIndex(d => d.id === deptId);
    if (deptIndex === -1) return null;
    DEPARTMENTS[deptIndex] = { ...DEPARTMENTS[deptIndex], ...updates };
    return DEPARTMENTS[deptIndex];
};

export const deleteDepartment = async (deptId: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = DEPARTMENTS.findIndex(d => d.id === deptId);
    if (index === -1) return { success: false };
    DEPARTMENTS.splice(index, 1);
    return { success: true };
};

// --- Programs API ---
export const getPrograms = async (): Promise<Program[]> => {
    await delay(300);
    return PROGRAMS;
};

export const createProgram = async (programData: Pick<Program, 'name' | 'departmentId' | 'duration'>): Promise<Program> => {
    await delay(300);
    const department = DEPARTMENTS.find(d => d.id === programData.departmentId);
    const newProgram: Program = {
        ...programData,
        id: `prog-${Date.now()}`,
        departmentName: department?.name || 'N/A',
        courseCount: 0,
        courseIds: [],
    };
    PROGRAMS.push(newProgram);
    // Update department program count
    if (department) department.programCount++;
    return newProgram;
};

export const updateProgram = async (programId: string, updates: Pick<Program, 'name' | 'departmentId' | 'duration'>): Promise<Program | null> => {
    await delay(300);
    const progIndex = PROGRAMS.findIndex(p => p.id === programId);
    if (progIndex === -1) return null;
    const department = DEPARTMENTS.find(d => d.id === updates.departmentId);
    PROGRAMS[progIndex] = { ...PROGRAMS[progIndex], ...updates, departmentName: department?.name || 'N/A' };
    return PROGRAMS[progIndex];
};

export const deleteProgram = async (programId: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = PROGRAMS.findIndex(p => p.id === programId);
    if (index === -1) return { success: false };
    const department = DEPARTMENTS.find(d => d.id === PROGRAMS[index].departmentId);
    if (department) department.programCount--;
    PROGRAMS.splice(index, 1);
    return { success: true };
};

// --- Semesters API ---
export const getSemesters = async (): Promise<Semester[]> => {
    await delay(300);
    return SEMESTERS;
};

export const createSemester = async (semesterData: Pick<Semester, 'name' | 'startDate' | 'endDate'>): Promise<Semester> => {
    await delay(300);
    const newSemester: Semester = {
        ...semesterData,
        id: `sem-${Date.now()}`,
        status: new Date(semesterData.startDate) > new Date() ? SemesterStatus.Upcoming : SemesterStatus.Active, // Simple status logic
    };
    SEMESTERS.push(newSemester);
    return newSemester;
};

export const updateSemester = async (semesterId: string, updates: Pick<Semester, 'name' | 'startDate' | 'endDate'>): Promise<Semester | null> => {
    await delay(300);
    const semIndex = SEMESTERS.findIndex(s => s.id === semesterId);
    if (semIndex === -1) return null;
    SEMESTERS[semIndex] = { ...SEMESTERS[semIndex], ...updates };
    return SEMESTERS[semIndex];
};

export const deleteSemester = async (semesterId: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = SEMESTERS.findIndex(s => s.id === semesterId);
    if (index === -1) return { success: false };
    SEMESTERS.splice(index, 1);
    return { success: true };
};

// --- Courses API ---
export const getAllCourses = async (): Promise<Course[]> => {
    await delay(300);
    return COURSES_DETAILED;
};

export const createCourse = async (courseData: Pick<Course, 'title' | 'description' | 'departmentId' | 'instructorId'>): Promise<Course> => {
    await delay(300);
    const department = DEPARTMENTS.find(d => d.id === courseData.departmentId);
    const instructor = USERS.find(u => u.id === courseData.instructorId);

    const newCourse: Course = {
        ...courseData,
        id: `course-${Date.now()}`,
        departmentName: department?.name || 'N/A',
        instructorName: instructor?.name || 'N/A',
        status: CourseStatus.Draft, // Default status
        modules: [], // Default empty modules
    };
    COURSES_DETAILED.push(newCourse);
    return newCourse;
};

export const updateCourse = async (courseId: string, updates: Pick<Course, 'title' | 'description' | 'departmentId' | 'instructorId'>): Promise<Course | null> => {
    await delay(300);
    const courseIndex = COURSES_DETAILED.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
        return null;
    }

    const department = DEPARTMENTS.find(d => d.id === updates.departmentId);
    const instructor = USERS.find(u => u.id === updates.instructorId);

    const updatedCourse = {
        ...COURSES_DETAILED[courseIndex],
        ...updates,
        departmentName: department?.name || COURSES_DETAILED[courseIndex].departmentName,
        instructorName: instructor?.name || COURSES_DETAILED[courseIndex].instructorName,
    };
    COURSES_DETAILED[courseIndex] = updatedCourse;
    return updatedCourse;
};

export const deleteCourse = async (courseId: string): Promise<{ success: boolean }> => {
    await delay(300);
    const courseIndex = COURSES_DETAILED.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
        return { success: false };
    }
    COURSES_DETAILED.splice(courseIndex, 1);
    return { success: true };
};

export const updateCourseModules = async (courseId: string, modules: Module[]): Promise<Course> => {
    await delay(400);
    const courseIndex = COURSES_DETAILED.findIndex(c => c.id === courseId);
    if (courseIndex === -1) throw new Error("Course not found");
    COURSES_DETAILED[courseIndex].modules = modules;
    return COURSES_DETAILED[courseIndex];
};

// --- Announcements API ---
export const getAnnouncements = async (): Promise<Announcement[]> => {
    await delay(300);
    return ANNOUNCEMENTS;
};

export const getLatestAnnouncement = async (): Promise<Announcement | null> => {
    await delay(300);
    if (ANNOUNCEMENTS.length === 0) return null;
    return [...ANNOUNCEMENTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
};

export const createAnnouncement = async (data: Pick<Announcement, 'title' | 'content' | 'author'>): Promise<Announcement> => {
    await delay(300);
    const newAnnouncement: Announcement = {
        ...data,
        id: `a-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
    };
    ANNOUNCEMENTS.unshift(newAnnouncement);
    return newAnnouncement;
};

export const updateAnnouncement = async (id: string, updates: Pick<Announcement, 'title' | 'content'>): Promise<Announcement | null> => {
    await delay(300);
    const index = ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (index === -1) return null;
    ANNOUNCEMENTS[index] = { ...ANNOUNCEMENTS[index], ...updates };
    return ANNOUNCEMENTS[index];
};

export const deleteAnnouncement = async (id: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (index === -1) return { success: false };
    ANNOUNCEMENTS.splice(index, 1);
    return { success: true };
};

// --- Grading API ---
export const getCourseGrades = async (courseId: string) => {
    await delay(500);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");

    const gradableItems = course.modules?.flatMap(m => m.items)
        .filter(i => i.type === ContentType.Quiz || i.type === ContentType.Assignment) || [];

    const courseEnrollments = ENROLLMENTS.filter(e => e.courseId === courseId);
    const studentIds = courseEnrollments.map(e => e.studentId);
    
    const studentGrades = studentIds.map(studentId => {
        const student = USERS.find(u => u.id === studentId);
        const gradesForStudent = GRADES.filter(g => g.studentId === studentId && g.courseId === courseId);
        
        const gradesMap = gradableItems.reduce((acc, item) => {
            const grade = gradesForStudent.find(g => g.contentItemId === item.id);
            acc[item.id] = grade || null;
            return acc;
        }, {} as Record<string, Grade | null>);

        return {
            studentId: studentId,
            studentName: student?.name || 'Unknown Student',
            grades: gradesMap,
        };
    });

    return {
        gradableItems,
        studentGrades,
    };
};

export const getStudentGradesForCourse = async (studentId: string, courseId: string) => {
    await delay(400);
    const course = COURSES_DETAILED.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");
    
    const gradableItems = course.modules?.flatMap(m => m.items)
        .filter(i => i.type === ContentType.Quiz || i.type === ContentType.Assignment) || [];

    const grades = GRADES.filter(g => g.studentId === studentId && g.courseId === courseId);

    return gradableItems.map(item => {
        const grade = grades.find(g => g.contentItemId === item.id);
        return {
            contentItemTitle: item.title,
            score: grade ? grade.score : null
        };
    });
};

export const updateGrade = async (studentId: string, courseId: string, contentItemId: string, score: number | null): Promise<Grade> => {
    await delay(200);
    let grade = GRADES.find(g => g.studentId === studentId && g.contentItemId === contentItemId);
    
    if (grade) {
        grade.score = score;
        grade.status = 'graded';
    } else {
        grade = { id: `g-${Date.now()}`, studentId, courseId, contentItemId, score, status: 'graded' };
        GRADES.push(grade);
    }
    return grade;
};

// --- Calendar API ---
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    await delay(400);
    // In a real app, this would filter events based on the logged-in user's role and enrollments.
    // For the mock, we'll return all events for simplicity.
    return CALENDAR_EVENTS;
};

// --- Discussion API ---
export const getThreadsForDiscussion = async (discussionId: string): Promise<DiscussionThread[]> => {
    await delay(400);
    const threads = DISCUSSION_THREADS.filter(t => t.discussionId === discussionId);
    // Attach posts to each thread for this mock API call
    return threads.map(thread => ({
        ...thread,
        posts: DISCUSSION_POSTS.filter(p => p.threadId === thread.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));
};

export const createThread = async (discussionId: string, title: string, content: string, author: User): Promise<DiscussionThread> => {
    await delay(300);
    const newThread: DiscussionThread = {
        id: `dt-${Date.now()}`,
        discussionId,
        title,
        authorName: author.name,
        createdAt: new Date().toISOString(),
        postCount: 1,
        posts: []
    };
    DISCUSSION_THREADS.push(newThread);

    const firstPost: DiscussionPost = {
        id: `dp-${Date.now()}`,
        threadId: newThread.id,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
    };
    DISCUSSION_POSTS.push(firstPost);
    newThread.posts = [firstPost];
    return newThread;
};

export const createPost = async (threadId: string, content: string, author: User): Promise<DiscussionPost> => {
    await delay(200);
    const newPost: DiscussionPost = {
        id: `dp-${Date.now()}`,
        threadId,
        authorName: author.name,
        authorAvatarUrl: author.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
    };
    DISCUSSION_POSTS.push(newPost);
    
    // Update post count on thread
    const thread = DISCUSSION_THREADS.find(t => t.id === threadId);
    if (thread) {
        thread.postCount++;
    }

    return newPost;
};

// --- Question Bank & Quiz API ---
export const getQuestions = async (instructorId: string): Promise<Question[]> => {
    await delay(400);
    return QUESTIONS.filter(q => q.instructorId === instructorId);
};

export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
    await delay(400);
    return QUESTIONS.filter(q => questionIds.includes(q.id));
};

export const createQuestion = async (data: Omit<Question, 'id'>): Promise<Question> => {
    await delay(300);
    // Fix: Add a type assertion to the newQuestion object to ensure it conforms to the Question union type.
    // This resolves a complex type inference issue with discriminated unions.
    const newQuestion: Question = {
        ...data,
        id: `q-${Date.now()}`,
    } as Question;
    QUESTIONS.push(newQuestion);
    return newQuestion;
};

export const updateQuestion = async (id: string, updates: Partial<Omit<Question, 'id' | 'instructorId'>>): Promise<Question | null> => {
    await delay(300);
    const index = QUESTIONS.findIndex(q => q.id === id);
    if (index === -1) return null;
    // Fix: Using Object.assign with a type assertion to any. This is required because TypeScript's discriminated
    // union analysis cannot guarantee type safety with partial objects from Object.assign. The application
    // logic (which does not change question type on update) makes this a safe operation.
    QUESTIONS[index] = Object.assign(QUESTIONS[index], updates as any);
    return QUESTIONS[index];
};

export const deleteQuestion = async (id: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = QUESTIONS.findIndex(q => q.id === id);
    if (index === -1) return { success: false };
    QUESTIONS.splice(index, 1);
    return { success: true };
};

export const submitQuiz = async (studentId: string, courseId: string, contentItemId: string, answers: Record<string, string | number | boolean | number[]>): Promise<Grade> => {
    await delay(500);

    const previousSubmissions = SUBMISSIONS.filter(s => s.studentId === studentId && s.contentItemId === contentItemId);

    const submission: QuizSubmission = {
        id: `sub-${Date.now()}`,
        studentId,
        courseId,
        contentItemId,
        submittedAt: new Date().toISOString(),
        answers,
        attemptNumber: previousSubmissions.length + 1,
    };
    SUBMISSIONS.push(submission);

    const questionIds = Object.keys(answers);
    const relevantQuestions = QUESTIONS.filter(q => questionIds.includes(q.id));

    let hasManualGrade = false;
    let correctAutoAnswers = 0;
    let totalAutoQuestions = 0;

    relevantQuestions.forEach(q => {
        const answer = answers[q.id];
        if (q.type === QuestionType.MultipleChoice) {
            totalAutoQuestions++;
            if (answer === q.correctAnswerIndex) correctAutoAnswers++;
        } else if (q.type === QuestionType.TrueFalse) {
            totalAutoQuestions++;
            if (answer === q.correctAnswer) correctAutoAnswers++;
        } else if (q.type === QuestionType.ShortAnswer) {
            hasManualGrade = true;
        } else if (q.type === QuestionType.FillBlank) {
            totalAutoQuestions++;
            const studentAnswer = String(answer).trim().toLowerCase();
            const correctAnswers = q.acceptableAnswers.map(a => a.toLowerCase());
            if (correctAnswers.includes(studentAnswer)) {
                correctAutoAnswers++;
            }
        } else if (q.type === QuestionType.MultipleSelect) {
            totalAutoQuestions++;
            const studentAnswers = new Set(answer as number[]);
            const correctAnswers = new Set(q.correctAnswerIndices);
            if (studentAnswers.size === correctAnswers.size && [...studentAnswers].every(i => correctAnswers.has(i))) {
                correctAutoAnswers++;
            }
        }
    });

    const finalStatus = hasManualGrade ? 'pending review' : 'graded';
    const finalScore = totalAutoQuestions > 0 ? Math.round((correctAutoAnswers / totalAutoQuestions) * 100) : (hasManualGrade ? null : 100);

    let grade = GRADES.find(g => g.studentId === studentId && g.contentItemId === contentItemId);
    if (grade) {
        grade.score = finalScore;
        grade.status = finalStatus;
        grade.submissionId = submission.id;
    } else {
        grade = {
            id: `g-${Date.now()}`,
            studentId,
            courseId,
            contentItemId,
            score: finalScore,
            status: finalStatus,
            submissionId: submission.id,
        };
        GRADES.push(grade);
    }

    return grade;
};

export const getSubmissionDetails = async (submissionId: string) => {
    await delay(400);
    const submission = SUBMISSIONS.find(s => s.id === submissionId);
    if (!submission) return null;

    // Find the content item to get the rubricId
    let rubric: Rubric | null = null;
    const course = COURSES_DETAILED.find(c => c.id === submission.courseId);
    const contentItem = course?.modules?.flatMap(m => m.items).find(i => i.id === submission.contentItemId);
    if (contentItem?.rubricId) {
        rubric = RUBRICS.find(r => r.id === contentItem.rubricId) || null;
    }

    const questions = await getQuestionsByIds(Object.keys(submission.answers));
    return { submission, questions, rubric };
};

export const gradeManualSubmission = async (submissionId: string, manualScores: Record<string, number>) => {
    await delay(300);
    const submission = SUBMISSIONS.find(s => s.id === submissionId);
    const grade = GRADES.find(g => g.submissionId === submissionId);

    if (!submission || !grade) throw new Error("Submission or grade not found");

    const questions = await getQuestionsByIds(Object.keys(submission.answers));
    
    let totalScore = 0;
    let totalPoints = 0;

    questions.forEach(q => {
        const answer = submission.answers[q.id];
        totalPoints += 1; // Assume each question is 1 point for now
        
        if (q.type === QuestionType.MultipleChoice) {
            if (answer === q.correctAnswerIndex) totalScore += 1;
        } else if (q.type === QuestionType.TrueFalse) {
            if (answer === q.correctAnswer) totalScore += 1;
        } else if (q.type === QuestionType.ShortAnswer) {
            totalScore += manualScores[q.id] || 0;
        } else if (q.type === QuestionType.FillBlank) {
            const studentAnswer = String(answer).trim().toLowerCase();
            const correctAnswers = q.acceptableAnswers.map(a => a.toLowerCase());
            if (correctAnswers.includes(studentAnswer)) {
                totalScore += 1;
            }
        } else if (q.type === QuestionType.MultipleSelect) {
            const studentAnswers = new Set(answer as number[]);
            const correctAnswers = new Set(q.correctAnswerIndices);
            if (studentAnswers.size === correctAnswers.size && [...studentAnswers].every(i => correctAnswers.has(i))) {
                totalScore += 1;
            }
        }
    });

    // If manualScores contains rubric scores, use that instead
    if (Object.keys(manualScores).some(k => k.startsWith('criterion-'))) {
        let rubricScore = 0;
        let maxRubricScore = 0;
        const { rubric } = await getSubmissionDetails(submissionId);
        if (rubric) {
            rubric.criteria.forEach(c => {
                rubricScore += manualScores[`criterion-${c.id}`] || 0;
                maxRubricScore += c.points;
            });
            totalScore = rubricScore;
            totalPoints = maxRubricScore;
        }
    }


    grade.score = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 100;
    grade.status = 'graded';

    return grade;
};

// --- Rubrics API ---

export const getRubrics = async (instructorId: string): Promise<Rubric[]> => {
    await delay(300);
    return RUBRICS.filter(r => r.instructorId === instructorId);
};

export const createRubric = async (data: Omit<Rubric, 'id'>): Promise<Rubric> => {
    await delay(300);
    const newRubric: Rubric = { ...data, id: `r-${Date.now()}` };
    RUBRICS.push(newRubric);
    return newRubric;
};

export const updateRubric = async (id: string, updates: Partial<Omit<Rubric, 'id' | 'instructorId'>>): Promise<Rubric | null> => {
    await delay(300);
    const index = RUBRICS.findIndex(r => r.id === id);
    if (index === -1) return null;
    RUBRICS[index] = { ...RUBRICS[index], ...updates };
    return RUBRICS[index];
};

export const deleteRubric = async (id: string): Promise<{ success: boolean }> => {
    await delay(300);
    const index = RUBRICS.findIndex(r => r.id === id);
    if (index === -1) return { success: false };
    RUBRICS.splice(index, 1);
    return { success: true };
};

// --- Student Program API ---
export const getStudentProgramDetails = async (studentId: string): Promise<StudentProgramDetails | null> => {
    await delay(500);
    const student = USERS.find(u => u.id === studentId);
    if (!student || !student.programId) {
        return null;
    }
    
    const program = PROGRAMS.find(p => p.id === student.programId);
    if (!program) {
        return null;
    }

    const studentEnrollments = ENROLLMENTS.filter(e => e.studentId === studentId);
    const studentGrades = GRADES.filter(g => g.studentId === studentId);

    let completedCoursesCount = 0;
    
    const programCourses: ProgramCourse[] = program.courseIds.map(courseId => {
        const course = COURSES_DETAILED.find(c => c.id === courseId)!;
        const isEnrolled = studentEnrollments.some(e => e.courseId === courseId);
        
        // Simple logic for completion: check if there's any final grade for the course.
        // A more complex system would check for a specific 'final grade' item or a completion flag.
        const courseGrades = studentGrades.filter(g => g.courseId === courseId && g.score !== null);
        const isCompleted = courseGrades.length > 0; // Simplified: if any grade exists, consider it "completed" for this mock.
        if (isCompleted) completedCoursesCount++;

        const status = isCompleted ? 'completed' : (isEnrolled ? 'in_progress' : 'not_started');
        
        // Find an average score for a 'final grade'
        const finalGrade = isCompleted ? Math.round(courseGrades.reduce((sum, g) => sum + g.score!, 0) / courseGrades.length) : null;
        
        return {
            ...course,
            enrollmentStatus: status,
            finalGrade: finalGrade,
        };
    });

    const progress = program.courseIds.length > 0 ? Math.round((completedCoursesCount / program.courseIds.length) * 100) : 0;

    return {
        program,
        progress,
        courses: programCourses,
    };
};