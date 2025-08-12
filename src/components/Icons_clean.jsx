import React from 'react';

// Imports Heroicons
import {
  // Navigation et interface
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  
  // Authentification et utilisateurs
  UserCircleIcon,
  UserGroupIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  
  // Médical
  HeartIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PlusIcon,
  PhoneIcon,
  VideoCameraIcon,
  
  // Actions
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  
  // États et notifications
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ClockIcon,
  
  // Interface
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

import {
  // Versions solides pour les états actifs
  HomeIcon as HomeSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  CalendarDaysIcon as CalendarSolidIcon,
  ChartBarSquareIcon as ChartSolidIcon,
  HeartIcon as HeartSolidIcon,
  CheckCircleIcon as CheckSolidIcon,
} from '@heroicons/react/24/solid';

// Imports Lucide
import {
  Stethoscope,
  Pill,
  Activity,
  Users,
  FileText,
  Calendar,
  MessageCircle,
  Shield,
  AlertCircle,
  Settings,
  User,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Video,
  Send,
  Paperclip,
  Mic,
  Download,
  Edit,
  Trash2,
  X,
  Check,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Menu,
  LogOut,
  Bell,
  Mail,
  MapPin,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowLeft,
  ArrowRight,
  Refresh,
  Thermometer,
  Syringe,
  Heart,
  Brain,
  Smile,
  Folder,
  AlertTriangle,
  Monitor,
  Cpu,
  Bot,
  Save,
  Upload,
  Archive,
  Copy,
  Share
} from 'lucide-react';

// Icônes pour la navigation principale
export const NavigationIcons = {
  Dashboard: ChartBarSquareIcon,
  DashboardSolid: ChartSolidIcon,
  Chat: MessageCircle,
  ChatSolid: ChatSolidIcon,
  Consultation: Stethoscope,
  ConsultationSolid: HeartSolidIcon,
  Admin: Settings,
  Home: HomeIcon,
  HomeSolid: HomeSolidIcon,
  Help: MessageCircle,
  Location: MapPin,
};

// Icônes pour l'authentification
export const AuthIcons = {
  User: User,
  UserGroup: Users,
  Lock: Lock,
  Unlock: Unlock,
  Eye: Eye,
  EyeOff: EyeOff,
  Login: LogOut,
  Logout: LogOut,
  Shield: Shield,
};

// Icônes médicales spécialisées
export const MedicalIcons = {
  // Soins et examens
  Stethoscope: Stethoscope,
  Thermometer: Thermometer,
  Pill: Pill,
  Syringe: Syringe,
  
  // Personnel et consultation
  Doctor: User,
  Nurse: Users,
  Patient: User,
  
  // Spécialités
  Heart: Heart,
  Brain: Brain,
  Eye: Eye,
  Tooth: Smile,
  
  // Documents et rendez-vous
  Document: FileText,
  Files: Archive,
  Appointment: Calendar,
  Prescription: FileText,
  
  // Urgences et surveillance
  Emergency: AlertTriangle,
  Monitor: Monitor,
  Activity: Activity,
  
  // Intelligence artificielle et assistance
  AI: Cpu,
  Robot: Bot,
  Assistant: User
};

// Icônes pour les statuts et états
export const StatusIcons = {
  Check: Check,
  X: X,
  Clock: Clock,
  Star: Star,
  Eye: Eye,
  Question: MessageCircle,
  Warning: AlertTriangle,
  Info: AlertCircle,
  Success: Check,
  Error: X,
  Bell: Bell,
  Mail: Mail,
};

// Icônes pour les actions
export const ActionIcons = {
  Add: Plus,
  Plus: Plus,
  Edit: Edit,
  Delete: Trash2,
  Save: Save,
  Cancel: X,
  Confirm: Check,
  Search: Search,
  Filter: Filter,
  Download: Download,
  Upload: Upload,
  Share: Share,
  Copy: Copy,
  Send: Send,
  Call: Phone,
  Phone: Phone,
  Video: Video,
  Message: MessageCircle,
  Attach: Paperclip,
  Mic: Mic,
  More: MoreHorizontal,
  Settings: Settings,
  Refresh: Refresh,
  Back: ArrowLeft,
  Forward: ArrowRight,
  Up: ChevronDown,
  Down: ChevronDown,
  Right: ChevronRight,
  Menu: Menu,
  Close: X,
};

// Composant Icon générique
export const Icon = ({ 
  icon: IconComponent, 
  size = "w-5 h-5", 
  className = "", 
  ...props 
}) => {
  if (!IconComponent) return null;
  
  return (
    <IconComponent 
      className={`${size} ${className}`} 
      {...props} 
    />
  );
};

// Composant MedicalIcon avec variants de couleurs
export const MedicalIcon = ({ 
  icon: IconComponent, 
  size = "w-5 h-5", 
  variant = "primary", 
  className = "", 
  ...props 
}) => {
  if (!IconComponent) return null;
  
  const variantClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-500", 
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    medical: "text-purple-600"
  };
  
  const colorClass = variantClasses[variant] || variantClasses.primary;
  
  return (
    <IconComponent 
      className={`${size} ${colorClass} ${className}`} 
      {...props} 
    />
  );
};

// Export par défaut
export default {
  NavigationIcons,
  AuthIcons,
  MedicalIcons,
  StatusIcons,
  ActionIcons,
  Icon,
  MedicalIcon
};
