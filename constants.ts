import { NavItem } from './components/layout/Sidebar';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: '/admin', name: 'Dashboard', icon: 'LayoutDashboard', section: 'Main' },
  { path: '/calendar', name: 'Calendar', icon: 'Calendar', section: 'Main' },
  { path: '/admin/users', name: 'User Management', icon: 'Users', section: 'Main' },
  { path: '/admin/communications', name: 'Communications', icon: 'MessageSquare', section: 'Main' },
  
  { path: '/admin/departments', name: 'Departments', icon: 'Building', section: 'Academic Management' },
  { path: '/admin/programs', name: 'Programs', icon: 'GraduationCap', section: 'Academic Management' },
  { path: '/admin/semesters', name: 'Semesters', icon: 'BookCopy', section: 'Academic Management' },
  { path: '/admin/courses', name: 'Courses', icon: 'Book', section: 'Academic Management' },
  { path: '/admin/examinations', name: 'Examinations', icon: 'PenSquare', section: 'Academic Management' },
  { path: '/admin/reports', name: 'Reporting', icon: 'FilePieChart', section: 'Academic Management' },
  
  { path: '/admin/certificate-settings', name: 'Certificate Settings', icon: 'BadgeCheck', section: 'Certificates' },
  { path: '/admin/certificate-requests', name: 'Certificate Requests', icon: 'Banknote', section: 'Certificates' },
  
  { path: '/admin/quick-setup', name: 'Quick Setup', icon: 'Wrench', section: 'System' },
  { path: '/admin/announcements', name: 'Site Announcements', icon: 'ScrollText', section: 'System' },
  { path: '/admin/question-bank', name: 'Question Bank', icon: 'FileText', section: 'System' },
  { path: '/admin/activity-logs', name: 'Activity Logs', icon: 'ListChecks', section: 'System' },
  { path: '/admin/security', name: 'Security Management', icon: 'Shield', section: 'System' },
  { path: '/admin/sessions', name: 'Session Management', icon: 'Clock', section: 'System' },
];

export const INSTRUCTOR_NAV_ITEMS: NavItem[] = [
  { path: '/instructor', name: 'Dashboard', icon: 'LayoutDashboard', section: 'Main' },
  { path: '/calendar', name: 'Calendar', icon: 'Calendar', section: 'Main' },
  
  { path: '/instructor/courses', name: 'My Courses', icon: 'Book', section: 'Course Management' },
  { path: '/instructor/gradebook', name: 'Gradebook', icon: 'PenSquare', section: 'Course Management' },
  { path: '/instructor/examinations', name: 'Examinations', icon: 'ListChecks', section: 'Course Management' },
  { path: '/instructor/question-bank', name: 'Question Bank', icon: 'FileText', section: 'Course Management' },
  { path: '/instructor/rubrics', name: 'Rubrics', icon: 'ClipboardCheck', section: 'Course Management' },


  { path: '/instructor/profile', name: 'My Profile', icon: 'User', section: 'Account' },
];

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', name: 'Dashboard', icon: 'LayoutDashboard', section: 'Main' },
  { path: '/explore', name: 'Explore Courses', icon: 'Search', section: 'Main' },

  { path: '/my-courses', name: 'My Courses', icon: 'BookOpen', section: 'Academics' },
  { path: '/program', name: 'My Program', icon: 'GraduationCap', section: 'Academics' },
  { path: '/calendar', name: 'Calendar', icon: 'Calendar', section: 'Academics' },
  { path: '/my-messages', name: 'My Messages', icon: 'MessageSquare', section: 'Academics' },
  { path: '/grades', name: 'My Grades', icon: 'PenSquare', section: 'Academics' },
  { path: '/transcript', name: 'My Transcript', icon: 'ScrollText', section: 'Academics' },
  { path: '/my-certificates', name: 'My Certificates', icon: 'BadgeCheck', section: 'Academics' },
  { path: '/achievements', name: 'My Achievements', icon: 'Trophy', section: 'Academics' },

  { path: '/profile', name: 'My Profile', icon: 'User', section: 'Account' },
];