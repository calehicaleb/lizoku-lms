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

export enum DeliveryMode {
    Online = 'online',
    Hybrid = 'hybrid',
    OnSite = 'on-site'
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
  county?: string;
}

export interface StatCardData {
  icon: IconName;
  title: string;
  value: string;
  color: string;
}

export interface CourseSummary {
  id: string;
  offeringId: string;
  title: string;
  progress?: number;
  imageUrl: string;
  students?: number;
  instructor?: string;
  rating?: number;
  deliveryMode?: DeliveryMode;
  semesterName?: string;
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
    Draft = 'draft',
    Published = 'published',
    Grading = 'grading',
    Finalized = 'finalized',
    Archived = 'archived',
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
    LiveSession = 'live-session',
    Survey = 'survey',
    Leaderboard = 'leaderboard',
    Scorm = 'scorm',
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

export interface CustomLiveDetails {
    platform: 'Zoom' | 'Meet' | 'Teams' | 'Built-in';
    meetingUrl: string;
    startTime: string; // ISO
    durationMinutes: number;
}

export interface FillBlankQuestion extends BaseQuestion {
    type: QuestionType.FillBlank;
    acceptableAnswers: string[];
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion | MultipleSelectQuestion | FillBlankQuestion;

export interface VideoInteraction {
    id: string;
    timestamp: number;
    question: Question;
}

export enum SurveyQuestionType {
    Rating = 'rating',
    OpenEnded = 'open-ended',
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
    offlineDetails?: {
        location: string;
        startDateTime: string;
        durationMinutes: number;
        notes?: string;
    };
    liveDetails?: CustomLiveDetails;
    surveyQuestions?: SurveyQuestion[];
    scormDetails?: {
        version: '1.2' | '2004';
        launchFile: string;
        packageUrl: string;
    };
}

export interface Module {
    id: string;
    title: string;
    items: ContentItem[];
}

export interface Course {
    id: string;
    masterId: string;
    title: string;
    description: string;
    instructorId: string;
    instructorName: string;
    departmentId: string;
    departmentName: string;
    semesterId: string;
    semesterName: string;
    status: CourseStatus;
    modules?: Module[];
    progress?: number;
    students?: number;
    price?: number; 
    deliveryMode: DeliveryMode;
    gradingDeadline?: string;
}

export enum DisputeStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
}

export interface GradeDispute {
    id: string;
    gradeId: string;
    studentId: string;
    studentReason: string;
    instructorComment?: string;
    status: DisputeStatus;
    createdAt: string;
}

export interface GradeHistoryEntry {
    id: string;
    timestamp: string;
    modifierName: string;
    oldScore: number | null;
    newScore: number;
    reason: string;
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
    aiSuggestion?: string;
    plagiarismScore?: number;
    isDisputed?: boolean;
    disputeId?: string;
    canResubmit?: boolean;
    history?: GradeHistoryEntry[];
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
    textContent?: string;
}

export type Submission = QuizSubmission | AssignmentSubmission;

export enum CalendarEventType {
    Assignment = 'assignment',
    Quiz = 'quiz',
    Holiday = 'holiday',
    Maintenance = 'maintenance',
    OnSiteSession = 'on-site-session',
    LiveSession = 'live-session',
    Graduation = 'graduation',
    Summons = 'summons',
    Meeting = 'meeting',
}

export enum CalendarVisibility {
    Everyone = 'everyone',
    Instructors = 'instructors',
    Students = 'students',
    SpecificUsers = 'specific_users',
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: CalendarEventType;
    courseName?: string;
    courseId?: string;
    location?: string;
    time?: string;
    description?: string;
    link?: string;
    visibility: CalendarVisibility;
    targetUserIds?: string[];
    createdBy?: string;
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

export enum NotificationType {
  NewGrade = 'new_grade',
  NewMessage = 'new_message',
  NewAnnouncement = 'new_announcement',
  AssignmentDueSoon = 'assignment_due_soon',
  OnSiteReminder = 'on_site_reminder',
  GradeDispute = 'grade_dispute',
}

export interface VersionHistoryEntry {
    id: string;
    courseId: string;
    versionNumber: number;
    changedBy: string;
    timestamp: string;
    changeSummary: string;
    snapshot: Module[];
}

export interface RegionalStat {
    county: string;
    userCount: number;
    activeLearners: number;
    completionRate: number;
    attendanceRate?: number;
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

export interface DepartmentBudget {
    departmentId: string;
    departmentName: string;
    allocatedAmount: number;
    spentAmount: number;
    generatedRevenue: number;
    netIncome: number;
    trainingNeedsCount: number;
}

export interface FinancialTrend {
    month: string;
    revenue: number;
    expenses: number;
}

export interface LeaderboardEntry {
    studentId: string;
    name: string;
    avatarUrl: string;
    points: number;
    rank: number;
    trend: 'up' | 'down' | 'same';
}

export interface SurveySummary {
    surveyId: string;
    title: string;
    totalRespondents: number;
    results: SurveyQuestionResult[];
}

export interface SurveyQuestionResult {
    questionId: string;
    questionText: string;
    type: SurveyQuestionType;
    responseCount: number;
    averageRating?: number;
    ratingDistribution?: Record<number, number>;
    yesNoDistribution?: { yes: number, no: number };
    textResponses?: string[];
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
    applicationLink?: string;
    skills: string[];
}

export enum JobType {
    FullTime = 'full-time',
    PartTime = 'part-time',
    Contract = 'contract',
    Gig = 'gig',
    Internship = 'internship'
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

export interface StudentSubmissionDetails {
    student: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    submission: Submission | null;
    grade: Grade | null;
}

export interface CourseGradingSummary {
    courseId: string;
    courseTitle: string;
    status: CourseStatus;
    items: GradableItemSummary[];
}

export interface GradableItemSummary {
    id: string;
    title: string;
    type: ContentType;
    dueDate: string;
    totalEnrolled: number;
    submittedCount: number;
    gradedCount: number;
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

export enum MediaType {
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    Document = 'document',
}

export interface ContentItemDetails {
    id: string;
    content: string;
}

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
    type: 'quiz' | 'assignment' | 'exam' | 'on-site' | 'live';
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

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  action: ActivityActionType;
  description: string;
  timestamp: string;
  location?: string;
}

export enum ActivityActionType {
  Login = 'login',
  Logout = 'logout',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  View = 'view',
  Enroll = 'enroll',
  GradeFinalize = 'grade_finalize',
  GradeUnlock = 'grade_unlock',
}

export interface InstitutionSettings {
  institutionName: string;
  logoUrl: string;
  primaryColor: string;
}

export interface CertificateSettings {
  logoUrl: string;
  signatureImageUrl: string;
  signatureSignerName: string;
  signatureSignerTitle: string;
  primaryColor: string;
  autoIssueOnCompletion: boolean;
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

export enum CertificateRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Denied = 'denied',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  unlocked: boolean;
}

export interface Certificate {
  id: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  certificateId: string;
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

export enum ExaminationStatus {
    Draft = 'draft',
    Scheduled = 'scheduled',
    Completed = 'completed',
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

export interface StudentTranscript {
    studentName: string;
    studentId: string;
    programName: string;
    semesters: TranscriptSemester[];
    cumulativeGpa: number;
}

export interface TranscriptSemester {
    semesterName: string;
    courses: TranscriptCourse[];
    semesterGpa: number;
}

export interface TranscriptCourse {
    courseCode: string;
    courseTitle: string;
    credits: number;
    grade: string;
    gradePoints: number;
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

export interface Communication {
    id: string;
    subject: string;
    content: string;
    recipientsSummary: string;
    sentAt: string;
    authorName: string;
}

export interface StudentProgramDetails {
    program: Program;
    progress: number;
    courses: ProgramCourse[];
}

export interface ProgramCourse extends Course {
    enrollmentStatus: CourseEnrollmentStatus;
    finalGrade: number | null;
}

export type CourseEnrollmentStatus = 'completed' | 'in_progress' | 'not_started';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface SurveySubmission {
  id: string;
  surveyId: string;
  studentId: string;
  submittedAt: string;
  answers: Record<string, any>;
}
