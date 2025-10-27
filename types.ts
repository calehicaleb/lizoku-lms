// Fix: Import React to provide the 'React' namespace.
import React from 'react';
// Fix: Import IconName type for use in StatCardData to ensure type safety for icon strings.
import { IconName } from './components/icons';

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
}

export interface QuizSubmission {
    id: string;
    studentId: string;
    courseId: string;
    contentItemId: string; // The quiz ID
    submittedAt: string;
    answers: Record<string, string | number | boolean | number[]>; // questionId -> answer
    attemptNumber: number;
}


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
    threadId: string;
    authorName: string;
    authorAvatarUrl: string;
    content: string;
    createdAt: string; // ISO String
}

export interface DiscussionThread {
    id: string;
    discussionId: string; // Links to a ContentItem of type 'discussion'
    title: string;
    authorName: string;
    createdAt: string; // ISO String
    postCount: number;
    posts?: DiscussionPost[];
}

export enum QuestionType {
    MultipleChoice = 'multiple-choice',
    TrueFalse = 'true-false',
    ShortAnswer = 'short-answer',
    MultipleSelect = 'multiple-select',
    FillBlank = 'fill-in-the-blank',
}

// Base interface for all question types
interface BaseQuestion {
    id: string;
    instructorId: string;
    stem: string; // The question text itself
    type: QuestionType;
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
    points: number; // Max points for this criterion
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