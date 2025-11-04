

// Fix: Import IconName for use within this file and re-export it for other modules, resolving errors where IconName was not found.
import type { IconName } from './components/icons';
export type { IconName };

// Fix: Removed self-import of User which caused a naming conflict.

export enum UserRole {
  Admin = 'admin',
  Instructor = 'instructor',
  Student = 'student',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Banned = 'banned',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  status: UserStatus;
  createdAt: string;
  programId?: string; // Added to link students to a program
}

export interface StatCardData {
  // Fix: Changed icon type from React.ElementType to IconName to match the string-based icon keys used in the application.
  icon: IconName;
  title: string;
  value: string;
  color: string;
}

export interface CourseSummary {
  id: string;
  title: string;
  progress?: number;
  imageUrl: string;
  students?: number;
  instructor?: string;
  rating?: number;
}

export interface Department {
    id: string;
    name: string;
    head: string; // User ID
    programCount: number;
}

export interface Program {
    id: string;
    name: string;
    departmentId: string;
    departmentName: string;
    courseCount: number;
    duration: string;
    courseIds: string[]; // Added to link programs to courses
}

export enum SemesterStatus {
    Upcoming = 'upcoming',
    Active = 'active',
    Past = 'past',
}

export interface Semester {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: SemesterStatus;
}

export enum CourseStatus {
    Published = 'published',
    Draft = 'draft',
}

export enum ContentType {
    Lesson = 'lesson',
    Quiz = 'quiz',
    Assignment = 'assignment',
    Discussion = 'discussion',
    Resource = 'resource',
    Examination = 'examination',
}

export interface ContentItem {
    id: string;
    title: string;
    type: ContentType;
    questionIds?: string[]; // IDs from the Question Bank
    timeLimit?: number; // in minutes
    attemptsLimit?: number; // max number of attempts
    randomizeQuestions?: boolean;
    rubricId?: string; // ID of the associated rubric
    instructions?: string; // Instructions for quiz/assignment
    requiresFileUpload?: boolean; // For assignments
    examinationId?: string;
    dueDate?: string; // ISO String, e.g. for assignments/quizzes
    maxPoints?: number; // for gradable discussions
}

export interface Module {
    id: string;
    title: string;
    items: ContentItem[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    // Fix: Corrected ID types from number to string to match mock data and application usage.
    instructorId: string;
    instructorName: string;
    // Fix: Corrected ID types from number to string to match mock data and application usage.
    departmentId: string;
    departmentName: string;
    status: CourseStatus;
    modules?: Module[]; // Added for Course Builder
    // Fix: Add properties needed for dashboard view
    progress?: number;
    students?: number;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string; // User's name
    createdAt: string; // Date string
}

export interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
}

export interface Grade {
    id: string;
    studentId: string;
    courseId: string;
    contentItemId: string;
    score: number | null; // Can be a number or null if not graded
    status: 'graded' | 'pending review';
    submissionId?: string;
    feedback?: string; // General text feedback
    rubricFeedback?: Record<string, { points: number; comment?: string }>; // criterionId -> { points, comment }
}

export interface QuizSubmission {
    id: string;
    type: 'quiz';
    studentId: string;
    courseId: string;
    contentItemId: string; // The quiz ID
    submittedAt: string;
    answers: Record<string, string | number | boolean | number[]>; // questionId -> answer
    attemptNumber: number;
}

export interface AssignmentSubmission {
    id: string;
    type: 'assignment';
    studentId: string;
    courseId: string;
    contentItemId: string; // The assignment ID
    submittedAt: string;
    file: {
        name: string;
        size: number; // in bytes
        url: string; // mock URL
    };
}

export type Submission = QuizSubmission | AssignmentSubmission;


export enum CalendarEventType {
    Assignment = 'assignment',
    Quiz = 'quiz',
    Holiday = 'holiday',
    Maintenance = 'maintenance',
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: CalendarEventType;
    courseName?: string; // Optional, for course-specific events
}

export interface DiscussionPost {
    id: string;
    discussionId: string; // Links to a ContentItem of type 'discussion'
    parentId?: string; // ID of the post this is a reply to. If undefined, it's a thread starter.
    authorId: string;
    authorName: string;
    authorAvatarUrl: string;
    authorRole: UserRole;
    content: string;
    createdAt: string; // ISO String
    isRead: boolean; // For unread indicators
    children?: DiscussionPost[]; // For client-side rendering
    replyCount?: number; // Total replies in this sub-thread
}

export enum QuestionType {
    MultipleChoice = 'multiple-choice',
    TrueFalse = 'true-false',
    ShortAnswer = 'short-answer',
    MultipleSelect = 'multiple-select',
    FillBlank = 'fill-in-the-blank',
}

export enum QuestionDifficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard',
}

// Base interface for all question types
interface BaseQuestion {
    id: string;
    instructorId: string;
    stem: string; // The question text itself
    type: QuestionType;
    difficulty: QuestionDifficulty;
    topics: string[];
    courseId?: string;
    moduleId?: string;
    isPublic: boolean;
    imageUrl?: string;
    maxPoints?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: QuestionType.MultipleChoice;
    options: string[];
    correctAnswerIndex: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: QuestionType.TrueFalse;
    correctAnswer: boolean;
}

export interface ShortAnswerQuestion extends BaseQuestion {
    type: QuestionType.ShortAnswer;
    // Represents one or more acceptable answers for auto-grading.
    // For subjective manual grading, this could be an empty array.
    acceptableAnswers: string[]; 
}

export interface MultipleSelectQuestion extends BaseQuestion {
    type: QuestionType.MultipleSelect;
    options: string[];
    correctAnswerIndices: number[];
}

export interface FillBlankQuestion extends BaseQuestion {
    type: QuestionType.FillBlank;
    // Case-insensitive acceptable answers for the blank.
    acceptableAnswers: string[];
}


// A discriminated union of all possible question types
export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion | MultipleSelectQuestion | FillBlankQuestion;

// --- Rubrics ---
export interface RubricLevel {
    id: string;
    name: string;
    points: number;
}

export interface RubricCriterion {
    id: string;
    description: string;
    longDescription?: string;
    points: number; // Max points for this criterion
    levelDescriptions?: { [levelId: string]: string };
}

export interface Rubric {
    id: string;
    instructorId: string;
    title: string;
    criteria: RubricCriterion[];
    levels: RubricLevel[];
}

// --- My Program Page ---
export type CourseEnrollmentStatus = 'completed' | 'in_progress' | 'not_started';

export interface ProgramCourse extends Course {
    enrollmentStatus: CourseEnrollmentStatus;
    finalGrade: number | null;
}

export interface StudentProgramDetails {
    program: Program;
    progress: number; // Overall percentage
    courses: ProgramCourse[];
}

export interface Communication {
    id: string;
    subject: string;
    content: string;
    recipientsSummary: string; // e.g., "All Students", "Instructors (3)", "John Doe, Jane Smith"
    sentAt: string; // ISO String
    authorName: string;
}

export interface SecuritySettings {
    enableAiFeatures: boolean;
    aiSafetyFilter: 'Low' | 'Medium' | 'High';
    passwordPolicy: {
        minLength: boolean;
        requireUppercase: boolean;
        requireNumber: boolean;
    };
}

// --- My Transcript Page ---
export interface TranscriptCourse {
    courseCode: string; // e.g., CS101
    courseTitle: string;
    credits: number; // e.g., 3
    grade: string; // e.g., A, B+, etc.
    gradePoints: number; // e.g., 4.0, 3.3
}

export interface TranscriptSemester {
    semesterName: string; // e.g., "Summer 2024"
    courses: TranscriptCourse[];
    semesterGpa: number;
}

export interface StudentTranscript {
    studentName: string;
    studentId: string; // Can be the user ID
    programName: string;
    semesters: TranscriptSemester[];
    cumulativeGpa: number;
}

// --- My Messages Page ---
export interface Message {
    id: string;
    threadId: string;
    authorId: string; // User ID
    authorName: string;
    authorAvatarUrl: string;
    content: string;
    createdAt: string; // ISO String
}

export interface MessageThread {
    id: string;
    participants: Pick<User, 'id' | 'name' | 'avatarUrl'>[]; // Simplified user object with avatar
    subject: string;
    lastMessage: {
        content: string;
        createdAt: string; // ISO String
    };
    isRead: boolean;
    messages?: Message[]; // Will be populated when a thread is selected
}

// --- Examinations ---
export enum ExaminationStatus {
    Draft = 'draft',
    Scheduled = 'scheduled',
    Completed = 'completed',
}

export interface Examination {
    id: string;
    instructorId: string;
    title: string;
    instructions: string;
    courseId: string;
    courseTitle: string;
    scheduledStart: string; // ISO String
    scheduledEnd: string; // ISO String
    durationMinutes: number;
    questionIds: string[];
    shuffleQuestions: boolean;
    status: ExaminationStatus;
}

// --- My Certificates Page ---
export interface Certificate {
  id: string;
  courseName: string;
  studentName: string;
  issueDate: string; // ISO String or formatted date string
  certificateId: string; // A unique ID for the certificate
}

// --- My Achievements Page ---
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  unlocked: boolean;
}

// --- Certificate Settings ---
export interface CertificateSettings {
  logoUrl: string;
  signatureImageUrl: string;
  signatureSignerName: string;
  signatureSignerTitle: string;
  primaryColor: string;
  autoIssueOnCompletion: boolean;
}

// --- Certificate Requests ---
export enum CertificateRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Denied = 'denied',
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  requestDate: string; // ISO String
  status: CertificateRequestStatus;
}

// --- Institution Settings ---
export interface InstitutionSettings {
  institutionName: string;
  logoUrl: string;
  primaryColor: string;
}

// --- Activity Logs ---
export enum ActivityActionType {
  Login = 'login',
  Logout = 'logout',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  View = 'view',
  Enroll = 'enroll',
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  action: ActivityActionType;
  description: string; // e.g., "Updated user 'John Doe'."
  timestamp: string; // ISO String
}

// --- Session Management ---
export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  userRole: UserRole;
  loginTime: string; // ISO String
  lastActiveTime: string; // ISO String
  ipAddress: string;
}

// --- Notifications ---
// Fix: Completed the NotificationType enum with all required values.
export enum NotificationType {
  NewGrade = 'new_grade',
  NewMessage = 'new_message',
  NewAnnouncement = 'new_announcement',
  AssignmentDueSoon = 'assignment_due_soon',
}

// Fix: Added Notification interface.
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

// Fix: Added types for Student Dashboard.
export interface OverdueItem {
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    link: string;
}

export interface UpcomingDeadline {
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    type: 'quiz' | 'assignment' | 'exam';
}

export interface RecentActivity {
    id: string;
    type: string;
    title: string;
    summary: string;
    timestamp: string;
    link: string;
    icon: IconName;
}

// Fix: Added type for content viewers.
export interface ContentItemDetails {
    id: string;
    content: string;
}

// --- Media Library ---
export enum MediaType {
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    Document = 'document',
}

export interface MediaItem {
    id: string;
    instructorId: string;
    name: string;
    type: MediaType;
    url: string;
    size: number; // in bytes
    uploadedAt: string; // ISO String
    isPublic: boolean;
}


// --- Grading Hub ---
export interface GradableItemSummary {
    id: string;
    title: string;
    type: ContentType;
    dueDate: string;
    totalEnrolled: number;
    submittedCount: number;
    gradedCount: number;
}

export interface CourseGradingSummary {
    courseId: string;
    courseTitle: string;
    items: GradableItemSummary[];
}

export interface StudentSubmissionDetails {
    student: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    submission: Submission | null;
    grade: Grade | null;
}