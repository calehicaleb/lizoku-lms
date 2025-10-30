import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Book, 
    Shield, 
    BarChart2, 
    Settings, 
    GraduationCap, 
    FileText, 
    Presentation,
    BadgeCheck,
    ListChecks,
    BookOpen,
    Trophy,
    Calendar,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Building,
    BookCopy,
    PenSquare,
    FilePieChart,
    Banknote,
    Wrench,
    ScrollText,
    KeyRound,
    Clock,
    Search,
    User,
    ChevronDown,
    CheckCircle,
    FileVideo,
    ClipboardCheck,
    Link,
    GripVertical,
    Sparkles,
    History,
    Send,
    Bell,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Globe,
    Lock,
    UploadCloud,
    FileImage,
    Info,
    FileMusic,
    Maximize2,
    Minimize2,
} from 'lucide-react';

const iconMap = {
    LayoutDashboard, Users, Book, Shield, BarChart2, Settings, GraduationCap, FileText, Presentation,
    BadgeCheck, ListChecks, BookOpen, Trophy, Calendar, MessageSquare, LogOut, Menu, X, Building, BookCopy,
    PenSquare, FilePieChart, Banknote, Wrench, ScrollText, KeyRound, Clock, Search, User, ChevronDown, CheckCircle,
    FileVideo, ClipboardCheck, Link, GripVertical, Sparkles, History, Send, Bell, ChevronLeft, ChevronRight,
    AlertTriangle, Globe, Lock, UploadCloud, FileImage, Info, FileMusic,
    Maximize: Maximize2,
    Minimize: Minimize2,
};

export type IconName = keyof typeof iconMap;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};