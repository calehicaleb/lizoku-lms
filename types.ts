
import type { IconName } from './components/icons';
export type { IconName };

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
  programId?: string;
  county?: string; // Added for Geospatial Analytics
}

export interface StatCardData {
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
    head: string;
    programCount: number;
}

export interface Program {
    id: string;
    name: string;
    departmentId: string;
    departmentName: string;
    courseCount: number;
    duration: string;
    courseIds: string[];
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
    PendingReview = 'pending_review',
    Rejected = 'rejected',
}

export enum ContentType {
    Lesson = 'lesson',
    Quiz = 'quiz',
    Assignment = 'assignment',
    Discussion = 'discussion',
    Resource = 'resource',
    Examination = 'examination',
    InteractiveVideo = 'interactive-video',
    OfflineSession = 'offline-session',
    Survey = 'survey',
    Leaderboard = 'leaderboard',
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
    stem: string;
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
    acceptableAnswers: string[]; 
}

export interface MultipleSelectQuestion extends BaseQuestion {
    type: QuestionType.MultipleSelect;
    options: string[];
    correctAnswerIndices: number[];
}

export interface FillBlankQuestion extends BaseQuestion {
    type: QuestionType.FillBlank;
    acceptableAnswers: string[];
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion | MultipleSelectQuestion | FillBlankQuestion;

export interface VideoInteraction {
    id: string;
    timestamp: number; // in seconds
    question: Question;
}

// Survey Types
export enum SurveyQuestionType {
    Rating = 'rating', // 1-5 Stars
    OpenEnded = 'open-ended', // Text Area
    YesNo = 'yes-no',
}

export interface SurveyQuestion {
    id: string;
    text: string;
    type: SurveyQuestionType;
    required: boolean;
}

export interface ContentItem {
    id: string;
    title: string;
    type: ContentType;
    questionIds?: string[];
    timeLimit?: number;
    attemptsLimit?: number;
    randomizeQuestions?: boolean;
    rubricId?: string;
    instructions?: string;
    requiresFileUpload?: boolean;
    examinationId?: string;
    dueDate?: string;
    maxPoints?: number;
    videoUrl?: string;
    interactions?: VideoInteraction[];
    // Offline Session Props
    offlineDetails?: {
        location: string;
        startDateTime: string; // ISO String
        durationMinutes: number;
        notes?: string;
    };
    // Survey Props
    surveyQuestions?: SurveyQuestion[];
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
    instructorId: string;
    instructorName: string;
    departmentId: string;
    departmentName: string;
    status: CourseStatus;
    modules?: Module[];
    progress?: number;
    students?: number;
    price?: number; // Added price for financial tracking
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

export interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
    contentItemId: string;
}

export interface Grade {
    id: string;
    studentId: string;
    courseId: string;
    contentItemId: string;
    score: number | null;
    status: 'graded' | 'pending review';
    submissionId?: string;
    feedback?: string;
    rubricFeedback?: Record<string, { points: number; comment?: string }>;
}

export interface QuizSubmission {
    id: string;
    type: 'quiz';
    studentId: string;
    courseId: string;
    contentItemId: string;
    submittedAt: string;
    answers: Record<string, string | number | boolean | number[]>;
    attemptNumber: number;
}

export interface AssignmentSubmission {
    id: string;
    type: 'assignment';
    studentId: string;
    courseId: string;
    contentItemId: string;
    submittedAt: string;
    file: {
        name: string;
        size: number;
        url: string;
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
    date: string;
    type: CalendarEventType;
    courseName?: string;
}

export interface DiscussionPost {
    id: string;
    discussionId: string;
    parentId?: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl: string;
    authorRole: UserRole;
    content: string;
    createdAt: string;
    isRead: boolean;
    children?: DiscussionPost[];
    replyCount?: number;
}

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
    points: number;
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
    progress: number;
    courses: ProgramCourse[];
}

export interface Communication {
    id: string;
    subject: string;
    content: string;
    recipientsSummary: string;
    sentAt: string;
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
    courseCode: string;
    courseTitle: string;
    credits: number;
    grade: string;
    gradePoints: number;
}

export interface TranscriptSemester {
    semesterName: string;
    courses: TranscriptCourse[];
    semesterGpa: number;
}

export interface StudentTranscript {
    studentName: string;
    studentId: string;
    programName: string;
    semesters: TranscriptSemester[];
    cumulativeGpa: number;
}

// --- My Messages Page ---
export interface Message {
    id: string;
    threadId: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

export interface MessageThread {
    id: string;
    participants: Pick<User, 'id' | 'name' | 'avatarUrl'>[];
    subject: string;
    lastMessage: {
        content: string;
        createdAt: string;
    };
    isRead: boolean;
    messages?: Message[];
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
    scheduledStart: string;
    scheduledEnd: string;
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
  issueDate: string;
  certificateId: string;
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
  requestDate: string;
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
  description: string;
  timestamp: string;
  location?: string; // Added for Geospatial
}

// --- Session Management ---
export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  userRole: UserRole;
  loginTime: string;
  lastActiveTime: string;
  ipAddress: string;
}

// --- Notifications ---
export enum NotificationType {
  NewGrade = 'new_grade',
  NewMessage = 'new_message',
  NewAnnouncement = 'new_announcement',
  AssignmentDueSoon = 'assignment_due_soon',
}

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

// --- Student Dashboard ---
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

// --- Content Viewers ---
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
    size: number;
    uploadedAt: string;
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

// --- Retention / At-Risk ---
export interface AtRiskStudent {
    studentId: string;
    name: string;
    email: string;
    avatarUrl: string;
    riskLevel: 'High' | 'Moderate';
    riskFactors: string[];
    lastLogin: string;
    currentGradeAverage: number;
    missedAssignmentsCount: number;
}

// --- Career Hub ---
export enum JobType {
    FullTime = 'full-time',
    PartTime = 'part-time',
    Contract = 'contract',
    Gig = 'gig',
    Internship = 'internship'
}

export interface JobOpportunity {
    id: string;
    title: string;
    company: string;
    location: string;
    type: JobType;
    description: string;
    requirements: string[];
    salaryRange?: string;
    postedDate: string;
    applicationLink?: string; // External link
    skills: string[];
}

export enum ApplicationStatus {
    Applied = 'applied',
    Interviewing = 'interviewing',
    Offered = 'offered',
    Rejected = 'rejected'
}

export interface JobApplication {
    id: string;
    jobId: string;
    studentId: string;
    appliedDate: string;
    status: ApplicationStatus;
}

// --- Survey Results ---
export interface SurveySubmission {
    id: string;
    surveyId: string;
    studentId: string;
    answers: Record<string, any>; // questionId -> answer (number | string)
    submittedAt: string;
}

export interface SurveyQuestionResult {
    questionId: string;
    questionText: string;
    type: SurveyQuestionType;
    responseCount: number;
    averageRating?: number; // For Rating type
    ratingDistribution?: Record<number, number>; // 1-5 counts
    yesNoDistribution?: { yes: number, no: number };
    textResponses?: string[]; // For OpenEnded
}

export interface SurveySummary {
    surveyId: string;
    title: string;
    totalRespondents: number;
    results: SurveyQuestionResult[];
}

// --- Leaderboard ---
export interface LeaderboardEntry {
    studentId: string;
    name: string;
    avatarUrl: string;
    points: number;
    rank: number;
    trend: 'up' | 'down' | 'same';
}

// --- Financial / Budgeting ---
export interface DepartmentBudget {
    departmentId: string;
    departmentName: string;
    allocatedAmount: number; // The expense budget
    spentAmount: number;
    generatedRevenue: number; // New: Tuition fees earned
    netIncome: number; // New: Revenue - Spent
    trainingNeedsCount: number;
}

export interface BudgetRequest {
    id: string;
    requesterName: string;
    departmentName: string;
    title: string; 
    justification: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
}

export interface FinancialTrend {
    month: string;
    revenue: number;
    expenses: number;
}

// --- Geospatial Analytics ---
export interface RegionalStat {
    county: string;
    userCount: number;
    activeLearners: number;
    completionRate: number;
}
