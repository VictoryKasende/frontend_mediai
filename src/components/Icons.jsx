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
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
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
  ChevronLeft,
  Grid3x3,
  List,
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
  Home,
  Upload,
  Share,
  Copy,
  Save,
  RefreshCw,
  AlertTriangle,
  Heart,
  Brain,
  Smile,
  Archive,
  Monitor,
  Cpu,
  Bot,
  UserCheck,
  Thermometer,
  Syringe,
  Target,
  FlaskConical,
  BookOpen,
  Headphones,
  Zap,
  History,
  Printer,
  BarChart3,
  Calendar as CalendarIcon,
  Grid3X3,
  StickyNote
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
  ArrowLeft: ArrowLeft,
  ArrowRight: ArrowRight,
  Back: ArrowLeft,
  ChevronLeft: ChevronLeft,
  ChevronRight: ChevronRight,
  Grid: Grid3x3,
  List: List,
  Calendar: CalendarDaysIcon,
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
  Pills: Pill,
  Syringe: Syringe,
  
  // Personnel et consultation
  Doctor: User,
  Nurse: Users,
  Patient: User,
  Profile: UserCheck,
  User: User,
  UserFemale: Users,
  
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
  Clipboard: Archive,
  Report: ClipboardDocumentListIcon, // Icône pour les consultations
  
  // Urgences et surveillance
  Emergency: AlertTriangle,
  Monitor: Monitor,
  Activity: Activity,
  
  // Intelligence artificielle et assistance
  AI: Cpu,
  Robot: Bot,
  Assistant: User,
  
  // Nouveaux pour le formulaire
  Check: Check,
  Clock: Clock,
  Location: MapPin,
  MapPin: MapPin,
  Symptoms: Zap,
  History: History,
  Target: Target,
  Test: FlaskConical,
  Book: BookOpen,
  Headphones: Headphones,
  
  // Ajouts pour les composants patients
  Dashboard: Grid3X3,
  Calendar: CalendarIcon,
  Plus: Plus,
  Edit: Edit,
  Download: Download,
  Print: Printer,
  Message: MessageCircle,
  Settings: Settings,
  
  // Ajouts pour le dashboard médecin
  Process: RefreshCw,
  Signature: Edit,
  Send: Send,
  
  // Ajouts pour les détails de consultation
  Users: Users,
  Phone: Phone,
  Notes: StickyNote,
  Info: InformationCircleIcon,
  Search: MagnifyingGlassIcon
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
  Upload: Upload,
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
  Security: Shield,
  Refresh: RefreshCw,
  Back: ArrowLeft,
  Forward: ArrowRight,
  Up: ChevronDown,
  Down: ChevronDown,
  Right: ChevronRight,
  Menu: Menu,
  Close: X,
  Email: Mail,
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

// Icône WhatsApp personnalisée
export const WhatsAppIcon = ({ size = "w-5 h-5", className = "" }) => (
  <svg 
    className={`${size} ${className}`} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
