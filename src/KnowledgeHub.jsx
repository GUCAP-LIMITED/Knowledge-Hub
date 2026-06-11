import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen, FolderOpen, FileText, Settings, Users, Search, Bell,
  Plus, X, ChevronRight, ChevronDown, ChevronLeft, Play, Clock, Eye,
  Check, CheckCircle, Edit2, Trash2, Upload, Download,
  Award, LayoutDashboard, PlayCircle, Star, TrendingUp,
  MessageSquare, Rocket, ClipboardList, BarChart3, Shield, Save,
  Menu, User, Compass, Lightbulb, HelpCircle, Send,
  FileCheck, Filter, Grid, AlertCircle, Sun, Moon,
  ArrowRight, MoreHorizontal, Share2, Inbox, Calendar,
  GraduationCap, AlertTriangle, Hash, Loader2, Copy, Link2,
  CircleDashed, FileQuestion, FileVideo, FileSpreadsheet
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ════════════════════════════════════════════════════════════════════════ */
const tokens = {
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64 },
  radius: { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 },
  shadow: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    md: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
    lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
    xl: '0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
    '2xl': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  },
  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
  ring: '0 0 0 3px rgba(4, 93, 94, 0.22)',
};

/* ── Permission modules – defined outside component so useState initialiser can reference them ── */
const permissionModules = [
  { id:'courses',      label:'Course Catalog',       icon:PlayCircle,
    base:    { id:'view',   label:'View',   desc:'Browse and open courses • Controls "Course Catalog" sidebar item' },
    granular:[ { id:'start',    label:'Start course',     desc:'Enrol in and begin new courses',            requires:['view'] },
               { id:'continue', label:'Continue course',  desc:'Resume in-progress courses',                requires:['view'] },
               { id:'review',   label:'Rate & review',    desc:'Submit ratings and written feedback',        requires:['view'] },
               { id:'filter',   label:'Search & filter',  desc:'Use advanced search, filters and sort',     requires:['view'] } ] },
  { id:'mylearning',   label:'My Learning',           icon:BookOpen,
    base:    { id:'view',   label:'View',   desc:'Personal learning dashboard' },
    granular:[ { id:'track',    label:'Track progress',   desc:'View detailed completion stats',             requires:['view'] } ] },
  { id:'tutorials',    label:'Tutorials',             icon:Lightbulb,
    base:    { id:'view',   label:'View',   desc:'Browse tutorial library' },
    granular:[ { id:'watch',    label:'Watch tutorials',  desc:'Start and complete tutorials',               requires:['view'] } ] },
  { id:'resources',    label:'Resources',             icon:FolderOpen,
    base:    { id:'view',   label:'View',   desc:'Access knowledge base and articles' },
    granular:[ { id:'search',   label:'Search',           desc:'Search articles and guides',                 requires:['view'] },
               { id:'download', label:'Download',         desc:'Download documents and files',               requires:['view'] } ] },
  { id:'certificates', label:'Certificates',          icon:Award,
    base:    { id:'view',   label:'View',   desc:'View earned certificates' },
    granular:[ { id:'download', label:'Download',         desc:'Download certificate as HTML file',          requires:['view'] },
               { id:'share',    label:'Share',            desc:'Copy credential ID and share link',          requires:['view'] } ] },
  { id:'upload',       label:'Upload Document',       icon:Upload,
    base:    { id:'access', label:'Access', desc:'Open the upload area' },
    granular:[ { id:'submit',   label:'Submit for review',desc:'Upload files into admin review queue',       requires:['access'] },
               { id:'publish',  label:'Publish directly', desc:'Bypass review — publish immediately',        requires:['access'] } ] },
  { id:'submissions',  label:'My Submissions',        icon:FileCheck,
    base:    { id:'view',   label:'View',   desc:'View own submission history and status' },
    granular:[ { id:'track',    label:'Track status',     desc:'Monitor approval status in real time',       requires:['view'] } ] },
  { id:'approvals',    label:'Approval Queue',        icon:CheckCircle,
    base:    { id:'view',   label:'View',   desc:'See all pending submissions' },
    granular:[ { id:'approve',  label:'Approve',          desc:'Approve and publish submissions',            requires:['view'] },
               { id:'reject',   label:'Reject',           desc:'Reject with a required reason note',         requires:['view'] },
               { id:'flag',     label:'Flag for review',  desc:'Move submission to under-review status',     requires:['view'] } ] },
  { id:'content',      label:'Content Management',    icon:Grid,
    base:    { id:'view',   label:'View',   desc:'Browse all platform content' },
    granular:[ { id:'create',   label:'Create',           desc:'Add new courses, articles and tutorials',    requires:['view'] },
               { id:'edit',     label:'Edit',             desc:'Modify existing content',                    requires:['view'] },
               { id:'delete',   label:'Delete',           desc:'Permanently remove content',                 requires:['view'] },
               { id:'publish',  label:'Publish / Unpublish',desc:'Control content live visibility',          requires:['view'] } ] },
  { id:'team',         label:'Team Progress',         icon:BarChart3,
    base:    { id:'view',   label:'View',   desc:'Access team analytics dashboard' },
    granular:[ { id:'export',   label:'Export reports',   desc:'Download team progress reports',             requires:['view'] },
               { id:'remind',   label:'Send reminders',   desc:'Notify non-completers via email',            requires:['view'] } ] },
  { id:'assign',       label:'Assign Training',       icon:ClipboardList,
    base:    { id:'view',   label:'View',   desc:'See all active training assignments' },
    granular:[ { id:'create',   label:'Create assignment',    desc:'Assign courses to users or groups',          requires:['view'] },
               { id:'delete',   label:'Delete assignment',    desc:'Remove existing assignments',                requires:['view'] },
               { id:'progress', label:'View per-person detail',desc:'Drill into individual completion rates',    requires:['view'] } ] },
  { id:'settings',     label:'Platform Settings',     icon:Settings,
    base:    { id:'view',   label:'View',   desc:'Access the settings area' },
    granular:[ { id:'platform',    label:'Edit platform config', desc:'Toggle platform-wide feature flags',    requires:['view'] },
               { id:'users',       label:'Manage users',         desc:'Activate, deactivate and edit roles',    requires:['view'] },
               { id:'permissions', label:'Edit permission sets', desc:'Create and modify permission groups',    requires:['view'] } ] },
];

const _buildPerms = (enabledIds, overrides = {}) => {
  const result = {};
  permissionModules.forEach(mod => {
    const on = enabledIds.includes(mod.id);
    result[mod.id] = { [mod.base.id]: on };
    mod.granular.forEach(g => { result[mod.id][g.id] = on; });
  });
  Object.entries(overrides).forEach(([mId, perms]) => { if (result[mId]) Object.assign(result[mId], perms); });
  return result;
};
const _all  = permissionModules.map(m => m.id);
const _mgr  = ['courses','mylearning','tutorials','resources','certificates','upload','submissions','team','assign'];
const _cons = ['courses','mylearning','tutorials','resources','certificates'];

const initialPermSets = [
  { id:'full',       label:'Full Access',        desc:'Complete access to all Knowledge Hub features',           locked:true, perms:_buildPerms(_all) },
  { id:'manager',    label:'Manager Access',     desc:'Upload content, track team, full learning access',                   perms:_buildPerms(_mgr,  { upload:{ access:true, submit:true, publish:false } }) },
  { id:'consultant', label:'Consultant Access',  desc:'Standard learner — courses, tutorials, resources & certificates',   perms:_buildPerms(_cons) },
];

const KnowledgeHub = () => {

  /* ── Brand Logo ── */
  const UAPPLogo = ({ size = 40 }) => (
    <svg width={size} height={size * 1.1} viewBox="0 0 100 110" fill="none" aria-label="UAPP Academy">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a9396" />
          <stop offset="100%" stopColor="#057a7b" />
        </linearGradient>
      </defs>
      <path d="M8 14 L8 72 Q8 106 50 106 Q92 106 92 72 L92 14 L70 14 L70 72 Q70 84 50 84 Q30 84 30 72 L30 14 Z" fill="url(#shieldGrad)" />
      <rect x="8" y="8" width="22" height="22" rx="11" fill="url(#shieldGrad)" />
      <rect x="70" y="8" width="22" height="22" rx="11" fill="url(#shieldGrad)" />
      <path d="M50 25 C46 25 30 27 26 34 L26 66 C30 60 46 59 50 59 Z" fill="white" />
      <path d="M50 25 C54 25 70 27 74 34 L74 66 C70 60 54 59 50 59 Z" fill="rgba(255,255,255,0.72)" />
      <rect x="48" y="25" width="4" height="34" rx="2" fill="#033E3F" opacity="0.5" />
      <path d="M50 0 L53 9 L63 9 L55 15 L58 24 L50 18 L42 24 L45 15 L37 9 L47 9 Z" fill="#FC7300" />
    </svg>
  );

  /* ════ STATE ════ */
  const [currentUser, setCurrentUser] = useState({ name: 'Md Shamim', role: 'admin' });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['learning']);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
  });

  /* Responsive */
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const isDark = userSettings.darkMode;

  /* Cmd/Ctrl+K opens search */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ════ COLOURS ════ */
  const c = {
    primary: '#045D5E',
    primaryHover: isDark ? '#0a9396' : '#034849',
    primaryLight: isDark ? 'rgba(10, 147, 150, 0.18)' : 'rgba(4, 93, 94, 0.08)',
    primarySolid: isDark ? '#0a9396' : '#045D5E',
    secondary: '#FC7300',
    secondaryHover: '#e56700',
    secondaryLight: isDark ? 'rgba(252, 115, 0, 0.18)' : 'rgba(252, 115, 0, 0.10)',
    bg: isDark ? '#0b1220' : '#F1F4F3',
    bgSubtle: isDark ? '#0f172a' : '#e5eae9',
    surface: isDark ? '#1e293b' : '#FFFFFF',
    surfaceHover: isDark ? '#293548' : '#f8fafc',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#cbd5e1' : '#475569',
    textSubtle: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#334155' : '#e2e8f0',
    borderStrong: isDark ? '#475569' : '#cbd5e1',
    success: '#10b981',
    successLight: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
    successText: isDark ? '#34d399' : '#047857',
    warning: '#f59e0b',
    warningLight: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
    warningText: isDark ? '#fbbf24' : '#b45309',
    danger: '#ef4444',
    dangerLight: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
    dangerText: isDark ? '#f87171' : '#b91c1c',
    info: '#3b82f6',
    infoLight: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
    infoText: isDark ? '#60a5fa' : '#1d4ed8',
  };

  const roleConfig = {
    consultant: { label: 'Consultant', color: c.info, desc: 'Learning and resources access' },
    manager: { label: 'Admission Manager', color: '#8b5cf6', desc: 'Upload documents and track team' },
    admin: { label: 'Administrator', color: c.danger, desc: 'Full system access' },
  };

  const canUpload = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const canApprove = currentUser?.role === 'admin';
  const canViewTeam = currentUser?.role === 'admin';

  /* ════ TOAST + CONFIRM APIs ════ */
  const toast = useCallback((message, variant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const confirm = useCallback((opts) => setConfirmDialog(opts), []);

  /* ════ MOCK DATA ════ */
  const switchableUsers = [
    { id: 'admin', group: 'System Administrator', groupColor: c.danger, name: 'Md Shamim', title: 'CEO / System Admin', role: 'admin', online: true, avatarColor: '#ef4444' },
    { id: 'mgr1', group: 'Sales Team', groupColor: c.primary, name: 'Raj Ahmed', title: 'Branch Manager (Sales)', role: 'manager', online: false, avatarColor: '#045D5E' },
    { id: 'mgr2', group: 'Sales Team', groupColor: c.primary, name: 'Emma Wilson', title: 'Sales Manager', role: 'manager', online: true, avatarColor: '#8b5cf6' },
    { id: 'lead1', group: 'Sales Team', groupColor: c.primary, name: 'Laura Tomova', title: 'Sales Team Leader', role: 'manager', online: false, avatarColor: '#3b82f6' },
    { id: 'cons1', group: 'Sales Team', groupColor: c.primary, name: 'Simona', title: 'Consultant', role: 'consultant', online: true, avatarColor: '#045D5E' },
    { id: 'cons2', group: 'Sales Team', groupColor: c.primary, name: 'Alice Wong', title: 'Consultant', role: 'consultant', online: false, avatarColor: '#FC7300' },
    { id: 'cons3', group: 'Sales Team', groupColor: c.primary, name: 'Bob Johnson', title: 'Consultant', role: 'consultant', online: true, avatarColor: '#3b82f6' },
    { id: 'cons4', group: 'Sales Team', groupColor: c.primary, name: 'Carol Davis', title: 'Consultant', role: 'consultant', online: false, avatarColor: '#8b5cf6' },
  ];

  const [courses, setCourses] = useState([
    { id: 1, title: 'Getting Started with UAPP Portal', category: 'Onboarding', duration: '2h', lessons: 8, progress: 100, mandatory: true, rating: 4.8, enrolled: 245, addedDate: '2024-01-05', outcomes: ['Navigate the portal confidently', 'Manage your profile', 'Submit applications without errors'] },
    { id: 2, title: 'Student Application Processing', category: 'Operations', duration: '3h', lessons: 12, progress: 65, mandatory: true, rating: 4.6, enrolled: 189, addedDate: '2024-01-08', outcomes: ['Process student applications efficiently', 'Handle complex document scenarios', 'Resolve common issues'] },
    { id: 3, title: 'Compliance & Legal Requirements', category: 'Compliance', duration: '1.5h', lessons: 6, progress: 40, mandatory: true, rating: 4.9, enrolled: 312, addedDate: '2024-01-10', outcomes: ['Understand UK education law', 'Apply GDPR principles', 'Maintain audit-ready records'] },
    { id: 4, title: 'Team Management Fundamentals', category: 'Leadership', duration: '4h', lessons: 15, progress: 0, mandatory: false, rating: 4.7, enrolled: 78, addedDate: '2024-02-01', outcomes: ['Lead high-performing teams', 'Coach effectively', 'Resolve conflict'] },
    { id: 5, title: 'Analytics & Reporting', category: 'Analytics', duration: '2.5h', lessons: 10, progress: 0, mandatory: false, rating: 4.5, enrolled: 134, addedDate: '2024-02-04', outcomes: ['Read core dashboards', 'Build custom reports', 'Communicate insights'] },
    { id: 6, title: 'Advanced Communication Skills', category: 'Skills', duration: '2h', lessons: 8, progress: 20, mandatory: false, rating: 4.4, enrolled: 156, addedDate: '2024-02-10', outcomes: ['Run effective 1:1s', 'Give precise feedback', 'Negotiate outcomes'] },
    { id: 7, title: 'English First Part', category: 'English', duration: '3h', lessons: 10, progress: 0, mandatory: false, rating: 4.6, enrolled: 320, addedDate: '2024-03-01', outcomes: ['Build conversational fluency', 'Master common grammar patterns'] },
    { id: 8, title: 'English 2nd Part', category: 'English', duration: '3.5h', lessons: 12, progress: 0, mandatory: false, rating: 4.5, enrolled: 275, addedDate: '2024-03-05', outcomes: ['Advance to professional fluency', 'Write clear business emails'] },
    { id: 9, title: 'The Complete Punctuation Course', category: 'English', duration: '2h', lessons: 8, progress: 0, mandatory: false, rating: 4.7, enrolled: 198, addedDate: '2024-03-10', outcomes: ['Master every common punctuation rule'] },
    { id: 10, title: 'Fundamentals of Algebra', category: 'Math', duration: '4h', lessons: 14, progress: 0, mandatory: false, rating: 4.8, enrolled: 412, addedDate: '2024-03-12', outcomes: ['Solve linear and quadratic equations'] },
    { id: 11, title: 'Linear Algebra Crash Course', category: 'Math', duration: '3h', lessons: 10, progress: 0, mandatory: false, rating: 4.6, enrolled: 287, addedDate: '2024-03-15', outcomes: ['Work with vectors and matrices'] },
    { id: 12, title: 'Algebra Trigonometry', category: 'Math', duration: '3.5h', lessons: 12, progress: 0, mandatory: false, rating: 4.5, enrolled: 234, addedDate: '2024-03-18', outcomes: ['Apply trigonometric identities'] },
    { id: 13, title: 'The Vocabulary of Science', category: 'Science', duration: '2h', lessons: 7, progress: 0, mandatory: false, rating: 4.4, enrolled: 167, addedDate: '2024-04-01', outcomes: ['Expand technical vocabulary'] },
    { id: 14, title: 'Microsoft Word for Beginners', category: 'Skills', duration: '2.5h', lessons: 9, progress: 0, mandatory: false, rating: 4.7, enrolled: 523, addedDate: '2024-04-05', outcomes: ['Format professional documents'] },
    { id: 15, title: 'Microsoft Excel for Beginners', category: 'Skills', duration: '3h', lessons: 11, progress: 0, mandatory: false, rating: 4.8, enrolled: 614, addedDate: '2024-04-08', outcomes: ['Build formulas and pivot tables'] },
    { id: 16, title: 'Microsoft PowerPoint for Beginners', category: 'Skills', duration: '2h', lessons: 8, progress: 0, mandatory: false, rating: 4.6, enrolled: 489, addedDate: '2024-04-10', outcomes: ['Create compelling presentations'] },
    { id: 17, title: 'C Programming for Beginners', category: 'Programming', duration: '5h', lessons: 18, progress: 0, mandatory: false, rating: 4.7, enrolled: 356, addedDate: '2024-04-15', outcomes: ['Read and write basic C programs'] },
    { id: 18, title: 'Python Programming for Beginners', category: 'Programming', duration: '6h', lessons: 20, progress: 0, mandatory: false, rating: 4.9, enrolled: 731, addedDate: '2024-04-20', outcomes: ['Build small Python scripts and apps'] },
    { id: 19, title: 'Java Programming for Complete Beginners', category: 'Programming', duration: '7h', lessons: 24, progress: 0, mandatory: false, rating: 4.8, enrolled: 498, addedDate: '2024-04-25', outcomes: ['Understand object-oriented basics'] },
    { id: 20, title: 'Communication Skills for Beginners', category: 'Soft Skills', duration: '2.5h', lessons: 9, progress: 0, mandatory: false, rating: 4.6, enrolled: 445, addedDate: '2024-05-01', outcomes: ['Communicate clearly at work'] },
    { id: 21, title: 'Public Speaking: Be a Professional Speaker', category: 'Soft Skills', duration: '3h', lessons: 11, progress: 0, mandatory: false, rating: 4.8, enrolled: 378, addedDate: '2024-05-05', outcomes: ['Present with confidence'] },
  ]);

  const tutorials = [
    { id: 1, title: 'Adding a Student', category: 'Students', duration: '5 min', views: 1245, difficulty: 'Beginner' },
    { id: 2, title: 'Submitting Applications in UAPP', category: 'Applications', duration: '8 min', views: 892, difficulty: 'Intermediate' },
    { id: 3, title: 'Uploading Documents', category: 'Documents', duration: '4 min', views: 756, difficulty: 'Beginner' },
    { id: 4, title: 'Live Intake', category: 'Operations', duration: '7 min', views: 634, difficulty: 'Advanced' },
    { id: 5, title: 'Adding a Consultant', category: 'Team', duration: '6 min', views: 523, difficulty: 'Intermediate' },
    { id: 6, title: 'Adding a Referrer', category: 'Partners', duration: '5 min', views: 412, difficulty: 'Beginner' },
    { id: 7, title: 'Adding an Associate', category: 'Partners', duration: '5 min', views: 389, difficulty: 'Beginner' },
  ];

  const [submissions, setSubmissions] = useState([
    { id: 1, title: 'Updated CV Template', type: 'Document', date: 'Jan 20, 2024', status: 'pending', submittedBy: 'Raj Ahmed', notes: '' },
    { id: 2, title: 'Marketing Guidelines', type: 'Document', date: 'Jan 19, 2024', status: 'review', submittedBy: 'Simona', notes: '' },
    { id: 3, title: 'Partner University List', type: 'Spreadsheet', date: 'Jan 18, 2024', status: 'approved', submittedBy: 'Raj Ahmed', notes: '' },
    { id: 4, title: 'Training Video - Intake', type: 'Video', date: 'Jan 17, 2024', status: 'published', submittedBy: 'Md Shamim', notes: '' },
    { id: 5, title: 'Commission Structure Doc', type: 'Document', date: 'Jan 16, 2024', status: 'rejected', submittedBy: 'Simona', notes: 'Outdated structure — please reference 2024 model' },
  ]);

  const teamMembers = [
    { id: 1, name: 'Simona', email: 'simona@uapp.com', role: 'Consultant', progress: 85, completed: 4, total: 5, lastActive: '2 hours ago', status: 'online' },
    { id: 2, name: 'Alice Wong', email: 'alice@uapp.com', role: 'Consultant', progress: 72, completed: 3, total: 5, lastActive: '1 day ago', status: 'offline' },
    { id: 3, name: 'Bob Johnson', email: 'bob@uapp.com', role: 'Consultant', progress: 90, completed: 5, total: 5, lastActive: '30 min ago', status: 'online' },
    { id: 4, name: 'Carol Davis', email: 'carol@uapp.com', role: 'Consultant', progress: 60, completed: 2, total: 5, lastActive: '3 hours ago', status: 'away' },
    { id: 5, name: 'David Lee', email: 'david@uapp.com', role: 'Consultant', progress: 45, completed: 2, total: 5, lastActive: '2 days ago', status: 'offline' },
  ];

  const auditLogs = [
    { id: 1, action: 'Document Published', user: 'Md Shamim', target: 'CV Template', time: 'Jan 20, 3:30 PM' },
    { id: 2, action: 'Content Approved', user: 'Md Shamim', target: 'Marketing Guide', time: 'Jan 20, 2:15 PM' },
    { id: 3, action: 'User Created', user: 'Md Shamim', target: 'New Consultant', time: 'Jan 20, 10:00 AM' },
    { id: 4, action: 'Course Published', user: 'Md Shamim', target: 'Sales Course', time: 'Jan 19, 4:45 PM' },
    { id: 5, action: 'Document Rejected', user: 'Md Shamim', target: 'Old Policy', time: 'Jan 19, 2:30 PM' },
  ];

  const knowledgeBaseCategories = [
    { id: 1, name: 'Getting Started', icon: Rocket, articles: 12, color: c.primary },
    { id: 2, name: 'Policies & SOPs', icon: Shield, articles: 24, color: c.secondary },
    { id: 3, name: 'Technical Guides', icon: Settings, articles: 18, color: c.info },
    { id: 4, name: 'FAQs', icon: HelpCircle, articles: 45, color: c.success },
    { id: 5, name: 'Best Practices', icon: Lightbulb, articles: 15, color: '#8b5cf6' },
    { id: 6, name: 'Troubleshooting', icon: AlertCircle, articles: 20, color: c.warning },
  ];

  const knowledgeBaseArticles = [
    { id: 1, title: 'Overview of Application Process', category: 'Getting Started', views: 2341, helpful: 95, updated: 'Jan 15, 2024' },
    { id: 2, title: 'Tracking Applications', category: 'Getting Started', views: 1876, helpful: 92, updated: 'Jan 12, 2024' },
    { id: 3, title: 'Admission Process', category: 'Getting Started', views: 1654, helpful: 89, updated: 'Jan 10, 2024' },
    { id: 4, title: 'UAPP Legal Compliance Guidelines', category: 'Policies & SOPs', views: 1456, helpful: 94, updated: 'Jan 8, 2024' },
    { id: 5, title: 'Common Application Errors & Fixes', category: 'FAQs', views: 3210, helpful: 91, updated: 'Jan 5, 2024' },
    { id: 6, title: 'Portal Access Issues', category: 'Troubleshooting', views: 987, helpful: 85, updated: 'Jan 3, 2024' },
  ];

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'New Training Module Available', content: 'We have launched a new compliance training module. All consultants must complete it by end of month.', priority: 'high', author: 'Md Shamim', date: 'Jan 20, 2024', read: false },
    { id: 2, title: 'System Maintenance Notice', content: 'Scheduled maintenance on Saturday 10 PM - 2 AM. Platform will be temporarily unavailable.', priority: 'medium', author: 'IT Team', date: 'Jan 18, 2024', read: false },
    { id: 3, title: 'Q1 Goals Announced', content: 'Please review the Q1 targets and objectives in the knowledge base. Team meeting scheduled for Monday.', priority: 'normal', author: 'Management', date: 'Jan 15, 2024', read: true },
    { id: 4, title: 'New Partner Universities Added', content: 'We have partnered with 5 new universities in the UK. Check the updated list in resources.', priority: 'normal', author: 'Partnerships', date: 'Jan 12, 2024', read: true },
    { id: 5, title: 'Holiday Schedule Update', content: 'Office will be closed on Jan 26 for Republic Day. Plan your tasks accordingly.', priority: 'low', author: 'HR Team', date: 'Jan 10, 2024', read: true },
  ]);

  const [allUsers, setAllUsers] = useState([
    { id: 1, name: 'Simona', email: 'simona@uapp.com', role: 'consultant', status: 'active', joined: 'Oct 2023', lastActive: '2 hours ago' },
    { id: 2, name: 'Raj Ahmed', email: 'raj@uapp.com', role: 'manager', status: 'active', joined: 'Aug 2023', lastActive: '1 hour ago' },
    { id: 3, name: 'Md Shamim', email: 'shamim@uapp.com', role: 'admin', status: 'active', joined: 'Jan 2023', lastActive: 'Just now' },
    { id: 4, name: 'Alice Wong', email: 'alice@uapp.com', role: 'consultant', status: 'active', joined: 'Nov 2023', lastActive: '1 day ago' },
    { id: 5, name: 'Bob Johnson', email: 'bob@uapp.com', role: 'consultant', status: 'active', joined: 'Sep 2023', lastActive: '30 min ago' },
    { id: 6, name: 'Carol Davis', email: 'carol@uapp.com', role: 'consultant', status: 'inactive', joined: 'Dec 2023', lastActive: '1 week ago' },
    { id: 7, name: 'David Lee', email: 'david@uapp.com', role: 'consultant', status: 'active', joined: 'Jan 2024', lastActive: '2 days ago' },
    { id: 8, name: 'Emma Wilson', email: 'emma@uapp.com', role: 'manager', status: 'active', joined: 'Jul 2023', lastActive: '5 hours ago' },
  ]);

  const [contentItems, setContentItems] = useState([
    { id: 1, title: 'Getting Started with UAPP Portal', type: 'Course', status: 'published', author: 'Md Shamim', created: 'Jan 5, 2024', views: 2456 },
    { id: 2, title: 'Student Application Processing', type: 'Course', status: 'published', author: 'Md Shamim', created: 'Jan 8, 2024', views: 1890 },
    { id: 3, title: 'How to Add a New Student', type: 'Tutorial', status: 'published', author: 'Raj Ahmed', created: 'Jan 10, 2024', views: 1245 },
    { id: 4, title: 'CRM Integration Guide', type: 'Article', status: 'draft', author: 'Md Shamim', created: 'Jan 15, 2024', views: 0 },
    { id: 5, title: 'Advanced Sales Techniques', type: 'Course', status: 'review', author: 'Raj Ahmed', created: 'Jan 18, 2024', views: 0 },
    { id: 6, title: 'Compliance Checklist', type: 'Document', status: 'published', author: 'Md Shamim', created: 'Jan 12, 2024', views: 876 },
  ]);

  const [courseReviews, setCourseReviews] = useState([
    { courseId: 1, userId: 'admin', userName: 'Md Shamim', userRole: 'Administrator', rating: 5, feedback: 'Excellent intro to the UAPP portal. Covers everything a new joiner needs.', date: 'Jan 10, 2024', helpful: 12 },
    { courseId: 1, userId: 'manager', userName: 'Raj Ahmed', userRole: 'Admission Manager', rating: 5, feedback: 'Very well structured. The sections on document uploads were especially helpful.', date: 'Jan 12, 2024', helpful: 8 },
    { courseId: 2, userId: 'admin', userName: 'Md Shamim', userRole: 'Administrator', rating: 4, feedback: 'Good course overall, though some modules could be shorter.', date: 'Jan 15, 2024', helpful: 4 },
  ]);

  const [permSets, setPermSets] = useState(initialPermSets);
  const [userPermOverrides, setUserPermOverrides] = useState({});
  const [editPermUser, setEditPermUser] = useState(null);

  const [certificates] = useState([
    { id: 'CERT-2026-001', courseId: 1,  courseName: 'Getting Started with UAPP Portal',           userName: 'Simona',     userRole: 'Consultant',        issuedDate: '2026-01-10', credentialId: 'UAPP-GS-001-2026', category: 'Onboarding'  },
    { id: 'CERT-2026-002', courseId: 1,  courseName: 'Getting Started with UAPP Portal',           userName: 'Raj Ahmed',  userRole: 'Admission Manager', issuedDate: '2026-01-18', credentialId: 'UAPP-GS-002-2026', category: 'Onboarding'  },
    { id: 'CERT-2026-003', courseId: 1,  courseName: 'Getting Started with UAPP Portal',           userName: 'Bob Johnson',userRole: 'Consultant',        issuedDate: '2026-01-25', credentialId: 'UAPP-GS-003-2026', category: 'Onboarding'  },
    { id: 'CERT-2026-004', courseId: 3,  courseName: 'Compliance & Legal Requirements',            userName: 'Simona',     userRole: 'Consultant',        issuedDate: '2026-02-14', credentialId: 'UAPP-CL-001-2026', category: 'Compliance'  },
    { id: 'CERT-2026-005', courseId: 3,  courseName: 'Compliance & Legal Requirements',            userName: 'Alice Wong', userRole: 'Consultant',        issuedDate: '2026-02-20', credentialId: 'UAPP-CL-002-2026', category: 'Compliance'  },
    { id: 'CERT-2026-006', courseId: 3,  courseName: 'Compliance & Legal Requirements',            userName: 'Bob Johnson',userRole: 'Consultant',        issuedDate: '2026-03-03', credentialId: 'UAPP-CL-003-2026', category: 'Compliance'  },
    { id: 'CERT-2026-007', courseId: 2,  courseName: 'Student Application Processing',             userName: 'Raj Ahmed',  userRole: 'Admission Manager', issuedDate: '2026-03-15', credentialId: 'UAPP-SA-001-2026', category: 'Operations'  },
    { id: 'CERT-2026-008', courseId: 18, courseName: 'Python Programming for Beginners',           userName: 'Simona',     userRole: 'Consultant',        issuedDate: '2026-04-02', credentialId: 'UAPP-PY-001-2026', category: 'Programming' },
    { id: 'CERT-2026-009', courseId: 15, courseName: 'Microsoft Excel for Beginners',              userName: 'Alice Wong', userRole: 'Consultant',        issuedDate: '2026-04-18', credentialId: 'UAPP-EX-001-2026', category: 'Skills'      },
    { id: 'CERT-2026-010', courseId: 21, courseName: 'Public Speaking: Be a Professional Speaker', userName: 'Bob Johnson',userRole: 'Consultant',        issuedDate: '2026-05-05', credentialId: 'UAPP-PS-001-2026', category: 'Soft Skills' },
    { id: 'CERT-2026-011', courseId: 14, courseName: 'Microsoft Word for Beginners',               userName: 'Carol Davis',userRole: 'Consultant',        issuedDate: '2026-05-20', credentialId: 'UAPP-WD-001-2026', category: 'Skills'      },
    { id: 'CERT-2026-012', courseId: 10, courseName: 'Fundamentals of Algebra',                    userName: 'David Lee',  userRole: 'Consultant',        issuedDate: '2026-06-01', credentialId: 'UAPP-AL-001-2026', category: 'Math'        },
  ]);

  /* ════ HELPERS ════ */
  const getCourseRating = (courseId) => {
    const reviews = courseReviews.filter(r => r.courseId === courseId);
    if (!reviews.length) return null;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
  };
  const hasReviewed = (courseId) => courseReviews.some(r => r.courseId === courseId && r.userId === currentUser?.role);
  const initials = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const daysUntil = (dateStr) => {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.floor((target - now) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const categoryMeta = {
    Onboarding:   { color: '#045D5E', icon: Rocket },
    Operations:   { color: '#0891b2', icon: Settings },
    Compliance:   { color: '#7c3aed', icon: Shield },
    Leadership:   { color: '#b45309', icon: Star },
    Analytics:    { color: '#0369a1', icon: BarChart3 },
    Skills:       { color: '#0f766e', icon: Lightbulb },
    English:      { color: '#1d4ed8', icon: BookOpen },
    Math:         { color: '#7e22ce', icon: Hash },
    Science:      { color: '#065f46', icon: Lightbulb },
    Programming:  { color: '#FC7300', icon: FileText },
    'Soft Skills':{ color: '#be185d', icon: Users },
  };
  const getCatMeta = (cat) => categoryMeta[cat] || { color: c.primarySolid, icon: PlayCircle };

  /* ════ STATUS CONFIG (icon + label, never colour-only) ════ */
  const statusConfig = {
    pending:   { label: 'Pending',       icon: Clock,        color: c.warningText,  bg: c.warningLight },
    review:    { label: 'Under Review',  icon: Eye,          color: c.infoText,     bg: c.infoLight },
    approved:  { label: 'Approved',      icon: CheckCircle,  color: c.successText,  bg: c.successLight },
    published: { label: 'Published',     icon: CheckCircle,  color: c.successText,  bg: c.successLight },
    rejected:  { label: 'Rejected',      icon: X,            color: c.dangerText,   bg: c.dangerLight },
    draft:     { label: 'Draft',         icon: FileText,     color: c.textSubtle,   bg: c.bgSubtle },
    scheduled: { label: 'Scheduled',     icon: Calendar,     color: c.infoText,     bg: c.infoLight },
  };

  /* ════ REUSABLE PRIMITIVES ════ */

  const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, iconRight, onClick, block, disabled, type = 'button', ariaLabel }) => {
    const sizes = {
      sm: { pad: '6px 12px',  fs: 13, gap: 6, ih: 16 },
      md: { pad: '9px 16px',  fs: 14, gap: 8, ih: 16 },
      lg: { pad: '12px 22px', fs: 15, gap: 10, ih: 18 },
    }[size];
    const variants = {
      primary:   { bg: c.primarySolid, color: '#fff', border: 'transparent', hover: c.primaryHover },
      secondary: { bg: c.secondary,    color: '#fff', border: 'transparent', hover: c.secondaryHover },
      outline:   { bg: 'transparent',  color: c.text, border: c.border,      hover: c.surfaceHover },
      ghost:     { bg: 'transparent',  color: c.textMuted, border: 'transparent', hover: c.surfaceHover },
      danger:    { bg: c.danger,       color: '#fff', border: 'transparent', hover: '#dc2626' },
      success:   { bg: c.success,      color: '#fff', border: 'transparent', hover: '#059669' },
    }[variant];
    const [hover, setHover] = useState(false);
    return (
      <button
        type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: sizes.gap, padding: sizes.pad,
          background: disabled ? c.border : (hover ? variants.hover : variants.bg),
          color: disabled ? c.textSubtle : variants.color,
          border: `1px solid ${disabled ? c.border : variants.border}`,
          borderRadius: tokens.radius.md,
          fontSize: sizes.fs, fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: block ? '100%' : 'auto',
          transition: tokens.transition,
          outline: 'none',
        }}
        onFocus={e => e.currentTarget.style.boxShadow = tokens.ring}
        onBlur={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {Icon && <Icon size={sizes.ih} />}
        {children}
        {iconRight && React.createElement(iconRight, { size: sizes.ih })}
      </button>
    );
  };

  const IconButton = ({ icon: Icon, onClick, ariaLabel, active, badge, size = 'md', variant = 'default' }) => {
    const sizes = { sm: 32, md: 40, lg: 44 };
    const [hover, setHover] = useState(false);
    const px = sizes[size];
    const variants = {
      default: { bg: active ? c.primaryLight : c.surface, color: active ? c.primarySolid : c.textMuted, border: c.border },
      ghost:   { bg: hover ? c.surfaceHover : 'transparent', color: c.textMuted, border: 'transparent' },
    };
    const v = variants[variant];
    return (
      <button
        onClick={onClick} aria-label={ariaLabel}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          width: px, height: px, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: hover && variant === 'default' ? c.surfaceHover : v.bg,
          color: v.color, border: `1px solid ${v.border}`,
          borderRadius: tokens.radius.md, cursor: 'pointer', position: 'relative',
          transition: tokens.transition, outline: 'none',
        }}
        onFocus={e => e.currentTarget.style.boxShadow = tokens.ring}
        onBlur={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <Icon size={size === 'sm' ? 16 : 18} />
        {badge != null && (
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
            padding: '0 5px', borderRadius: 9, background: c.secondary, color: '#fff',
            fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${c.surface}`,
          }}>{badge}</span>
        )}
      </button>
    );
  };

  const Card = ({ children, style = {}, padded = true, hover: hoverable, onClick, ariaLabel }) => {
    const [hover, setHover] = useState(false);
    return (
      <div
        onClick={onClick} role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined} aria-label={ariaLabel}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          background: c.surface,
          borderRadius: tokens.radius.lg,
          padding: padded ? tokens.space[6] : 0,
          border: `1px solid ${c.border}`,
          boxShadow: hoverable && hover ? tokens.shadow.md : tokens.shadow.xs,
          transform: hoverable && hover ? 'translateY(-2px)' : 'none',
          transition: tokens.transition,
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
      >{children}</div>
    );
  };

  const Badge = ({ children, variant = 'neutral', size = 'md' }) => {
    const variants = {
      neutral: { bg: c.bgSubtle,      color: c.textMuted },
      primary: { bg: c.primaryLight,  color: c.primarySolid },
      success: { bg: c.successLight,  color: c.successText },
      warning: { bg: c.warningLight,  color: c.warningText },
      danger:  { bg: c.dangerLight,   color: c.dangerText },
      info:    { bg: c.infoLight,     color: c.infoText },
    };
    const v = variants[variant] || variants.neutral;
    const sizes = { sm: { pad: '2px 8px', fs: 10 }, md: { pad: '3px 10px', fs: 11 } };
    const s = sizes[size];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: s.pad,
        background: v.bg, color: v.color, borderRadius: tokens.radius.full,
        fontSize: s.fs, fontWeight: 600, letterSpacing: 0.2,
      }}>{children}</span>
    );
  };

  const StatusPill = ({ status, size = 'md' }) => {
    const cfg = statusConfig[status] || statusConfig.draft;
    const Icon = cfg.icon;
    const sizes = { sm: { pad: '2px 8px', fs: 10, ih: 11 }, md: { pad: '4px 10px', fs: 11, ih: 12 } };
    const s = sizes[size];
    return (
      <span role="status" style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, padding: s.pad,
        background: cfg.bg, color: cfg.color, borderRadius: tokens.radius.full,
        fontSize: s.fs, fontWeight: 700, letterSpacing: 0.3,
      }}>
        <Icon size={s.ih} aria-hidden="true" />
        {cfg.label}
      </span>
    );
  };

  const Avatar = ({ name, size = 40, color, online }) => {
    const inits = initials(name || '?');
    return (
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: color || `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
          color: '#fff', fontWeight: 700, fontSize: size / 2.8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{inits}</div>
        {online != null && (
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: size / 4, height: size / 4, borderRadius: '50%',
            background: online ? c.success : c.textSubtle,
            border: `2px solid ${c.surface}`,
          }} />
        )}
      </div>
    );
  };

  const ProgressBar = ({ value, color: barColor, height = 6, showLabel }) => (
    <div>
      <div style={{ height, background: c.bgSubtle, borderRadius: tokens.radius.full, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(value, 100)}%`,
          background: barColor || (value === 100 ? c.success : c.primarySolid),
          borderRadius: tokens.radius.full, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      {showLabel && (
        <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 4, fontWeight: 600 }}>
          {value === 100 ? 'Complete' : `${value}% complete`}
        </div>
      )}
    </div>
  );

  const Input = ({ icon: Icon, error, type = 'text', ...rest }) => {
    const [focus, setFocus] = useState(false);
    return (
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: c.surface,
          border: `1px solid ${error ? c.danger : focus ? c.primarySolid : c.border}`,
          borderRadius: tokens.radius.md, transition: tokens.transition,
          boxShadow: focus ? tokens.ring : 'none',
        }}>
          {Icon && <Icon size={16} color={c.textSubtle} />}
          <input
            {...rest} type={type}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, color: c.text, fontFamily: 'inherit' }}
          />
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: c.danger, marginTop: 4 }}>
            <AlertCircle size={12} /> {error}
          </div>
        )}
      </div>
    );
  };

  const Textarea = ({ error, rows = 4, ...rest }) => {
    const [focus, setFocus] = useState(false);
    return (
      <div>
        <textarea
          {...rest} rows={rows}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: '100%', padding: 12, fontSize: 14, color: c.text,
            background: c.surface, border: `1px solid ${error ? c.danger : focus ? c.primarySolid : c.border}`,
            borderRadius: tokens.radius.md, outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', boxSizing: 'border-box',
            boxShadow: focus ? tokens.ring : 'none', transition: tokens.transition,
          }}
        />
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: c.danger, marginTop: 4 }}>
            <AlertCircle size={12} /> {error}
          </div>
        )}
      </div>
    );
  };

  const Select = ({ children, ...rest }) => {
    const [focus, setFocus] = useState(false);
    return (
      <select
        {...rest}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '10px 14px', fontSize: 14, color: c.text,
          background: c.surface, border: `1px solid ${focus ? c.primarySolid : c.border}`,
          borderRadius: tokens.radius.md, outline: 'none', cursor: 'pointer',
          fontFamily: 'inherit', boxShadow: focus ? tokens.ring : 'none',
          transition: tokens.transition,
        }}
      >{children}</select>
    );
  };

  const Toggle = ({ checked, onChange, label, description }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${c.border}`, gap: 16 }}>
      <div>
        <div style={{ fontWeight: 600, color: c.text, marginBottom: 2 }}>{label}</div>
        {description && <div style={{ fontSize: 13, color: c.textSubtle }}>{description}</div>}
      </div>
      <button
        role="switch" aria-checked={checked} aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
          background: checked ? c.primarySolid : c.borderStrong, transition: tokens.transition, flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: tokens.shadow.sm,
        }} />
      </button>
    </div>
  );

  const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
    <div style={{ textAlign: 'center', padding: `${tokens.space[8]}px ${tokens.space[5]}px` }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: c.bgSubtle, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.space[4] }}>
        <Icon size={26} color={c.textSubtle} />
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>{title}</h3>
      {description && <p style={{ margin: '6px 0 16px', fontSize: 14, color: c.textSubtle, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>}
      {action}
    </div>
  );

  const Skeleton = ({ width = '100%', height = 16, radius = 6 }) => (
    <div style={{
      width, height, borderRadius: radius,
      background: `linear-gradient(90deg, ${c.bgSubtle} 0%, ${c.border} 50%, ${c.bgSubtle} 100%)`,
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite',
    }} />
  );

  /* Modal with focus trap + ESC handler */
  const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'md', headerAccent }) => {
    const modalRef = useRef(null);
    const sizes = { sm: 420, md: 560, lg: 720, xl: 900 };

    useEffect(() => {
      if (!open) return;
      const previousActive = document.activeElement;
      const onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); onClose && onClose(); }
        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusables.length === 0) return;
          const first = focusables[0], last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener('keydown', onKey);
      const firstFocusable = modalRef.current?.querySelector('button, [href], input, select, textarea');
      setTimeout(() => firstFocusable?.focus(), 10);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
        previousActive && previousActive.focus && previousActive.focus();
      };
    }, [open, onClose]);

    if (!open) return null;
    const mobileSheet = isMobile;
    return (
      <>
        <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, backdropFilter: 'blur(2px)' }} />
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef}
          className={mobileSheet ? 'modal-sheet' : ''}
          style={mobileSheet ? {
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: c.surface, borderRadius: '20px 20px 0 0',
            width: '100%', maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: tokens.shadow['2xl'], zIndex: 1001, overflow: 'hidden',
          } : {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: c.surface, borderRadius: tokens.radius.xl,
            width: 'calc(100% - 32px)', maxWidth: sizes[size], maxHeight: 'calc(100vh - 64px)',
            display: 'flex', flexDirection: 'column',
            boxShadow: tokens.shadow['2xl'], zIndex: 1001, overflow: 'hidden',
          }}>
          {mobileSheet && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: c.borderStrong, opacity: 0.5 }} />
            </div>
          )}
          {(title || headerAccent) && (
            <div style={{
              padding: mobileSheet ? '12px 20px 14px' : '20px 24px 16px',
              borderBottom: `1px solid ${c.border}`,
              background: headerAccent ? `linear-gradient(135deg, ${c.primarySolid} 0%, ${c.primaryHover} 100%)` : 'transparent',
              color: headerAccent ? '#fff' : c.text,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <h2 id="modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: headerAccent ? '#fff' : c.text }}>{title}</h2>
                  {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: headerAccent ? 'rgba(255,255,255,0.85)' : c.textSubtle }}>{subtitle}</p>}
                </div>
                <button onClick={onClose} aria-label="Close dialog" style={{
                  width: 32, height: 32, border: 'none', cursor: 'pointer',
                  background: headerAccent ? 'rgba(255,255,255,0.15)' : c.bgSubtle,
                  color: headerAccent ? '#fff' : c.textMuted,
                  borderRadius: tokens.radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
          {footer && <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.border}`, background: c.bgSubtle, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
        </div>
      </>
    );
  };

  /* Tabs */
  const Tabs = ({ tabs, value, onChange }) => (
    <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${c.border}`, marginBottom: tokens.space[5], overflowX: 'auto' }}>
      {tabs.map(tab => {
        const active = value === tab.id;
        return (
          <button key={tab.id}
            role="tab" aria-selected={active}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: active ? c.primarySolid : c.textSubtle,
              borderBottom: `2px solid ${active ? c.primarySolid : 'transparent'}`,
              marginBottom: -1, transition: tokens.transition, whiteSpace: 'nowrap',
            }}>
            {tab.label}
            {tab.count != null && (
              <span style={{ marginLeft: 8, padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: active ? c.primaryLight : c.bgSubtle, color: active ? c.primarySolid : c.textSubtle }}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  /* StatCard */
  const StatCard = ({ label, value, icon: Icon, trend, color = c.primarySolid, hint }) => (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: tokens.radius.md, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: c.textSubtle, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.text, lineHeight: 1.15, marginTop: 2 }}>{value}</div>
          {hint && <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 2 }}>{hint}</div>}
          {trend != null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 4, color: trend >= 0 ? c.successText : c.dangerText, fontWeight: 600 }}>
              <TrendingUp size={12} /> {trend >= 0 ? '+' : ''}{trend}% this month
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  /* PageHeader */
  const PageHeader = ({ title, subtitle, children, breadcrumb }) => (
    <div style={{ marginBottom: tokens.space[6] }}>
      {breadcrumb && (
        <button onClick={breadcrumb.onClick}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0', border: 'none', background: 'none', cursor: 'pointer', color: c.primarySolid, fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
          <ChevronLeft size={16} /> {breadcrumb.label}
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? 22 : 26, fontWeight: 800, color: c.text, letterSpacing: -0.4 }}>{title}</h1>
          {subtitle && <p style={{ margin: 0, color: c.textSubtle, fontSize: 14 }}>{subtitle}</p>}
        </div>
        {children && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>}
      </div>
    </div>
  );

  /* StarRating */
  const StarRating = ({ value, max = 5, size = 14 }) => (
    <div style={{ display: 'inline-flex', gap: 2 }} aria-label={`Rating ${value} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={size} color={c.warning} fill={i < Math.floor(value) ? c.warning : 'none'} strokeWidth={1.5} style={{ opacity: i < value ? 1 : 0.3 }} />
      ))}
    </div>
  );

  /* Grade colour helper for certificates */
  const gradeColor = (g) => ({
    Distinction: { bg: c.warningLight, color: c.warningText, border: c.warning },
    Merit:       { bg: c.infoLight,    color: c.infoText,    border: c.info },
    Pass:        { bg: c.successLight, color: c.successText, border: c.success },
  }[g] || { bg: c.bgSubtle, color: c.textMuted, border: c.border });

  /* ════════════════════════════════════════════════════════════════════
     LAYOUT — SIDEBAR
     ════════════════════════════════════════════════════════════════════ */
  const navItems = useMemo(() => {
    const items = [{ icon: LayoutDashboard, label: 'Home', id: 'dashboard' }];
    if (!canApprove) items.push({ icon: Compass, label: 'My Learning', id: 'my-learning' });
    items.push({ icon: PlayCircle, label: 'Course Catalog', id: 'courses' });
    items.push({ icon: Lightbulb, label: 'Tutorials', id: 'tutorials' });
    items.push({ icon: FolderOpen, label: 'Resources', id: 'resources' });
    items.push({ icon: Award, label: 'Certificates', id: 'certificates' });
    if (canUpload) {
      items.push({ section: 'Workspace' });
      items.push({ icon: Upload, label: 'Upload Document', id: 'upload' });
      items.push({ icon: FileCheck, label: 'My Submissions', id: 'submissions' });
    }
    if (canViewTeam) {
      items.push({ section: 'Team' });
      items.push({ icon: BarChart3, label: 'Team Progress', id: 'team-progress' });
      items.push({ icon: ClipboardList, label: 'Assign Training', id: 'assign' });
    }
    if (canApprove) {
      items.push({ section: 'Administration' });
      items.push({ icon: CheckCircle, label: 'Approval Queue', id: 'approvals' });
      items.push({ icon: Star, label: 'Course Reviews', id: 'course-reviews' });
      items.push({ icon: Grid, label: 'Content', id: 'content' });
      items.push({ icon: Settings, label: 'Settings', id: 'settings' });
    }
    return items;
  }, [currentUser?.role]);

  const pendingApprovalsCount = submissions.filter(s => s.status === 'pending' || s.status === 'review').length;
  const unreadAnnouncements = announcements.filter(a => !a.read).length;

  const Sidebar = () => {
    const sidebarWidth = collapsed ? 76 : 252;
    const drawerOpen = isMobile ? mobileNavOpen : true;

    return (
      <>
        {isMobile && mobileNavOpen && (
          <div onClick={() => setMobileNavOpen(false)} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 80 }} />
        )}
        <aside aria-label="Main navigation" style={{
          width: sidebarWidth, background: c.surface, borderRight: `1px solid ${c.border}`,
          height: '100vh', position: 'fixed', left: isMobile && !mobileNavOpen ? -sidebarWidth - 10 : 0, top: 0,
          display: 'flex', flexDirection: 'column', zIndex: 90,
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.2s',
          overflow: 'hidden',
        }}>
          {/* Brand row */}
          <div style={{ height: 64, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
            <UAPPLogo size={36} />
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 800, color: c.text, fontSize: 16, letterSpacing: -0.2 }}>UAPP Academy</div>
                <div style={{ fontSize: 10, color: c.textSubtle, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Knowledge Hub</div>
              </div>
            )}
          </div>

          <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
            {navItems.map((item, i) => {
              if (item.section) {
                return !collapsed && (
                  <div key={`s-${i}`} style={{ padding: '14px 10px 6px', fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: c.textSubtle, textTransform: 'uppercase' }}>
                    {item.section}
                  </div>
                );
              }
              const active = currentPage === item.id;
              const Icon = item.icon;
              const badge = item.id === 'approvals' ? pendingApprovalsCount : null;
              return (
                <button key={item.id}
                  onClick={() => { setCurrentPage(item.id); if (isMobile) setMobileNavOpen(false); }}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
                    width: '100%', padding: collapsed ? '10px' : '9px 12px',
                    border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
                    background: active ? c.primaryLight : 'transparent',
                    color: active ? c.primarySolid : c.textMuted,
                    fontSize: 13.5, fontWeight: active ? 600 : 500, textAlign: 'left',
                    marginBottom: 2, transition: tokens.transition, gap: 11,
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.surfaceHover; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  </span>
                  {!collapsed && badge > 0 && (
                    <span style={{ minWidth: 20, padding: '0 6px', height: 18, borderRadius: 9, background: c.danger, color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
                  )}
                  {collapsed && badge > 0 && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: c.danger }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer — collapse toggle (desktop only) */}
          {!isMobile && (
            <div style={{ padding: 10, borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
              <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{ width: '100%', padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: tokens.radius.md, color: c.textSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = c.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>Collapse</span></>}
              </button>
            </div>
          )}
        </aside>
      </>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     LAYOUT — HEADER
     ════════════════════════════════════════════════════════════════════ */

  /* Search results computed live */
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const courseHits = courses.filter(x => x.title.toLowerCase().includes(q) || x.category.toLowerCase().includes(q)).slice(0, 4);
    const tutorialHits = tutorials.filter(x => x.title.toLowerCase().includes(q)).slice(0, 3);
    const articleHits = knowledgeBaseArticles.filter(x => x.title.toLowerCase().includes(q)).slice(0, 3);
    const certHits = certificates.filter(x => x.courseName.toLowerCase().includes(q) || x.userName.toLowerCase().includes(q)).slice(0, 2);
    return { courseHits, tutorialHits, articleHits, certHits, total: courseHits.length + tutorialHits.length + articleHits.length + certHits.length };
  }, [searchQuery]);

  const Header = () => (
    <header style={{
      height: 64, background: c.surface, borderBottom: `1px solid ${c.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `0 ${isMobile ? 16 : 24}px`, position: 'sticky', top: 0, zIndex: 70,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {isMobile && (
          <IconButton icon={Menu} ariaLabel="Open menu" onClick={() => setMobileNavOpen(true)} variant="ghost" />
        )}
        {!isMobile && (
          <button
            onClick={() => setShowSearch(true)}
            aria-label="Open search"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', background: c.bgSubtle, border: `1px solid ${c.border}`,
              borderRadius: tokens.radius.md, color: c.textSubtle, cursor: 'pointer',
              minWidth: 280, fontSize: 13.5, fontWeight: 500,
            }}>
            <Search size={16} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search courses, tutorials, articles…</span>
            <kbd style={{
              padding: '2px 6px', background: c.surface, borderRadius: 4,
              fontSize: 11, fontFamily: 'monospace', color: c.textSubtle,
              border: `1px solid ${c.border}`,
            }}>⌘K</kbd>
          </button>
        )}
        {isMobile && (
          <div style={{ fontWeight: 800, fontSize: 16, color: c.text }}>UAPP Academy</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isMobile && <IconButton icon={Search} ariaLabel="Search" onClick={() => setShowSearch(true)} variant="ghost" />}

        <IconButton icon={isDark ? Sun : Moon}
          ariaLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setUserSettings({ ...userSettings, darkMode: !isDark })} />

        <div style={{ position: 'relative' }}>
          <IconButton icon={Bell} ariaLabel="Notifications"
            badge={unreadAnnouncements > 0 ? unreadAnnouncements : null}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            active={showNotifications} />
          {showNotifications && (
            <>
              <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
              <div role="dialog" aria-label="Notifications" style={{
                position: 'absolute', top: '110%', right: 0, width: isMobile ? 'calc(100vw - 32px)' : 380,
                maxWidth: 'calc(100vw - 32px)', background: c.surface, borderRadius: tokens.radius.lg,
                boxShadow: tokens.shadow.xl, border: `1px solid ${c.border}`, zIndex: 101, overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>Notifications</div>
                    <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 2 }}>{unreadAnnouncements} unread</div>
                  </div>
                  {unreadAnnouncements > 0 && (
                    <button onClick={() => setAnnouncements(prev => prev.map(a => ({ ...a, read: true })))}
                      style={{ border: 'none', background: 'none', color: c.primarySolid, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {announcements.length === 0 ? (
                    <EmptyState icon={Bell} title="No notifications" />
                  ) : announcements.map(a => (
                    <button key={a.id} onClick={() => { setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, read: true } : x)); setCurrentPage('dashboard'); setShowNotifications(false); }}
                      style={{ display: 'flex', gap: 12, padding: '12px 18px', width: '100%', border: 'none', background: a.read ? 'transparent' : c.primaryLight + '80', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${c.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = c.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = a.read ? 'transparent' : c.primaryLight + '80'}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.priority === 'high' ? c.danger : a.priority === 'medium' ? c.warning : c.primarySolid, marginTop: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: c.text, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {a.title}
                          {!a.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.secondary }} />}
                        </div>
                        <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 2, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.content}</div>
                        <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 4 }}>{a.author} • {a.date}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            aria-label="Account menu" aria-expanded={showProfileMenu}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '4px 10px 4px 4px', background: showProfileMenu ? c.primaryLight : 'transparent',
              border: `1px solid ${showProfileMenu ? c.primarySolid : c.border}`, borderRadius: tokens.radius.md,
              cursor: 'pointer', transition: tokens.transition,
            }}>
            <Avatar name={currentUser?.name} size={32} color={c.primarySolid} />
            {!isMobile && (
              <>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{currentUser?.name}</div>
                  <div style={{ fontSize: 11, color: c.textSubtle }}>{roleConfig[currentUser?.role]?.label}</div>
                </div>
                <ChevronDown size={14} color={c.textSubtle} />
              </>
            )}
          </button>
          {showProfileMenu && (
            <>
              <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
              <div role="menu" style={{
                position: 'absolute', top: '110%', right: 0, marginTop: 0,
                width: 260, background: c.surface, borderRadius: tokens.radius.lg,
                boxShadow: tokens.shadow.xl, border: `1px solid ${c.border}`, zIndex: 101, overflow: 'hidden',
              }}>
                <div style={{ padding: 16, background: c.bgSubtle, borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={currentUser?.name} size={44} color={c.primarySolid} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{currentUser?.name}</div>
                      <div style={{ fontSize: 12, color: c.textSubtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name?.toLowerCase().replace(' ', '.')}@uapp.com</div>
                      <Badge variant={currentUser?.role === 'admin' ? 'danger' : currentUser?.role === 'manager' ? 'info' : 'primary'} size="sm">{roleConfig[currentUser?.role]?.label}</Badge>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 6 }}>
                  {[
                    { icon: User, label: 'My Profile', onClick: () => { setCurrentPage('profile'); setShowProfileMenu(false); } },
                    { icon: Settings, label: 'Settings', onClick: () => { setCurrentPage('user-settings'); setShowProfileMenu(false); } },
                    { icon: Users, label: 'Switch User', onClick: () => { setShowProfileMenu(false); setShowUserSwitch(true); } },
                  ].map(item => (
                    <button key={item.label} role="menuitem" onClick={item.onClick}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: tokens.radius.sm, cursor: 'pointer', fontSize: 13, color: c.text, textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = c.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <item.icon size={16} color={c.textMuted} /> {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );

  /* ════════════════════════════════════════════════════════════════════
     PAGE — DASHBOARD (role-aware)
     ════════════════════════════════════════════════════════════════════ */
  const DashboardPage = () => {
    const isConsultant = currentUser?.role === 'consultant';
    const isManager = currentUser?.role === 'manager';
    const isAdmin = currentUser?.role === 'admin';
    const inProgress = courses.filter(x => x.progress > 0 && x.progress < 100);
    const completed = courses.filter(x => x.progress === 100);
    const continueCourse = inProgress[0];
    const heroPct = Math.round((completed.length / courses.length) * 100);
    const heroR = 26, heroCirc = 2 * Math.PI * heroR, heroDash = heroCirc * (heroPct / 100);

    /* Role-aware quick action set */
    const quickActions = useMemo(() => {
      if (isAdmin) return [
        { label: 'Review Queue', desc: `${pendingApprovalsCount} items waiting`, icon: CheckCircle, color: c.warning, onClick: () => setCurrentPage('approvals') },
        { label: 'Manage Content', desc: 'Edit and publish', icon: Grid, color: c.info, onClick: () => setCurrentPage('content') },
        { label: 'Team Progress', desc: 'View team analytics', icon: BarChart3, color: c.primarySolid, onClick: () => setCurrentPage('team-progress') },
        { label: 'Course Reviews', desc: 'See all feedback', icon: Star, color: c.secondary, onClick: () => setCurrentPage('course-reviews') },
      ];
      if (isManager) return [
        { label: 'Continue Learning', desc: continueCourse ? continueCourse.title : 'Browse catalog', icon: Play, color: c.primarySolid, onClick: () => setCurrentPage(continueCourse ? 'my-learning' : 'courses') },
        { label: 'Upload Document', desc: 'Submit for review', icon: Upload, color: c.secondary, onClick: () => setCurrentPage('upload') },
        { label: 'My Submissions', desc: 'Track status', icon: FileCheck, color: c.info, onClick: () => setCurrentPage('submissions') },
        { label: 'Knowledge Base', desc: 'Browse resources', icon: FolderOpen, color: c.primarySolid, onClick: () => setCurrentPage('resources') },
      ];
      return [
        { label: 'Resume Learning', desc: continueCourse ? continueCourse.title : 'Browse catalog', icon: Play, color: c.primarySolid, onClick: () => setCurrentPage(continueCourse ? 'my-learning' : 'courses') },
        { label: 'Browse Courses', desc: `${courses.length} available`, icon: PlayCircle, color: c.secondary, onClick: () => setCurrentPage('courses') },
        { label: 'My Certificates', desc: `${completed.length} earned`, icon: Award, color: c.warning, onClick: () => setCurrentPage('certificates') },
        { label: 'Resources', desc: 'Help & guides', icon: HelpCircle, color: c.info, onClick: () => setCurrentPage('resources') },
      ];
    }, [currentUser, pendingApprovalsCount, continueCourse, completed.length]);

    return (
      <div>
        {/* Welcome hero */}
        <div style={{
          background: `linear-gradient(135deg, ${c.primarySolid} 0%, #034849 100%)`,
          borderRadius: tokens.radius.xl, padding: isMobile ? 20 : 28,
          color: '#fff', marginBottom: tokens.space[6], position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -50, top: -50, width: 240, height: 240, borderRadius: '50%', background: 'rgba(252,115,0,0.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 40, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: isMobile ? -20 : 20, top: '50%', transform: 'translateY(-50%)', opacity: 0.06, pointerEvents: 'none' }}>
            <UAPPLogo size={isMobile ? 100 : 140} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, letterSpacing: -0.4 }}>
                Welcome back, {currentUser?.name?.split(' ')[0]}
              </h1>
              <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 14 }}>
                {isAdmin && `You have ${pendingApprovalsCount} item${pendingApprovalsCount === 1 ? '' : 's'} awaiting review.`}
                {isManager && (continueCourse ? `Pick up where you left off — ${continueCourse.progress}% through “${continueCourse.title}”.` : 'No active courses. Browse the catalog to start learning.')}
                {isConsultant && (continueCourse ? `Continue your learning — ${continueCourse.progress}% through “${continueCourse.title}”.` : 'No active courses. Browse the catalog to start learning.')}
              </p>
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.10)', padding: '14px 20px', borderRadius: tokens.radius.lg, flexShrink: 0 }}>
                <svg width={68} height={68} viewBox={'0 0 68 68'} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={34} cy={34} r={heroR} fill={'none'} stroke={'rgba(255,255,255,0.18)'} strokeWidth={6} />
                  <circle cx={34} cy={34} r={heroR} fill={'none'} stroke={'#FC7300'} strokeWidth={6}
                    strokeDasharray={`${heroDash} ${heroCirc}`} strokeLinecap={'round'} />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{heroPct}%</div>
                  <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3, fontWeight: 600 }}>Overall Progress</div>
                  <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{completed.length} of {courses.length} courses done</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(auto-fit, minmax(200px, 1fr))`, gap: isMobile ? 10 : 12, marginBottom: tokens.space[6] }}>
          {quickActions.map(q => (
            <button key={q.label} onClick={q.onClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${q.color}`,
                borderRadius: tokens.radius.lg, textAlign: 'left', cursor: 'pointer',
                transition: tokens.transition,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = tokens.shadow.md; e.currentTarget.style.background = q.color + '08'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = c.surface; }}>
              <div style={{ width: 40, height: 40, borderRadius: tokens.radius.md, background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <q.icon size={18} color={q.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{q.label}</div>
                <div style={{ fontSize: 11.5, color: c.textSubtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 'calc(50% - 8px)' : '220px'}, 1fr))`, gap: 16, marginBottom: tokens.space[6] }}>
          {isConsultant && <>
            <StatCard label="In Progress" value={inProgress.length} icon={BookOpen} color={c.primarySolid} />
            <StatCard label="Completed" value={completed.length} icon={CheckCircle} color={c.success} />
            <StatCard label="Certificates" value={completed.length} icon={Award} color={c.secondary} />
            <StatCard label="Hours Logged" value="47h" icon={Clock} color={c.info} />
          </>}
          {isManager && <>
            <StatCard label="My Progress" value={inProgress.length} icon={BookOpen} color={c.primarySolid} hint={`${completed.length} completed`} />
            <StatCard label="Submissions" value={submissions.length} icon={Upload} color={c.info} hint={`${submissions.filter(s => s.status === 'pending').length} pending`} />
            <StatCard label="Published" value={submissions.filter(s => s.status === 'published').length} icon={CheckCircle} color={c.success} />
            <StatCard label="Need Action" value={submissions.filter(s => s.status === 'rejected').length} icon={AlertCircle} color={c.danger} />
          </>}
          {isAdmin && <>
            <StatCard label="Total Users" value={allUsers.length} icon={Users} color={c.primarySolid} trend={8} />
            <StatCard label="Active Courses" value={courses.length} icon={BookOpen} color={c.success} />
            <StatCard label="Pending Reviews" value={pendingApprovalsCount} icon={FileCheck} color={c.warning} />
            <StatCard label="Views (7d)" value="1,240" icon={Eye} color={c.info} trend={12} />
          </>}
        </div>

        {/* Continue learning + Announcements two-col */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1.6fr 1fr', gap: 16 }}>
          {/* Continue learning */}
          {(isConsultant || isManager) ? (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>Continue Learning</h2>
                <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => setCurrentPage('my-learning')}>View all</Button>
              </div>
              {inProgress.length === 0 ? (
                <EmptyState icon={BookOpen} title="No courses in progress" description="Start a course from the catalog to see it here." action={<Button icon={Play} onClick={() => setCurrentPage('courses')}>Browse Catalog</Button>} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {inProgress.slice(0, 4).map(course => (
                    <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: c.bgSubtle, borderRadius: tokens.radius.md }}>
                      <div style={{ width: 48, height: 48, borderRadius: tokens.radius.md, background: `linear-gradient(135deg, ${c.primarySolid}, ${c.primaryHover})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PlayCircle size={22} color="rgba(255,255,255,0.9)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: c.text, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div>
                        <div style={{ fontSize: 12, color: c.textSubtle, margin: '2px 0 6px' }}>{course.category} • {course.duration} • {course.progress}%</div>
                        <ProgressBar value={course.progress} />
                      </div>
                      {!isMobile && <Button size="sm" icon={Play} onClick={() => { setCurrentPage('my-learning'); }}>Resume</Button>}
                      {isMobile && <IconButton icon={Play} ariaLabel="Resume course" onClick={() => setCurrentPage('my-learning')} size="sm" />}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>Recent Activity</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {auditLogs.map(log => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: c.bgSubtle, borderRadius: tokens.radius.md }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.action.includes('Published') || log.action.includes('Approved') ? c.success : log.action.includes('Rejected') ? c.danger : c.primarySolid, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: c.text, fontSize: 13 }}>{log.action}</div>
                      <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 2 }}>{log.target} • {log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Announcements */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                Announcements
                {unreadAnnouncements > 0 && <Badge variant="warning" size="sm">{unreadAnnouncements} new</Badge>}
              </h2>
              {unreadAnnouncements > 0 && (
                <button onClick={() => setAnnouncements(prev => prev.map(a => ({ ...a, read: true })))}
                  style={{ border: 'none', background: 'none', color: c.primarySolid, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  Mark all read
                </button>
              )}
            </div>
            {announcements.length === 0 ? (
              <EmptyState icon={Bell} title="No announcements" description="When something is announced, you'll see it here." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {announcements.slice(0, 4).map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: tokens.radius.md, background: item.read ? c.bgSubtle : c.primaryLight, opacity: item.read ? 0.75 : 1, border: `1px solid ${item.read ? 'transparent' : c.primarySolid + '30'}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                      background: item.priority === 'high' ? c.danger : item.priority === 'medium' ? c.warning : c.primarySolid }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, color: c.text, fontSize: 13, lineHeight: 1.3 }}>{item.title}</div>
                        {!item.read && <Badge variant="warning" size="sm">New</Badge>}
                      </div>
                      <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.content}</div>
                      <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 4 }}>{item.author} • {item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — COURSE CATALOG (with search/filter/sort + detail view)
     ════════════════════════════════════════════════════════════════════ */
  const [detailCourse, setDetailCourse] = useState(null);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogStatus, setCatalogStatus] = useState('all');
  const [catalogMandatory, setCatalogMandatory] = useState('all');
  const [catalogSort, setCatalogSort] = useState('popular');

  const CoursesPage = () => {
    const categories = useMemo(() => ['all', ...new Set(courses.map(x => x.category))], []);

    const filtered = useMemo(() => {
      let list = [...courses];
      if (catalogQuery.trim()) {
        const q = catalogQuery.trim().toLowerCase();
        list = list.filter(x => x.title.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
      }
      if (catalogCategory !== 'all') list = list.filter(x => x.category === catalogCategory);
      if (catalogStatus === 'in-progress') list = list.filter(x => x.progress > 0 && x.progress < 100);
      if (catalogStatus === 'completed') list = list.filter(x => x.progress === 100);
      if (catalogStatus === 'not-started') list = list.filter(x => x.progress === 0);
      if (catalogMandatory === 'mandatory') list = list.filter(x => x.mandatory);
      if (catalogMandatory === 'optional') list = list.filter(x => !x.mandatory);
      if (catalogSort === 'popular') list.sort((a, b) => b.enrolled - a.enrolled);
      if (catalogSort === 'rating') list.sort((a, b) => b.rating - a.rating);
      if (catalogSort === 'newest') list.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
      if (catalogSort === 'duration') list.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
      return list;
    }, [catalogQuery, catalogCategory, catalogStatus, catalogMandatory, catalogSort]);

    const clearFilters = () => {
      setCatalogQuery(''); setCatalogCategory('all'); setCatalogStatus('all'); setCatalogMandatory('all'); setCatalogSort('popular');
    };

    const filtersActive = catalogQuery || catalogCategory !== 'all' || catalogStatus !== 'all' || catalogMandatory !== 'all';

    const handleStart = (id) => {
      setCourses(prev => prev.map(c2 => c2.id === id ? { ...c2, progress: c2.progress === 0 ? 5 : c2.progress } : c2));
      const course = courses.find(x => x.id === id);
      toast(`Started "${course?.title}"`);
    };

    /* Detail view */
    if (detailCourse) return <CourseDetailView courseId={detailCourse} onBack={() => setDetailCourse(null)} />;

    return (
      <div>
        <PageHeader title="Course Catalog" subtitle={`${courses.length} courses available — find what you need to learn next`} />

        {/* Filter bar */}
        <Card style={{ marginBottom: tokens.space[5] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input icon={Search} placeholder="Search by title or category…" value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)} ariaLabel="Search courses" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <Select value={catalogCategory} onChange={e => setCatalogCategory(e.target.value)} aria-label="Filter by category">
                {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>)}
              </Select>
              <Select value={catalogStatus} onChange={e => setCatalogStatus(e.target.value)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                <option value="not-started">Not started</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </Select>
              <Select value={catalogMandatory} onChange={e => setCatalogMandatory(e.target.value)} aria-label="Filter by type">
                <option value="all">All types</option>
                <option value="mandatory">Mandatory</option>
                <option value="optional">Optional</option>
              </Select>
              <Select value={catalogSort} onChange={e => setCatalogSort(e.target.value)} aria-label="Sort">
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="newest">Newest</option>
                <option value="duration">Shortest first</option>
              </Select>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, color: c.textMuted, fontWeight: 500 }}>
            <strong style={{ color: c.text }}>{filtered.length}</strong> {filtered.length === 1 ? 'course' : 'courses'} shown
          </div>
          {filtersActive && <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>Clear filters</Button>}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon={Search} title="No courses match your filters"
              description="Try adjusting your search or clearing some filters to see more results."
              action={<Button onClick={clearFilters}>Clear all filters</Button>} />
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(auto-fill, minmax(280px, 1fr))`, gap: isMobile ? 10 : 16 }}>
            {filtered.map(course => {
              const rd = getCourseRating(course.id);
              const rating = rd ? rd.avg : course.rating;
              const reviewCount = rd ? rd.count : null;
              const status = course.progress === 100 ? 'completed' : course.progress > 0 ? 'in-progress' : 'not-started';
              return (
                <Card key={course.id} hover padded={false} onClick={() => setDetailCourse(course.id)} ariaLabel={`View ${course.title}`}>
                  {/* Cover */}
                  {(() => { const cm = getCatMeta(course.category); const CatIcon = cm.icon; return (
                  <div style={{ height: isMobile ? 80 : 110, background: `linear-gradient(135deg, ${cm.color} 0%, ${cm.color}cc 100%)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <CatIcon size={isMobile ? 32 : 48} color="rgba(255,255,255,0.22)" />
                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.92)', color: cm.color, borderRadius: tokens.radius.full, fontSize: 10, fontWeight: 700, letterSpacing: 0.4 }}>{course.category}</span>
                      {course.mandatory && <span style={{ padding: '3px 9px', background: c.danger, color: '#fff', borderRadius: tokens.radius.full, fontSize: 10, fontWeight: 700, letterSpacing: 0.4 }}>MANDATORY</span>}
                    </div>
                    {status === 'completed' && (
                      <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: c.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={16} color="#fff" />
                      </div>
                    )}
                  </div>); })()}
                  <div style={{ padding: isMobile ? 10 : 16 }}>
                    <h3 style={{ margin: 0, fontSize: isMobile ? 12.5 : 14.5, fontWeight: 700, color: c.text, lineHeight: 1.35, minHeight: isMobile ? 32 : 38, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</h3>
                    {!isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: c.textSubtle, marginTop: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{course.duration}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><BookOpen size={12} />{course.lessons}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Users size={12} />{course.enrolled.toLocaleString()}</span>
                    </div>
                    )}
                    {course.progress > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <ProgressBar value={course.progress} />
                        <div style={{ fontSize: 11, color: course.progress === 100 ? c.successText : c.textSubtle, marginTop: 4, fontWeight: 600 }}>
                          {course.progress === 100 ? '✓ Completed' : `${course.progress}% complete`}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <StarRating value={rating} size={12} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{rating}</span>
                        {reviewCount != null && <span style={{ fontSize: 11, color: c.textSubtle }}>({reviewCount})</span>}
                      </div>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); if (status === 'completed') setCurrentPage('certificates'); else if (status === 'in-progress') setDetailCourse(course.id); else handleStart(course.id); }}>
                        {status === 'completed' ? 'Certificate' : status === 'in-progress' ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     COURSE DETAIL VIEW
     ════════════════════════════════════════════════════════════════════ */
  const CourseDetailView = ({ courseId, onBack }) => {
    const course = courses.find(x => x.id === courseId);
    const reviews = courseReviews.filter(r => r.courseId === courseId);
    const rd = getCourseRating(courseId);
    const isCompleted = course.progress === 100;
    const alreadyReviewed = hasReviewed(courseId);

    /* Generate mock curriculum */
    const curriculum = useMemo(() => {
      const titles = [
        'Welcome and overview', 'Setting up your environment', 'Core concepts', 'Hands-on walkthrough',
        'Common pitfalls and how to avoid them', 'Real-world scenarios', 'Practice exercises',
        'Assessment', 'Advanced topics', 'Capstone', 'Final review', 'Wrap-up & resources',
      ];
      const lessonProgress = course.progress / 100 * course.lessons;
      return Array.from({ length: course.lessons }).map((_, i) => ({
        id: i + 1,
        title: titles[i % titles.length],
        duration: `${Math.floor(8 + Math.random() * 14)} min`,
        completed: i < Math.floor(lessonProgress),
        current: i === Math.floor(lessonProgress) && course.progress > 0 && course.progress < 100,
      }));
    }, [course.id, course.progress, course.lessons]);

    const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

    const startOrContinue = () => {
      setCourses(prev => prev.map(c2 => c2.id === courseId ? { ...c2, progress: Math.min(100, c2.progress + 10) } : c2));
      toast(course.progress + 10 >= 100 ? `Completed "${course.title}"!` : `Progress saved`);
    };

    return (
      <div>
        <PageHeader breadcrumb={{ label: 'Back to catalog', onClick: onBack }}
          title={course.title}
          subtitle={course.category + ' • ' + course.duration + ' • ' + course.lessons + ' lessons'} />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 360px', gap: 20 }}>
          {/* Main column */}
          <div>
            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${c.primarySolid} 0%, ${c.primaryHover} 100%)`, borderRadius: tokens.radius.xl, padding: 32, color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.18)', borderRadius: tokens.radius.full, fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>{course.category}</span>
                {course.mandatory && <span style={{ padding: '3px 9px', background: c.danger, borderRadius: tokens.radius.full, fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>MANDATORY</span>}
                {isCompleted && <span style={{ padding: '3px 9px', background: c.success, borderRadius: tokens.radius.full, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} />COMPLETED</span>}
              </div>
              <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, letterSpacing: -0.3 }}>{course.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, opacity: 0.9, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><BookOpen size={14} />{course.lessons} lessons</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={14} />{course.duration}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={14} />{course.enrolled.toLocaleString()} enrolled</span>
                {rd && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Star size={14} fill={c.warning} color={c.warning} />
                    <strong>{rd.avg}</strong>
                    <span style={{ opacity: 0.75 }}>({rd.count})</span>
                  </span>
                )}
              </div>
              {course.progress > 0 && !isCompleted && (
                <div style={{ marginTop: 18, background: 'rgba(255,255,255,0.15)', borderRadius: tokens.radius.md, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>Your progress</span>
                    <span style={{ fontWeight: 700 }}>{course.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${course.progress}%`, background: c.secondary, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>
              )}
              <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!isCompleted && (
                  <button onClick={startOrContinue} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: c.secondary, color: '#fff', border: 'none', borderRadius: tokens.radius.md, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    <Play size={16} /> {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                  </button>
                )}
                {isCompleted && !alreadyReviewed && (
                  <button onClick={() => openReviewModal(course.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: c.secondary, color: '#fff', border: 'none', borderRadius: tokens.radius.md, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    <Star size={16} /> Rate & Review
                  </button>
                )}
                {isCompleted && (
                  <button onClick={() => setCurrentPage('certificates')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', borderRadius: tokens.radius.md, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    <Award size={16} /> View Certificate
                  </button>
                )}
              </div>
            </div>

            {/* Learning outcomes */}
            <Card style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: c.text }}>What you'll learn</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                {course.outcomes.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle size={16} color={c.success} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 13.5, color: c.textMuted, lineHeight: 1.5 }}>{o}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Curriculum */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>Curriculum</h2>
                <span style={{ fontSize: 12, color: c.textSubtle }}>{curriculum.filter(l => l.completed).length} of {curriculum.length} complete</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {curriculum.map((lesson, idx) => (
                  <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: idx < curriculum.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: lesson.completed ? c.success : lesson.current ? c.primaryLight : c.bgSubtle,
                      color: lesson.completed ? '#fff' : lesson.current ? c.primarySolid : c.textSubtle, fontWeight: 700, fontSize: 12,
                      border: lesson.current ? `2px solid ${c.primarySolid}` : 'none',
                    }}>
                      {lesson.completed ? <Check size={14} /> : lesson.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: lesson.current ? 700 : 500, color: lesson.current ? c.text : c.textMuted, fontSize: 13.5 }}>
                        Lesson {lesson.id} · {lesson.title}
                      </div>
                      <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {lesson.duration}</span>
                        {lesson.current && <Badge variant="primary" size="sm">Current</Badge>}
                      </div>
                    </div>
                    {!lesson.completed && !isCompleted && (
                      <IconButton icon={Play} ariaLabel={`Start lesson ${lesson.id}`} size="sm" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>
                  Reviews {reviews.length > 0 && <span style={{ color: c.textSubtle, fontWeight: 500 }}>({reviews.length})</span>}
                </h2>
                {isCompleted && !alreadyReviewed && <Button size="sm" icon={Star} onClick={() => openReviewModal(course.id)}>Write a review</Button>}
              </div>
              {reviews.length === 0 ? (
                <EmptyState icon={Star} title="No reviews yet"
                  description={isCompleted ? 'Be the first to share your feedback on this course.' : 'Complete the course to leave a review.'}
                  action={isCompleted && !alreadyReviewed ? <Button icon={Star} onClick={() => openReviewModal(course.id)}>Write a review</Button> : null} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '180px 1fr', gap: 24 }}>
                  <div>
                    <div style={{ textAlign: 'center', padding: '8px 0 16px', borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 44, fontWeight: 900, color: c.text, lineHeight: 1 }}>{rd.avg}</div>
                      <StarRating value={rd.avg} size={16} />
                      <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 4 }}>{rd.count} review{rd.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dist.map(d => (
                        <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          <span style={{ width: 12, color: c.textMuted }}>{d.star}</span>
                          <Star size={12} fill={c.warning} color={c.warning} />
                          <div style={{ flex: 1, height: 6, background: c.bgSubtle, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: rd.count ? `${(d.count / rd.count) * 100}%` : 0, background: c.warning, borderRadius: 3 }} />
                          </div>
                          <span style={{ width: 18, fontSize: 11, color: c.textSubtle, textAlign: 'right' }}>{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reviews.map((r, i) => (
                      <div key={i} style={{ padding: '14px 16px', background: c.bgSubtle, borderRadius: tokens.radius.md, borderLeft: `3px solid ${r.rating >= 4 ? c.success : r.rating === 3 ? c.warning : c.danger}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={r.userName} size={32} />
                            <div>
                              <div style={{ fontWeight: 600, color: c.text, fontSize: 13 }}>{r.userName}</div>
                              <div style={{ fontSize: 11, color: c.textSubtle }}>{r.userRole} • {r.date}</div>
                            </div>
                          </div>
                          <StarRating value={r.rating} size={13} />
                        </div>
                        <p style={{ margin: 0, color: c.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>{r.feedback}</p>
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textSubtle }}>
                          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: `1px solid ${c.border}`, borderRadius: tokens.radius.sm, background: c.surface, cursor: 'pointer', fontSize: 12, color: c.textMuted }}>
                            <Check size={12} /> Helpful ({r.helpful || 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar — meta */}
          <div>
            <Card>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Course details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Category', value: course.category, icon: Hash },
                  { label: 'Duration', value: course.duration, icon: Clock },
                  { label: 'Lessons', value: course.lessons + ' lessons', icon: BookOpen },
                  { label: 'Enrolled', value: course.enrolled.toLocaleString() + ' learners', icon: Users },
                  { label: 'Last updated', value: formatDate(course.addedDate), icon: Calendar },
                  { label: 'Type', value: course.mandatory ? 'Mandatory' : 'Optional', icon: course.mandatory ? AlertCircle : Lightbulb },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${c.border}` }}>
                    <m.icon size={16} color={c.textSubtle} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: c.textSubtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
                      <div style={{ fontSize: 13, color: c.text, fontWeight: 600, marginTop: 1 }}>{m.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — MY LEARNING
     ════════════════════════════════════════════════════════════════════ */
  const MyLearningPage = () => {
    const [tab, setTab] = useState('in-progress');
    const inProgress = courses.filter(x => x.progress > 0 && x.progress < 100);
    const completed = courses.filter(x => x.progress === 100);
    const notStarted = courses.filter(x => x.progress === 0);

    const list = tab === 'in-progress' ? inProgress : tab === 'completed' ? completed : notStarted;

    return (
      <div>
        <PageHeader title="My Learning" subtitle="Pick up where you left off, track completed courses, and start something new" />

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 'calc(50% - 8px)' : '220px'}, 1fr))`, gap: 16, marginBottom: tokens.space[6] }}>
          <StatCard label="In Progress" value={inProgress.length} icon={BookOpen} color={c.primarySolid} />
          <StatCard label="Completed" value={completed.length} icon={CheckCircle} color={c.success} />
          <StatCard label="Not Started" value={notStarted.length} icon={Clock} color={c.warning} />
          <StatCard label="Certificates" value={completed.length} icon={Award} color={c.secondary} />
        </div>

        <Card>
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'in-progress', label: 'In Progress', count: inProgress.length },
            { id: 'completed', label: 'Completed', count: completed.length },
            { id: 'not-started', label: 'Not Started', count: notStarted.length },
          ]} />

          {list.length === 0 ? (
            <EmptyState icon={BookOpen}
              title={tab === 'in-progress' ? 'No courses in progress' : tab === 'completed' ? 'No completed courses yet' : 'No new courses available'}
              description={tab === 'in-progress' ? 'Start a course from the catalog to see it here.' : tab === 'completed' ? 'Complete a course to earn your first certificate.' : 'Check back later — new courses are added regularly.'}
              action={<Button icon={Compass} onClick={() => setCurrentPage('courses')}>Browse Catalog</Button>} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(auto-fill, minmax(260px, 1fr))`, gap: isMobile ? 10 : 14 }}>
              {list.map(course => {
                const rd = getCourseRating(course.id);
                const reviewed = hasReviewed(course.id);
                return (
                  <Card key={course.id} padded={false} hover onClick={() => setDetailCourse(course.id)}>
                    <div style={{ height: 90, background: `linear-gradient(135deg, ${c.primarySolid}, ${c.primaryHover})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <PlayCircle size={36} color="rgba(255,255,255,0.3)" />
                      {course.progress === 100 && <div style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', background: c.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={14} color="#fff" /></div>}
                    </div>
                    <div style={{ padding: 14 }}>
                      <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: c.text, lineHeight: 1.35 }}>{course.title}</h4>
                      <div style={{ fontSize: 11.5, color: c.textSubtle, margin: '4px 0 10px' }}>{course.category} • {course.lessons} lessons</div>
                      {course.progress > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <ProgressBar value={course.progress} />
                          <div style={{ fontSize: 11, color: course.progress === 100 ? c.successText : c.textSubtle, marginTop: 4, fontWeight: 600 }}>{course.progress === 100 ? '✓ Completed' : `${course.progress}%`}</div>
                        </div>
                      )}
                      {rd && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <StarRating value={rd.avg} size={11} />
                          <span style={{ fontSize: 11, color: c.textSubtle, fontWeight: 600 }}>{rd.avg} ({rd.count})</span>
                        </div>
                      )}
                      <Button block size="sm" onClick={(e) => { e.stopPropagation(); setDetailCourse(course.id); }}>
                        {course.progress === 0 ? 'Start' : course.progress === 100 ? 'View Details' : 'Continue'}
                      </Button>
                      {course.progress === 100 && !reviewed && (
                        <button onClick={(e) => { e.stopPropagation(); openReviewModal(course.id); }}
                          style={{ marginTop: 6, width: '100%', padding: '7px 0', border: `1px solid ${c.secondary}`, borderRadius: tokens.radius.md, background: 'transparent', color: c.secondary, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                          onMouseEnter={e => e.currentTarget.style.background = c.secondaryLight}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Star size={13} /> Rate & Review
                        </button>
                      )}
                      {course.progress === 100 && reviewed && (
                        <div style={{ marginTop: 6, padding: '6px 0', textAlign: 'center', fontSize: 11, color: c.successText, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%' }}>
                          <CheckCircle size={12} /> Review submitted
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — TUTORIALS
     ════════════════════════════════════════════════════════════════════ */
  const TutorialsPage = () => {
    const [filter, setFilter] = useState('all');
    const cats = ['all', ...new Set(tutorials.map(t => t.category))];
    const list = filter === 'all' ? tutorials : tutorials.filter(t => t.category === filter);

    const difficultyVariant = (d) => d === 'Beginner' ? 'success' : d === 'Intermediate' ? 'warning' : 'danger';

    return (
      <div>
        <PageHeader title="Tutorials" subtitle="Short, focused how-to guides for everyday tasks" />

        <Card style={{ marginBottom: 20 }}>
          <div className="pills-row">
            {cats.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ padding: '7px 14px', border: 'none', borderRadius: tokens.radius.md, background: filter === cat ? c.primarySolid : c.bgSubtle, color: filter === cat ? '#fff' : c.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: tokens.transition, whiteSpace: 'nowrap', flexShrink: 0, minHeight: 38 }}>
                {cat === 'all' ? 'All Tutorials' : cat}
              </button>
            ))}
          </div>
        </Card>

        {list.length === 0 ? (
          <Card><EmptyState icon={Lightbulb} title="No tutorials in this category" /></Card>
        ) : (() => {
          const maxViews = Math.max(...list.map(t => t.views));
          const featured = list[0];
          const rest = list.slice(1);
          return (
            <div>
              {/* Featured tutorial */}
              <Card hover style={{ marginBottom: 16, background: `linear-gradient(135deg, ${c.primarySolid}0d, ${c.surface})`, borderColor: c.primarySolid + '30' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <div style={{ width: 56, height: 56, borderRadius: tokens.radius.lg, background: `linear-gradient(135deg, ${c.primarySolid}, #034849)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lightbulb size={26} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.primarySolid }}>Featured Tutorial</span>
                      <Badge>{featured.category}</Badge>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: c.text }}>{featured.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: c.textSubtle, marginTop: 6 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{featured.duration}</span>
                      <Badge variant={difficultyVariant(featured.difficulty)} size="sm">{featured.difficulty}</Badge>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {featured.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <Button icon={Play} block={isMobile} onClick={() => toast('Tutorial started')}>Start Now</Button>
                </div>
              </Card>
              {/* Rest */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(auto-fill, minmax(280px, 1fr))`, gap: isMobile ? 10 : 16 }}>
                {rest.map(t => (
                  <Card key={t.id} hover>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: tokens.radius.md, background: c.secondaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lightbulb size={20} color={c.secondary} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {t.views === maxViews && <Badge variant="warning" size="sm">Most viewed</Badge>}
                        <Badge>{t.category}</Badge>
                      </div>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text, lineHeight: 1.35 }}>{t.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.textSubtle, margin: '10px 0' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{t.duration}</span>
                      <span>•</span>
                      <Badge variant={difficultyVariant(t.difficulty)} size="sm">{t.difficulty}</Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: c.textSubtle, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {t.views.toLocaleString()}</span>
                      <Button size="sm" icon={Play} onClick={() => toast('Tutorial started')}>Start</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — RESOURCES (Knowledge base)
     ════════════════════════════════════════════════════════════════════ */
  const ResourcesPage = () => {
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState(null);

    const articles = useMemo(() => {
      let list = [...knowledgeBaseArticles];
      if (selectedCat) list = list.filter(a => a.category === selectedCat);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(a => a.title.toLowerCase().includes(q));
      }
      return list;
    }, [search, selectedCat]);

    return (
      <div>
        <PageHeader title="Resources" subtitle="Knowledge base, policies, guides, and FAQs" />

        <Card style={{ marginBottom: 20 }}>
          <Input icon={Search} placeholder="Search articles, guides, FAQs…" value={search} onChange={e => setSearch(e.target.value)} ariaLabel="Search resources" />
        </Card>

        {!selectedCat && !search ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : 240}px, 1fr))`, gap: 14, marginBottom: 24 }}>
              {knowledgeBaseCategories.map(cat => (
                <Card key={cat.id} hover onClick={() => setSelectedCat(cat.name)} padded={false}>
                  <div style={{ padding: 18, borderLeft: `3px solid ${cat.color}`, borderTopLeftRadius: tokens.radius.lg, borderBottomLeftRadius: tokens.radius.lg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: tokens.radius.md, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <cat.icon size={22} color={cat.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{cat.name}</div>
                        <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 2 }}>{cat.articles} article{cat.articles === 1 ? '' : 's'}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: c.text }}>Popular articles</h3>
              {(() => {
                const topFive = knowledgeBaseArticles.slice(0, 5);
                const maxV = Math.max(...topFive.map(a => a.views));
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {topFive.map((a, i) => (
                      <button key={a.id} onClick={() => toast('Article opened')}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', padding: '13px 0', border: 'none', borderTop: i > 0 ? `1px solid ${c.border}` : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <FileText size={18} color={c.primarySolid} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: c.text, fontSize: 13.5 }}>{a.title}</div>
                          <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 2, marginBottom: 6 }}>{a.category} • Updated {a.updated}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: c.bgSubtle, borderRadius: tokens.radius.full, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(a.views / maxV) * 100}%`, background: c.primarySolid, borderRadius: tokens.radius.full }} />
                            </div>
                            <span style={{ fontSize: 11, color: c.textSubtle, fontWeight: 600, minWidth: 50, textAlign: 'right' }}>{a.views.toLocaleString()} views</span>
                          </div>
                        </div>
                        <ChevronRight size={16} color={c.textSubtle} style={{ flexShrink: 0, marginTop: 2 }} />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </Card>
          </>
        ) : (
          <Card>
            <button onClick={() => { setSelectedCat(null); setSearch(''); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 0', border: 'none', background: 'none', cursor: 'pointer', color: c.primarySolid, fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
              <ChevronLeft size={16} /> Back to categories
            </button>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: c.text }}>{selectedCat || `Search results for "${search}"`}</h3>
            {articles.length === 0 ? (
              <EmptyState icon={Search} title="No articles found" description="Try a different search term or browse all categories." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {articles.map((a, i) => (
                  <button key={a.id} onClick={() => toast('Article opened')}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 0', border: 'none', borderTop: i > 0 ? `1px solid ${c.border}` : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                    <FileText size={18} color={c.primarySolid} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: c.text, fontSize: 13.5 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 2 }}>{a.helpful}% found this helpful • Updated {a.updated}</div>
                    </div>
                    <ChevronRight size={16} color={c.textSubtle} />
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — UPLOAD CENTER (drag-drop, validation, progress, summary)
     ════════════════════════════════════════════════════════════════════ */
  const UploadPage = () => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [form, setForm] = useState({ title: '', category: '', description: '' });
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const fileInputRef = useRef(null);
    const isAdmin = currentUser?.role === 'admin';

    const handleFiles = (files) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      const ok = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'video/mp4', 'image/png', 'image/jpeg', 'image/gif'].includes(f.type) || /\.(pdf|docx|xlsx|pptx|mp4|png|jpg|jpeg)$/i.test(f.name);
      if (!ok) { toast('Unsupported file type. Use PDF, DOCX, XLSX, PPTX, MP4, or image.', 'danger'); return; }
      if (f.size > 50 * 1024 * 1024) { toast('File is too large. Maximum size is 50MB.', 'danger'); return; }
      setFile({ name: f.name, size: f.size, type: f.type });
    };

    const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };
    const formatSize = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(0) + ' KB' : (b / 1024 / 1024).toFixed(1) + ' MB';

    const fileIcon = (name) => {
      const ext = name.split('.').pop().toLowerCase();
      if (['mp4', 'mov'].includes(ext)) return FileVideo;
      if (['xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
      return FileText;
    };

    const validateForm = () => {
      const errs = {};
      if (!form.title.trim()) errs.title = 'Title is required';
      else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
      if (!form.category) errs.category = 'Choose a category';
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const submit = () => {
      setUploading(true);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 20;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setTimeout(() => {
            const newSub = {
              id: Date.now(), title: form.title, type: form.category,
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              status: isAdmin ? 'published' : 'pending',
              submittedBy: currentUser?.name, notes: '',
            };
            setSubmissions(prev => [newSub, ...prev]);
            setUploading(false);
            setDone(true);
            toast(isAdmin ? 'Document published' : 'Submitted for review');
          }, 350);
        }
        setProgress(Math.min(100, p));
      }, 220);
    };

    const reset = () => {
      setStep(1); setFile(null); setForm({ title: '', category: '', description: '' });
      setErrors({}); setProgress(0); setUploading(false); setDone(false);
    };

    if (done) {
      return (
        <div>
          <PageHeader title="Upload Document" />
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: c.successLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle size={36} color={c.success} />
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: c.text }}>{isAdmin ? 'Published successfully' : 'Submitted for review'}</h2>
              <p style={{ margin: '6px 0 24px', color: c.textSubtle, fontSize: 14 }}>
                {isAdmin ? 'Your document is now visible to all users.' : 'Admins will review your submission and notify you of the decision.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button onClick={reset} icon={Plus}>Upload another</Button>
                <Button variant="outline" onClick={() => setCurrentPage('submissions')}>View submissions</Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div>
        <PageHeader title="Upload Document" subtitle={isAdmin ? 'Publish documents directly to the platform' : 'Submit documents for admin review'} />

        <Card>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 8, flexWrap: 'wrap' }}>
            {[{ n: 1, label: 'File' }, { n: 2, label: 'Details' }, { n: 3, label: 'Review' }].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: step >= s.n ? c.primarySolid : c.bgSubtle, color: step >= s.n ? '#fff' : c.textSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                    {step > s.n ? <Check size={14} /> : s.n}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: step >= s.n ? c.text : c.textSubtle }}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? c.primarySolid : c.border, minWidth: 24 }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Drop zone */}
          {step === 1 && (
            <div>
              <input ref={fileInputRef} type="file" hidden onChange={(e) => handleFiles(e.target.files)} accept=".pdf,.docx,.xlsx,.pptx,.mp4,.png,.jpg,.jpeg" />
              {!file ? (
                <div onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
                  style={{
                    border: `2px dashed ${dragOver ? c.primarySolid : c.borderStrong}`, borderRadius: tokens.radius.lg,
                    padding: '60px 20px', textAlign: 'center', cursor: 'pointer',
                    background: dragOver ? c.primaryLight : c.bgSubtle, transition: tokens.transition,
                  }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Upload size={28} color={c.primarySolid} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{dragOver ? 'Release to upload' : 'Drag & drop a file here'}</div>
                  <div style={{ fontSize: 13, color: c.textSubtle, marginTop: 6 }}>or <span style={{ color: c.primarySolid, fontWeight: 600 }}>click to browse</span></div>
                  <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 14 }}>PDF, DOCX, XLSX, PPTX, MP4, PNG/JPG • Max 50MB</div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, border: `2px solid ${c.success}`, borderRadius: tokens.radius.lg, background: c.successLight }}>
                  <div style={{ width: 48, height: 48, borderRadius: tokens.radius.md, background: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {React.createElement(fileIcon(file.name), { size: 24, color: c.primarySolid })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 2 }}>{formatSize(file.size)} • Ready to upload</div>
                  </div>
                  <IconButton icon={X} ariaLabel="Remove file" onClick={() => setFile(null)} />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>
                  Title <span style={{ color: c.danger }}>*</span>
                </label>
                <Input placeholder="e.g. Q1 Compliance Update" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} error={errors.title} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>
                  Category <span style={{ color: c.danger }}>*</span>
                </label>
                <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category…</option>
                  <option>Document</option><option>Video</option><option>Spreadsheet</option>
                  <option>Policy</option><option>Template</option><option>Other</option>
                </Select>
                {errors.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: c.danger, marginTop: 4 }}>
                    <AlertCircle size={12} /> {errors.category}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>
                  Description <span style={{ color: c.textSubtle, fontWeight: 500 }}>(optional)</span>
                </label>
                <Textarea placeholder="Briefly describe the contents and intended audience…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: c.text }}>Review submission</h3>
              <div style={{ background: c.bgSubtle, borderRadius: tokens.radius.md, padding: 18, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: tokens.radius.md, background: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.createElement(fileIcon(file.name), { size: 20, color: c.primarySolid })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 2 }}>{formatSize(file.size)}</div>
                  </div>
                </div>
                {[
                  ['Title', form.title], ['Category', form.category], ['Description', form.description || '—'],
                  ['Visibility', isAdmin ? 'Publishing directly (admin)' : 'Will be sent for review'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 14, padding: '6px 0' }}>
                    <div style={{ width: 100, fontSize: 12, color: c.textSubtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 0 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: c.text, fontWeight: 500, flex: 1, wordBreak: 'break-word' }}>{v}</div>
                  </div>
                ))}
              </div>
              {uploading && (
                <div style={{ marginBottom: 16, padding: 16, background: c.primaryLight, borderRadius: tokens.radius.md }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: c.primarySolid, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…
                    </span>
                    <span style={{ fontWeight: 700, color: c.primarySolid }}>{Math.floor(progress)}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: `1px solid ${c.border}`, gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" icon={ChevronLeft} disabled={step === 1 || uploading} onClick={() => setStep(s => Math.max(1, s - 1))}>Previous</Button>
            {step < 3 ? (
              <Button iconRight={ChevronRight} disabled={(step === 1 && !file) || uploading}
                onClick={() => { if (step === 2 && !validateForm()) return; setStep(s => s + 1); }}>Next</Button>
            ) : (
              <Button icon={uploading ? Loader2 : (isAdmin ? CheckCircle : Send)} disabled={uploading} onClick={submit}>
                {uploading ? 'Uploading…' : isAdmin ? 'Publish now' : 'Submit for review'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — MY SUBMISSIONS
     ════════════════════════════════════════════════════════════════════ */
  const SubmissionsPage = () => {
    const isAdmin = currentUser?.role === 'admin';
    const list = isAdmin ? submissions.filter(s => s.status === 'published') : submissions.filter(s => s.submittedBy === currentUser?.name);

    return (
      <div>
        <PageHeader title="My Submissions" subtitle={isAdmin ? 'Documents you have published' : 'Track the status of your submissions'} />

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: c.successLight, borderRadius: tokens.radius.md, marginBottom: 20, border: `1px solid ${c.success}30` }}>
            <CheckCircle size={18} color={c.success} />
            <span style={{ fontSize: 13.5, color: c.successText, fontWeight: 600 }}>As an admin, your uploads are published directly without review.</span>
          </div>
        )}

        {list.length === 0 ? (
          <Card>
            <EmptyState icon={Inbox} title="No submissions yet"
              description={isAdmin ? 'Documents you publish will appear here.' : 'Documents you upload will appear here while they are reviewed.'}
              action={<Button icon={Upload} onClick={() => setCurrentPage('upload')}>Upload Document</Button>} />
          </Card>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(s => (
              <Card key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <FileText size={18} color={c.primarySolid} style={{ flexShrink: 0 }} />
                    <div style={{ fontWeight: 600, color: c.text, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                  </div>
                  <StatusPill status={s.status} size="sm" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.textSubtle }}>
                  <span>{s.type}</span>
                  <span>{s.date}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padded={false}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: c.bgSubtle }}>
                    {['Document', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: `1px solid ${c.border}` }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText size={16} color={c.primarySolid} />
                          <span style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>{s.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}><Badge>{s.type}</Badge></td>
                      <td style={{ padding: '14px 20px', color: c.textMuted, fontSize: 13 }}>{s.date}</td>
                      <td style={{ padding: '14px 20px' }}><StatusPill status={s.status} /></td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <Button size="sm" variant="ghost" icon={Eye}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — APPROVALS (with timeline, required rejection reason)
     ════════════════════════════════════════════════════════════════════ */
  const [reviewSubmission, setReviewSubmission] = useState(null);
  const [decisionMode, setDecisionMode] = useState(null); // 'approve' | 'reject'
  const [reviewerNote, setReviewerNote] = useState('');

  const ApprovalsPage = () => {
    const [tab, setTab] = useState('pending');
    const counts = {
      pending: submissions.filter(s => s.status === 'pending').length,
      review: submissions.filter(s => s.status === 'review').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    };
    const list = submissions.filter(s => s.status === tab);

    return (
      <div>
        <PageHeader title="Approval Queue" subtitle="Review submissions and decide what gets published" />

        <Card>
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'review', label: 'Under Review', count: counts.review },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
          ]} />

          {list.length === 0 ? (
            <EmptyState icon={CheckCircle} title="Nothing to review here"
              description={tab === 'pending' ? 'Great work — the queue is clear.' : `No ${tab} items.`} />
          ) : isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {list.map(s => (
                <button key={s.id} onClick={() => { setReviewSubmission(s); setReviewerNote(''); setDecisionMode(null); }}
                  style={{ display: 'block', textAlign: 'left', padding: 14, background: c.surface, border: `1px solid ${c.border}`, borderRadius: tokens.radius.md, cursor: 'pointer', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                    <div style={{ fontWeight: 600, color: c.text, fontSize: 14, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                    <StatusPill status={s.status} size="sm" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.textSubtle }}>
                    <span>{s.submittedBy}</span>
                    <span>{s.date}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {list.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 4px', borderTop: i > 0 ? `1px solid ${c.border}` : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: tokens.radius.md, background: c.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color={c.primarySolid} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 2 }}>Submitted by {s.submittedBy} • {s.date} • {s.type}</div>
                  </div>
                  <StatusPill status={s.status} />
                  <Button size="sm" icon={Eye} onClick={() => { setReviewSubmission(s); setReviewerNote(''); setDecisionMode(null); }}>Review</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Review Modal */}
        <Modal
          open={!!reviewSubmission}
          onClose={() => { setReviewSubmission(null); setDecisionMode(null); }}
          title={reviewSubmission?.title}
          subtitle={reviewSubmission ? `Submitted by ${reviewSubmission.submittedBy} • ${reviewSubmission.date}` : ''}
          size="lg"
          footer={
            reviewSubmission && (reviewSubmission.status === 'pending' || reviewSubmission.status === 'review') && (
              decisionMode ? (
                <>
                  <Button variant="outline" onClick={() => setDecisionMode(null)}>Back</Button>
                  <Button variant={decisionMode === 'approve' ? 'success' : 'danger'}
                    icon={decisionMode === 'approve' ? CheckCircle : X}
                    onClick={() => {
                      if (decisionMode === 'reject' && !reviewerNote.trim()) {
                        toast('Rejection reason is required', 'danger');
                        return;
                      }
                      setSubmissions(prev => prev.map(s => s.id === reviewSubmission.id ? { ...s, status: decisionMode === 'approve' ? 'approved' : 'rejected', notes: reviewerNote } : s));
                      toast(decisionMode === 'approve' ? 'Submission approved' : 'Submission rejected');
                      setReviewSubmission(null); setDecisionMode(null);
                    }}>
                    {decisionMode === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setReviewSubmission(null); }}>Close</Button>
                  <Button variant="danger" icon={X} onClick={() => setDecisionMode('reject')}>Reject</Button>
                  <Button variant="success" icon={CheckCircle} onClick={() => setDecisionMode('approve')}>Approve</Button>
                </>
              )
            )
          }>
          {reviewSubmission && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 24 }}>
              {/* Left: details / decision */}
              <div>
                {decisionMode ? (
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: c.text }}>
                      {decisionMode === 'approve' ? 'Approve this submission' : 'Reject this submission'}
                    </h3>
                    <p style={{ margin: '0 0 14px', fontSize: 13, color: c.textSubtle }}>
                      {decisionMode === 'approve' ? 'Add an optional note before approving.' : 'A rejection reason is required so the submitter understands the decision.'}
                    </p>
                    <Textarea placeholder={decisionMode === 'approve' ? 'Optional reviewer note…' : 'Why is this being rejected?'} value={reviewerNote} onChange={e => setReviewerNote(e.target.value)} rows={5} />
                  </div>
                ) : (
                  <>
                    <div style={{ background: c.bgSubtle, borderRadius: tokens.radius.md, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: c.textSubtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Preview</div>
                      <div style={{ background: c.surface, borderRadius: tokens.radius.md, padding: 36, textAlign: 'center', border: `1px solid ${c.border}` }}>
                        <FileText size={36} color={c.primarySolid} />
                        <div style={{ fontWeight: 700, color: c.text, fontSize: 14, marginTop: 10 }}>{reviewSubmission.title}</div>
                        <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 4 }}>{reviewSubmission.type}</div>
                        <button style={{ marginTop: 12, padding: '7px 14px', background: 'transparent', color: c.primarySolid, border: `1px solid ${c.primarySolid}`, borderRadius: tokens.radius.sm, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Download size={12} /> Download file
                        </button>
                      </div>
                    </div>
                    {reviewSubmission.notes && (
                      <div style={{ background: c.warningLight, borderLeft: `3px solid ${c.warning}`, padding: '12px 14px', borderRadius: tokens.radius.md }}>
                        <div style={{ fontSize: 11, color: c.warningText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Reviewer note</div>
                        <div style={{ fontSize: 13.5, color: c.textMuted, lineHeight: 1.5 }}>{reviewSubmission.notes}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right: timeline */}
              <div>
                <h4 style={{ margin: '0 0 14px', fontSize: 12, color: c.textSubtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Timeline</h4>
                <div style={{ position: 'relative', paddingLeft: 22 }}>
                  <div style={{ position: 'absolute', left: 9, top: 12, bottom: 12, width: 2, background: c.border }} />
                  {[
                    { label: 'Submitted', date: reviewSubmission.date, status: 'done', icon: Send },
                    { label: 'Under Review', date: reviewSubmission.status === 'pending' ? 'Waiting' : 'In progress', status: reviewSubmission.status === 'pending' ? 'pending' : 'done', icon: Eye },
                    { label: reviewSubmission.status === 'approved' ? 'Approved' : reviewSubmission.status === 'rejected' ? 'Rejected' : 'Decision', date: ['approved', 'rejected', 'published'].includes(reviewSubmission.status) ? 'Today' : 'Pending', status: ['approved', 'rejected', 'published'].includes(reviewSubmission.status) ? 'done' : 'pending', icon: ['approved', 'published'].includes(reviewSubmission.status) ? CheckCircle : reviewSubmission.status === 'rejected' ? X : CircleDashed },
                  ].map((step, i) => (
                    <div key={i} style={{ position: 'relative', paddingBottom: i < 2 ? 18 : 0 }}>
                      <div style={{ position: 'absolute', left: -22, top: 0, width: 20, height: 20, borderRadius: '50%', background: step.status === 'done' ? c.primarySolid : c.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${c.surface}` }}>
                        <step.icon size={10} color={step.status === 'done' ? '#fff' : c.textSubtle} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{step.label}</div>
                      <div style={{ fontSize: 11.5, color: c.textSubtle, marginTop: 2 }}>{step.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — TEAM PROGRESS (admin)
     ════════════════════════════════════════════════════════════════════ */
  const TeamProgressPage = () => {
    const avgProg = Math.round(teamMembers.reduce((s, m) => s + m.progress, 0) / teamMembers.length);
    const buckets = [
      { label: 'On Track', count: teamMembers.filter(m => m.progress >= 75).length, color: c.success },
      { label: 'In Progress', count: teamMembers.filter(m => m.progress >= 40 && m.progress < 75).length, color: c.info },
      { label: 'At Risk', count: teamMembers.filter(m => m.progress < 40).length, color: c.danger },
    ];
    return (
    <div>
      <PageHeader title="Team Progress" subtitle="Track learning across your team" />

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 'calc(50% - 8px)' : '220px'}, 1fr))`, gap: 16, marginBottom: tokens.space[6] }}>
        <StatCard label="Team Members" value={teamMembers.length} icon={Users} color={c.primarySolid} />
        <StatCard label="Avg Progress" value={avgProg + '%'} icon={TrendingUp} color={c.success} />
        <StatCard label="Active Now" value={teamMembers.filter(m => m.status === 'online').length} icon={Eye} color={c.info} />
        <StatCard label="At Risk" value={teamMembers.filter(m => m.progress < 40).length} icon={AlertCircle} color={c.warning} />
      </div>

      {/* Visual distribution bar */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: c.text }}>Progress Distribution</h3>
          <span style={{ fontSize: 12, color: c.textSubtle }}>{teamMembers.length} members</span>
        </div>
        <div style={{ display: 'flex', height: 20, borderRadius: tokens.radius.full, overflow: 'hidden', gap: 2 }}>
          {buckets.filter(b => b.count > 0).map(b => (
            <div key={b.label} title={`${b.label}: ${b.count}`} style={{ flex: b.count, background: b.color, transition: 'flex 0.5s ease', minWidth: 4 }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
          {buckets.map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color, flexShrink: 0 }} />
              <span style={{ color: c.textMuted, fontWeight: 600 }}>{b.label}</span>
              <span style={{ color: c.text, fontWeight: 700 }}>{b.count}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
            <span style={{ color: c.textSubtle, fontWeight: 600 }}>Team average</span>
            <span style={{ color: c.primarySolid, fontWeight: 700 }}>{avgProg}%</span>
          </div>
          <ProgressBar value={avgProg} />
        </div>
      </Card>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {teamMembers.map(m => (
            <Card key={m.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name={m.name} size={42} online={m.status === 'online'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: c.text, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: c.textSubtle }}>{m.email}</div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: c.textSubtle, fontWeight: 600 }}>Progress</span>
                  <span style={{ color: c.text, fontWeight: 700 }}>{m.progress}%</span>
                </div>
                <ProgressBar value={m.progress} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: c.textSubtle }}>
                <span>{m.completed}/{m.total} courses</span>
                <span>{m.lastActive}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: c.bgSubtle }}>
                  {['Member', 'Role', 'Progress', 'Courses', 'Last Active', ''].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((m, i) => (
                  <tr key={m.id} style={{ borderTop: `1px solid ${c.border}` }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={m.name} size={36} online={m.status === 'online'} />
                        <div>
                          <div style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: c.textSubtle }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}><Badge>{m.role}</Badge></td>
                    <td style={{ padding: '14px 20px', minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={m.progress} /></div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: c.text, minWidth: 36 }}>{m.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13.5, color: c.textMuted, fontWeight: 600 }}>{m.completed}/{m.total}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: c.textMuted }}>{m.lastActive}</td>
                    <td style={{ padding: '14px 20px' }}><Button size="sm" variant="ghost">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — ASSIGN TRAINING (admin)
     ════════════════════════════════════════════════════════════════════ */
  const [assignments, setAssignments] = useState([
    { id: 1, course: 'Compliance & Legal Requirements', assignee: 'All Consultants', dueDate: 'Jan 31, 2024', status: 'active' },
    { id: 2, course: 'Student Application Processing', assignee: 'New Hires', dueDate: 'Feb 15, 2024', status: 'active' },
  ]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ course: '', assignee: '', dueDate: '' });
  const [progressAssignment, setProgressAssignment] = useState(null);

  const AssignTrainingPage = () => (
    <div>
      <PageHeader title="Assign Training" subtitle="Assign mandatory courses to teams or individuals">
        <Button icon={Plus} onClick={() => setShowAssignModal(true)}>New Assignment</Button>
      </PageHeader>

      {assignments.length === 0 ? (
        <Card><EmptyState icon={ClipboardList} title="No active assignments" description="Create one to keep your team's learning on track." action={<Button icon={Plus} onClick={() => setShowAssignModal(true)}>New assignment</Button>} /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100%' : 320}px, 1fr))`, gap: 14 }}>
          {assignments.map(a => (
            <Card key={a.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: tokens.radius.md, background: c.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={20} color={c.primarySolid} />
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: c.text }}>{a.course}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: c.textSubtle }}>Assignee</span>
                  <span style={{ color: c.text, fontWeight: 600 }}>{a.assignee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: c.textSubtle }}>Due</span>
                  <span style={{ color: c.text, fontWeight: 600 }}>{a.dueDate}</span>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <Button size="sm" variant="outline" block onClick={() => setProgressAssignment(a)}>View Progress</Button>
                <IconButton size="sm" icon={Trash2} ariaLabel="Delete assignment"
                  onClick={() => confirm({
                    title: 'Delete this assignment?',
                    message: `"${a.course}" assigned to ${a.assignee} will be removed.`,
                    variant: 'danger',
                    onConfirm: () => { setAssignments(prev => prev.filter(x => x.id !== a.id)); toast('Assignment deleted'); },
                  })} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)}
        title="New Training Assignment" subtitle="Assign a course to a group or individual" size="md"
        footer={<>
          <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button icon={Send} onClick={() => {
            if (!assignForm.course || !assignForm.assignee || !assignForm.dueDate) { toast('Please complete all fields', 'danger'); return; }
            setAssignments(prev => [...prev, { id: Date.now(), ...assignForm, status: 'active' }]);
            setShowAssignModal(false); setAssignForm({ course: '', assignee: '', dueDate: '' });
            toast('Assignment created');
          }}>Create assignment</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Course</label>
            <Select value={assignForm.course} onChange={e => setAssignForm({ ...assignForm, course: e.target.value })}>
              <option value="">Select a course…</option>
              {courses.map(co => <option key={co.id}>{co.title}</option>)}
            </Select></div>
          <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Assignee</label>
            <Input placeholder="e.g. All Consultants, New Hires" value={assignForm.assignee} onChange={e => setAssignForm({ ...assignForm, assignee: e.target.value })} /></div>
          <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Due Date</label>
            <Input type="date" value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} /></div>
        </div>
      </Modal>

      {/* View Progress modal */}
      <Modal open={!!progressAssignment} onClose={() => setProgressAssignment(null)}
        title={progressAssignment?.course} subtitle={progressAssignment ? `Assigned to ${progressAssignment.assignee} • Due ${progressAssignment.dueDate}` : ''} size="lg"
        footer={<Button onClick={() => setProgressAssignment(null)}>Close</Button>}>
        {progressAssignment && (() => {
          /* derive a mock per-person progress from teamMembers */
          const rows = teamMembers.map(m => {
            const pct = Math.max(0, Math.min(100, m.progress + (m.id * 7) % 25 - 10));
            return {
              name: m.name, email: m.email, role: m.role,
              progress: pct,
              status: pct === 100 ? 'completed' : pct === 0 ? 'not-started' : 'in-progress',
              lastActive: m.lastActive,
            };
          });
          const totals = {
            assigned: rows.length,
            completed: rows.filter(r => r.status === 'completed').length,
            inProgress: rows.filter(r => r.status === 'in-progress').length,
            notStarted: rows.filter(r => r.status === 'not-started').length,
          };
          const avg = Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length);
          return (
            <div>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '45%' : 150}px, 1fr))`, gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Assigned', value: totals.assigned, color: c.primarySolid },
                  { label: 'Completed', value: totals.completed, color: c.success },
                  { label: 'In Progress', value: totals.inProgress, color: c.info },
                  { label: 'Not Started', value: totals.notStarted, color: c.warning },
                ].map(s => (
                  <div key={s.label} style={{ padding: 12, background: c.bgSubtle, borderRadius: tokens.radius.md, borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 18, padding: 14, background: c.primaryLight, borderRadius: tokens.radius.md }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.primarySolid }}>Team average</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: c.primarySolid }}>{avg}%</span>
                </div>
                <ProgressBar value={avg} />
              </div>

              {/* Per-person list */}
              <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>Individual progress</h4>
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {rows.map(r => (
                    <div key={r.email} style={{ padding: 12, border: `1px solid ${c.border}`, borderRadius: tokens.radius.md }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Avatar name={r.name} size={32} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: c.text, fontSize: 13.5 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: c.textSubtle }}>{r.role}</div>
                        </div>
                        <StatusPill status={r.status === 'completed' ? 'approved' : r.status === 'not-started' ? 'pending' : 'review'} size="sm" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={r.progress} /></div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.text, minWidth: 36, textAlign: 'right' }}>{r.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${c.border}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
                  {rows.map((r, i) => (
                    <div key={r.email} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: i > 0 ? `1px solid ${c.border}` : 'none', background: i % 2 ? c.bgSubtle : 'transparent' }}>
                      <Avatar name={r.name} size={34} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: c.text, fontSize: 13.5 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: c.textSubtle }}>{r.role} • Active {r.lastActive}</div>
                      </div>
                      <div style={{ width: 180, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={r.progress} /></div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: c.text, minWidth: 36, textAlign: 'right' }}>{r.progress}%</span>
                      </div>
                      <StatusPill status={r.status === 'completed' ? 'approved' : r.status === 'not-started' ? 'pending' : 'review'} size="sm" />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="outline" icon={Send} size="sm" onClick={() => { toast('Reminder sent to non-completers'); }}>Remind non-completers</Button>
                <Button variant="ghost" icon={Download} size="sm" onClick={() => toast('Report exported')}>Export report</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════
     PAGE — COURSE REVIEWS (admin)
     ════════════════════════════════════════════════════════════════════ */
  const AdminCourseReviewsPage = () => {
    const all = courseReviews;
    const overallAvg = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1) : '—';
    const coursesWithReviews = [...new Set(all.map(r => r.courseId))].map(id => {
      const co = courses.find(x => x.id === id);
      const rs = all.filter(r => r.courseId === id);
      return { ...co, avg: (rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(1), count: rs.length };
    });

    return (
      <div>
        <PageHeader title="Course Reviews" subtitle="Monitor learner feedback across all courses" />

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 'calc(50% - 8px)' : 220}px, 1fr))`, gap: 16, marginBottom: tokens.space[6] }}>
          <StatCard label="Total Reviews" value={all.length} icon={MessageSquare} color={c.primarySolid} />
          <StatCard label="Avg Rating" value={overallAvg} icon={Star} color={c.warning} />
          <StatCard label="Courses Rated" value={coursesWithReviews.length} icon={BookOpen} color={c.success} />
          <StatCard label="Helpful Votes" value={all.reduce((s, r) => s + (r.helpful || 0), 0)} icon={Check} color={c.info} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr', gap: 16 }}>
          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Top Rated Courses</h3>
            {coursesWithReviews.sort((a, b) => b.avg - a.avg).map((co, i) => (
              <div key={co.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? `1px solid ${c.border}` : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: tokens.radius.sm, background: i === 0 ? c.warningLight : c.bgSubtle, color: i === 0 ? c.warningText : c.textSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: c.text, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{co.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <StarRating value={parseFloat(co.avg)} size={11} />
                    <span style={{ fontSize: 11, color: c.textSubtle }}>{co.avg} • {co.count} review{co.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Recent Reviews</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {all.slice(0, 5).map((r, i) => {
                const co = courses.find(x => x.id === r.courseId);
                return (
                  <div key={i} style={{ padding: 14, background: c.bgSubtle, borderRadius: tokens.radius.md, borderLeft: `3px solid ${r.rating >= 4 ? c.success : r.rating === 3 ? c.warning : c.danger}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={r.userName} size={28} />
                        <div>
                          <div style={{ fontWeight: 600, color: c.text, fontSize: 13 }}>{r.userName}</div>
                          <div style={{ fontSize: 11, color: c.textSubtle }}>{co?.title}</div>
                        </div>
                      </div>
                      <StarRating value={r.rating} size={12} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: c.textMuted, lineHeight: 1.5 }}>{r.feedback}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — CONTENT MANAGEMENT (admin)
     ════════════════════════════════════════════════════════════════════ */
  const [showAddContent, setShowAddContent] = useState(false);
  const [editContentId, setEditContentId] = useState(null);
  const [contentForm, setContentForm] = useState({ title: '', type: 'Article', status: 'draft' });

  const openEditContent = (item) => {
    setEditContentId(item.id);
    setContentForm({ title: item.title, type: item.type, status: item.status });
    setShowAddContent(true);
  };
  const closeContentModal = () => {
    setShowAddContent(false);
    setEditContentId(null);
    setContentForm({ title: '', type: 'Article', status: 'draft' });
  };
  const ContentManagementPage = () => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = useMemo(() => {
      let list = [...contentItems];
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(x => x.title.toLowerCase().includes(q) || x.author.toLowerCase().includes(q));
      }
      if (typeFilter !== 'all') list = list.filter(x => x.type === typeFilter);
      if (statusFilter !== 'all') list = list.filter(x => x.status === statusFilter);
      return list;
    }, [search, typeFilter, statusFilter]);

    const types = ['all', ...new Set(contentItems.map(x => x.type))];

    return (
      <div>
        <PageHeader title="Content Management" subtitle="Manage all content across the platform">
          <Button icon={Plus} onClick={() => setShowAddContent(true)}>New Content</Button>
        </PageHeader>

        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 180px 180px', gap: 10 }}>
            <Input icon={Search} placeholder="Search content…" value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
            </Select>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="published">Published</option>
            </Select>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card><EmptyState icon={Search} title="No matching content" description="Try a different search term or clear filters." action={<Button onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}>Clear all</Button>} /></Card>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(item => (
              <Card key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: c.text, fontSize: 14, flex: 1 }}>{item.title}</div>
                  <StatusPill status={item.status} size="sm" />
                </div>
                <div style={{ fontSize: 12, color: c.textSubtle, marginBottom: 10 }}>{item.type} • {item.author} • {item.created}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="outline" icon={Edit2} block onClick={() => openEditContent(item)}>Edit</Button>
                  <IconButton icon={Trash2} ariaLabel="Delete content" size="sm"
                    onClick={() => confirm({
                      title: 'Delete this content?', message: `"${item.title}" will be permanently removed.`, variant: 'danger',
                      onConfirm: () => { setContentItems(prev => prev.filter(x => x.id !== item.id)); toast('Content deleted'); },
                    })} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padded={false}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: c.bgSubtle }}>
                    {['Title', 'Type', 'Status', 'Author', 'Created', 'Views', ''].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={item.id} style={{ borderTop: `1px solid ${c.border}` }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: c.text, fontSize: 14 }}>{item.title}</td>
                      <td style={{ padding: '14px 20px' }}><Badge>{item.type}</Badge></td>
                      <td style={{ padding: '14px 20px' }}><StatusPill status={item.status} /></td>
                      <td style={{ padding: '14px 20px', color: c.textMuted, fontSize: 13 }}>{item.author}</td>
                      <td style={{ padding: '14px 20px', color: c.textSubtle, fontSize: 13 }}>{item.created}</td>
                      <td style={{ padding: '14px 20px', color: c.textMuted, fontSize: 13, fontWeight: 600 }}>{item.views.toLocaleString()}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <IconButton icon={Edit2} ariaLabel="Edit" size="sm" onClick={() => openEditContent(item)} />
                          <IconButton icon={Trash2} ariaLabel="Delete" size="sm"
                            onClick={() => confirm({
                              title: 'Delete this content?', message: `"${item.title}" will be permanently removed. This action cannot be undone.`, variant: 'danger',
                              onConfirm: () => { setContentItems(prev => prev.filter(x => x.id !== item.id)); toast('Content deleted'); },
                            })} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Modal open={showAddContent} onClose={closeContentModal}
          title={editContentId ? 'Edit Content' : 'Create New Content'}
          subtitle={editContentId ? 'Update the title, type, or status' : 'Add a new article, course, tutorial, or document'} size="md"
          footer={<>
            <Button variant="outline" onClick={closeContentModal}>Cancel</Button>
            <Button icon={editContentId ? Save : Plus} onClick={() => {
              if (!contentForm.title.trim()) { toast('Title is required', 'danger'); return; }
              if (editContentId) {
                setContentItems(prev => prev.map(x => x.id === editContentId ? { ...x, ...contentForm } : x));
                toast('Content updated');
              } else {
                setContentItems(prev => [{ id: Date.now(), ...contentForm, author: currentUser?.name, created: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), views: 0 }, ...prev]);
                toast('Content created');
              }
              closeContentModal();
            }}>{editContentId ? 'Save Changes' : 'Create'}</Button>
          </>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Title</label>
              <Input placeholder="Enter content title…" value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} /></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Type</label>
              <Select value={contentForm.type} onChange={e => setContentForm({ ...contentForm, type: e.target.value })}>
                <option>Article</option><option>Course</option><option>Tutorial</option><option>Document</option>
              </Select></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Status</label>
              <Select value={contentForm.status} onChange={e => setContentForm({ ...contentForm, status: e.target.value })}>
                <option value="draft">Draft</option><option value="review">In Review</option><option value="published">Published</option>
              </Select></div>
          </div>
        </Modal>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — ADMIN SETTINGS
     ════════════════════════════════════════════════════════════════════ */

  /* Per-user permission override modal */
  const UserPermModal = ({ user, onClose }) => {
    const roleDefaultId = { admin:'full', manager:'manager', consultant:'consultant' }[user.role] || 'consultant';
    const saved = userPermOverrides[user.id] || { setId: null, overrides: {} };
    const [local, setLocal] = useState(saved);

    const activeSetId = local.setId || roleDefaultId;
    const activeSet   = permSets.find(s => s.id === activeSetId);

    const effectivePerm = (modId, permId) => {
      if (local.overrides[modId]?.[permId] !== undefined) return local.overrides[modId][permId];
      return activeSet?.perms[modId]?.[permId] ?? false;
    };

    const toggleOverride = (modId, permId) => {
      const current  = effectivePerm(modId, permId);
      const setVal   = activeSet?.perms[modId]?.[permId] ?? false;
      setLocal(prev => {
        const ov = JSON.parse(JSON.stringify(prev.overrides));
        if (!ov[modId]) ov[modId] = {};
        if (!current === setVal) { delete ov[modId][permId]; if (!Object.keys(ov[modId]).length) delete ov[modId]; }
        else ov[modId][permId] = !current;
        return { ...prev, overrides: ov };
      });
    };

    const save = () => {
      setUserPermOverrides(prev => ({ ...prev, [user.id]: local }));
      toast(`Permissions saved for ${user.name}`);
      onClose();
    };

    const roleDefaultLabel = permSets.find(s => s.id === roleDefaultId)?.label || '';

    return (
      <Modal open={true} onClose={onClose} size="xl"
        footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button icon={Save} onClick={save}>Save Permissions</Button></>}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${c.border}` }}>
          <Avatar name={user.name} size={48} color={user.role==='admin' ? c.danger : user.role==='manager' ? c.info : c.primarySolid} />
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:c.text }}>{user.name}'s Permissions</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
              <Badge variant={user.role==='admin'?'danger':user.role==='manager'?'info':'primary'}>{roleConfig[user.role]?.label}</Badge>
              <span style={{ fontSize:12, color:c.textSubtle }}>• {user.email}</span>
            </div>
          </div>
        </div>

        {/* Role default info */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:c.infoLight, borderRadius:tokens.radius.md, marginBottom:20, fontSize:13 }}>
          <AlertCircle size={15} color={c.infoText} />
          <span style={{ color:c.infoText }}>
            <strong>Role default:</strong> {roleConfig[user.role]?.label} → <strong>{roleDefaultLabel}</strong>.{' '}
            {local.setId ? `Using custom set: ${activeSet?.label}.` : 'Using role default.'}
          </span>
        </div>

        {/* Permission set assignment */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:c.textSubtle, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Permission Set Assignment</div>
          <div className="pills-row" style={{ flexWrap:'wrap' }}>
            <button onClick={() => setLocal(p=>({...p,setId:null}))}
              style={{ padding:'8px 14px', border:`2px solid ${!local.setId?c.primarySolid:c.border}`, borderRadius:tokens.radius.md, background:!local.setId?c.primaryLight:'transparent', color:!local.setId?c.primarySolid:c.textMuted, fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', minHeight:38 }}>
              ↺ Use Role Default {!local.setId && '✓'}
            </button>
            {permSets.map(set => (
              <button key={set.id} onClick={() => setLocal(p=>({...p,setId:set.id}))}
                style={{ padding:'8px 14px', border:`2px solid ${local.setId===set.id?c.primarySolid:c.border}`, borderRadius:tokens.radius.md, background:local.setId===set.id?c.primaryLight:'transparent', color:local.setId===set.id?c.primarySolid:c.textMuted, fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', minHeight:38 }}>
                {set.label}
                {set.id===roleDefaultId && <span style={{ fontSize:9, padding:'1px 5px', background:c.bgSubtle, borderRadius:3, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase' }}>Role Default</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Individual overrides */}
        <div style={{ fontSize:11, fontWeight:700, color:c.textSubtle, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Individual Permission Overrides</div>
        <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr', gap:14 }}>
          {permissionModules.map(mod => {
            const ModIcon = mod.icon;
            const allPerms = [{ id:mod.base.id, label:mod.base.label, isBase:true }, ...mod.granular.map(g=>({...g, isBase:false}))];
            return (
              <div key={mod.id} style={{ border:`1px solid ${c.border}`, borderRadius:tokens.radius.md, overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', background:c.bgSubtle, borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', gap:8 }}>
                  <ModIcon size={14} color={c.primarySolid} />
                  <span style={{ fontWeight:700, color:c.text, fontSize:13 }}>{mod.label}</span>
                </div>
                {allPerms.map((perm,idx) => {
                  const eff = effectivePerm(mod.id, perm.id);
                  const setVal = activeSet?.perms[mod.id]?.[perm.id] ?? false;
                  const hasOv  = local.overrides[mod.id]?.[perm.id] !== undefined;
                  return (
                    <div key={perm.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', borderTop:idx>0?`1px solid ${c.border}`:'none' }}>
                      <div style={{ minWidth:0, paddingRight:10 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:c.text }}>{perm.label}</div>
                        <div style={{ fontSize:10.5, color:hasOv?c.warningText:c.textSubtle, marginTop:1 }}>
                          {hasOv ? `Overridden: ${eff?'Enabled':'Disabled'}` : `From ${activeSet?.label||'role default'}: ${setVal?'Enabled':'Disabled'}`}
                        </div>
                      </div>
                      <button onClick={() => toggleOverride(mod.id, perm.id)}
                        style={{ width:40, height:22, borderRadius:11, border:hasOv?`2px solid ${c.warning}`:'none', cursor:'pointer', background:eff?c.primarySolid:c.borderStrong, position:'relative', flexShrink:0, transition:tokens.transition }}>
                        <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', position:'absolute', top:hasOv?2:4, left:eff?(hasOv?20:22):3, transition:'left 0.15s' }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Modal>
    );
  };

  const AdminSettingsPage = () => {
    const [section, setSection] = useState('platform');
    const [selSetId, setSelSetId]     = useState('full');
    const [selModId, setSelModId]     = useState('courses');

    const selSet = permSets.find(s => s.id === selSetId);
    const selMod = permissionModules.find(m => m.id === selModId);

    const countEnabled = (set) => permissionModules.reduce((n, mod) => {
      if (set.perms[mod.id]?.[mod.base.id]) n++;
      mod.granular.forEach(g => { if (set.perms[mod.id]?.[g.id]) n++; });
      return n;
    }, 0);

    const togglePerm = (modId, permId, val) => {
      if (selSet?.locked) return;
      setPermSets(prev => prev.map(s => s.id !== selSetId ? s : { ...s, perms: { ...s.perms, [modId]: { ...s.perms[modId], [permId]: val } } }));
    };

    const MiniToggle = ({ on, onChange, disabled }) => (
      <button onClick={onChange} disabled={disabled}
        style={{ width:44, height:24, borderRadius:12, border:'none', cursor:disabled?'default':'pointer', background:on?c.primarySolid:c.borderStrong, position:'relative', transition:tokens.transition, flexShrink:0 }}>
        <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:on?23:3, transition:'left 0.15s' }} />
      </button>
    );

    return (
      <div>
        <PageHeader title="Platform Settings" subtitle="Configure platform-wide settings and users" />

        <Card>
          <Tabs value={section} onChange={setSection} tabs={[
            { id:'platform', label:'Platform' },
            { id:'users',    label:'Users', count:allUsers.length },
            { id:'permissions', label:'Permissions' },
          ]} />
          {section === 'platform' && (
            <div>
              <Toggle checked={true} onChange={() => {}} label="Enable Public Catalog" description="Show course catalog to logged-in users by default" />
              <Toggle checked={true} onChange={() => {}} label="Require Admin Approval" description="New content must be approved before publishing" />
              <Toggle checked={false} onChange={() => {}} label="Allow Self-Enrolment" description="Let users enrol in optional courses on their own" />
              <Toggle checked={true} onChange={() => {}} label="Email Notifications" description="Send platform updates by email" />
            </div>
          )}
          {section === 'users' && (
            <>
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {allUsers.map(u => (
                    <Card key={u.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={u.name} size={36} />
                          <div>
                            <div style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: c.textSubtle }}>{u.email}</div>
                          </div>
                        </div>
                        <Badge variant={u.status === 'active' ? 'success' : 'neutral'}>{u.status}</Badge>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:c.textSubtle, marginBottom:8 }}>
                        <span>{roleConfig[u.role]?.label}</span>
                        <span>{u.lastActive}</span>
                      </div>
                      <button onClick={() => setEditPermUser(u)}
                        style={{ width:'100%', padding:'7px 0', border:`1px solid ${c.primarySolid}`, borderRadius:tokens.radius.sm, background:'transparent', color:c.primarySolid, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                        Edit Permissions
                      </button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: c.bgSubtle }}>
                      {['User', 'Role', 'Status', 'Joined', 'Last Active', ''].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{allUsers.map(u => (
                      <tr key={u.id} style={{ borderTop: `1px solid ${c.border}` }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={u.name} size={32} />
                            <div><div style={{ fontWeight: 600, color: c.text, fontSize: 13.5 }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: c.textSubtle }}>{u.email}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'manager' ? 'info' : 'primary'}>{roleConfig[u.role]?.label}</Badge></td>
                        <td style={{ padding: '12px 16px' }}><Badge variant={u.status === 'active' ? 'success' : 'neutral'}>{u.status}</Badge></td>
                        <td style={{ padding: '12px 16px', color: c.textMuted, fontSize: 13 }}>{u.joined}</td>
                        <td style={{ padding: '12px 16px', color: c.textSubtle, fontSize: 13 }}>{u.lastActive}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => setEditPermUser(u)}
                              style={{ padding:'5px 10px', border:`1px solid ${c.primarySolid}`, borderRadius:tokens.radius.sm, background:'transparent', color:c.primarySolid, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                              Permissions
                            </button>
                            <button onClick={() => { setAllUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x)); toast(`User ${u.status === 'active' ? 'deactivated' : 'activated'}`); }}
                              style={{ padding: '5px 10px', border: `1px solid ${c.border}`, borderRadius: tokens.radius.sm, background: 'transparent', color: c.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {section === 'permissions' && (
            <div>
              {/* Permission set cards */}
              <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill, minmax(${isMobile?'100%':220}px,1fr))`, gap:12, marginBottom:24 }}>
                {permSets.map(set => {
                  const n = countEnabled(set);
                  const active = selSetId === set.id;
                  return (
                    <div key={set.id} onClick={() => setSelSetId(set.id)} role="button" tabIndex={0}
                      onKeyDown={e => e.key==='Enter' && setSelSetId(set.id)}
                      style={{ padding:16, borderRadius:tokens.radius.lg, cursor:'pointer', border:`2px solid ${active?c.primarySolid:c.border}`, background:active?c.primaryLight:c.surface, transition:tokens.transition }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div style={{ width:36, height:36, borderRadius:tokens.radius.md, background:active?c.primarySolid:c.bgSubtle, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Shield size={17} color={active?'#fff':c.textSubtle} />
                        </div>
                        {set.locked && <CheckCircle size={15} color={c.primarySolid} />}
                      </div>
                      <div style={{ fontWeight:700, color:c.text, fontSize:14, marginBottom:3 }}>{set.label}</div>
                      <div style={{ fontSize:11.5, color:c.textSubtle, marginBottom:8, lineHeight:1.4 }}>{set.desc}</div>
                      <div style={{ fontSize:11, color:c.textSubtle, fontWeight:600 }}>{n} permissions enabled</div>
                    </div>
                  );
                })}
                {/* Add new */}
                <div onClick={() => toast('Custom permission sets coming soon')} role="button" tabIndex={0}
                  style={{ padding:16, borderRadius:tokens.radius.lg, border:`2px dashed ${c.border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', minHeight:130, gap:6 }}>
                  <Plus size={20} color={c.textSubtle} />
                  <div style={{ fontWeight:600, color:c.textMuted, fontSize:13 }}>Add New Permission Group</div>
                  <div style={{ fontSize:11, color:c.textSubtle }}>Create custom permission set</div>
                </div>
              </div>

              {selSet && (
                <div style={{ border:`1px solid ${c.border}`, borderRadius:tokens.radius.lg, overflow:'hidden' }}>
                  {/* Set header */}
                  <div style={{ padding:'14px 20px', background:c.bgSubtle, borderBottom:`1px solid ${c.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ fontWeight:700, color:c.text, fontSize:15 }}>{selSet.label}</div>
                      <div style={{ fontSize:12, color:c.textSubtle, marginTop:2 }}>{selSet.desc}</div>
                    </div>
                    {selSet.locked ? <Badge variant="primary">System Default</Badge> : <Button icon={Save} onClick={() => toast('Permission set saved')}>Save Changes</Button>}
                  </div>

                  {/* Legend */}
                  <div style={{ padding:'8px 20px', borderBottom:`1px solid ${c.border}`, display:'flex', gap:18, flexWrap:'wrap' }}>
                    {[['Module Access (Sidebar)',c.primarySolid],['Base Permission (Required)',c.success],['Dependent (Requires others)',c.secondary]].map(([lbl,col])=>(
                      <span key={lbl} style={{ fontSize:11, color:c.textSubtle, display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ width:10, height:10, borderRadius:2, background:col, display:'inline-block' }} />{lbl}
                      </span>
                    ))}
                  </div>

                  {/* Module list + detail */}
                  <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'200px 1fr' }}>
                    {/* Module list */}
                    <div style={{ borderRight:`1px solid ${c.border}` }}>
                      {permissionModules.map(mod => {
                        const baseOn = selSet.perms[mod.id]?.[mod.base.id];
                        const enabledCnt = permissionModules.find(m=>m.id===mod.id)
                          ? (baseOn?1:0) + mod.granular.filter(g=>selSet.perms[mod.id]?.[g.id]).length : 0;
                        const total = 1 + mod.granular.length;
                        const isActive = selModId === mod.id;
                        return (
                          <button key={mod.id} onClick={() => setSelModId(mod.id)}
                            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', border:'none', borderLeft:`3px solid ${isActive?c.primarySolid:'transparent'}`, background:isActive?c.primaryLight:'transparent', cursor:'pointer', textAlign:'left' }}>
                            <button onClick={e=>{e.stopPropagation();if(!selSet.locked)togglePerm(mod.id,mod.base.id,!baseOn);}}
                              style={{ width:34, height:18, borderRadius:9, border:'none', cursor:selSet.locked?'default':'pointer', background:baseOn?c.primarySolid:c.borderStrong, position:'relative', flexShrink:0 }}>
                              <div style={{ width:12, height:12, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:baseOn?19:3, transition:'left 0.15s' }} />
                            </button>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:12.5, fontWeight:isActive?700:600, color:isActive?c.primarySolid:c.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{mod.label}</div>
                              <div style={{ fontSize:10, color:c.textSubtle }}>{enabledCnt}/{total} permissions</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Permission detail */}
                    {selMod && (
                      <div style={{ padding:20 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                          <div style={{ width:40, height:40, borderRadius:tokens.radius.md, background:c.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <selMod.icon size={20} color={c.primarySolid} />
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:c.text, fontSize:15 }}>{selMod.label}</div>
                            <div style={{ fontSize:12, color:c.textSubtle }}>Manage module access and granular permissions</div>
                          </div>
                        </div>

                        {/* Base permission */}
                        <div style={{ fontSize:10, fontWeight:700, color:c.textSubtle, textTransform:'uppercase', letterSpacing:1, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:10, height:10, borderRadius:2, background:c.success, display:'inline-block' }} />Base Permission (Required for all others)
                        </div>
                        <div style={{ padding:14, border:`1px solid ${c.success}40`, borderRadius:tokens.radius.md, background:c.successLight, marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ fontWeight:700, color:c.text, fontSize:14 }}>{selMod.base.label}</span>
                              <span style={{ padding:'1px 7px', background:c.success, color:'#fff', borderRadius:tokens.radius.full, fontSize:9, fontWeight:700, textTransform:'uppercase' }}>Required</span>
                            </div>
                            <div style={{ fontSize:12, color:c.textSubtle, marginTop:3 }}>{selMod.base.desc}</div>
                          </div>
                          <MiniToggle on={!!selSet.perms[selMod.id]?.[selMod.base.id]} disabled={selSet.locked} onChange={() => togglePerm(selMod.id, selMod.base.id, !selSet.perms[selMod.id]?.[selMod.base.id])} />
                        </div>

                        {/* Granular permissions */}
                        <div style={{ fontSize:10, fontWeight:700, color:c.textSubtle, textTransform:'uppercase', letterSpacing:1, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:10, height:10, borderRadius:2, background:c.secondary, display:'inline-block' }} />Granular Permissions (Depends on base)
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?'100%':240}px,1fr))`, gap:10 }}>
                          {selMod.granular.map(perm => {
                            const on    = !!selSet.perms[selMod.id]?.[perm.id];
                            const baseOn= !!selSet.perms[selMod.id]?.[selMod.base.id];
                            return (
                              <div key={perm.id} style={{ padding:14, border:`1px solid ${c.border}`, borderRadius:tokens.radius.md, background:c.surface, opacity:baseOn?1:0.5 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                                  <div>
                                    <div style={{ fontWeight:600, color:c.text, fontSize:13.5 }}>{perm.label}</div>
                                    <div style={{ fontSize:11.5, color:c.textSubtle, marginTop:2 }}>{perm.desc}</div>
                                  </div>
                                  <MiniToggle on={on && baseOn} disabled={selSet.locked || !baseOn} onChange={() => togglePerm(selMod.id, perm.id, !on)} />
                                </div>
                                <div style={{ fontSize:10, color:c.textSubtle }}>
                                  Requires:{' '}
                                  {perm.requires.map(r => (
                                    <span key={r} style={{ padding:'1px 6px', background:c.bgSubtle, borderRadius:3, fontSize:10, marginRight:3, fontWeight:600 }}>
                                      {r===selMod.base.id ? selMod.base.label : r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    );
  };


  /* ════════════════════════════════════════════════════════════════════
     PAGE — CERTIFICATES (with detail modal, expiry, share)
     ════════════════════════════════════════════════════════════════════ */
  const [activeCert, setActiveCert] = useState(null);
  const [certFilter, setCertFilter] = useState('all');

  const CertificatesPage = () => {
    const isAdmin = currentUser?.role === 'admin';
    const myCerts = isAdmin ? certificates : certificates.filter(cer => {
      if (currentUser?.role === 'manager') return cer.userRole === 'Admission Manager';
      return cer.userName === 'Simona';
    });

    const cats = ['all', ...new Set(myCerts.map(x => x.category))];
    const visible = certFilter === 'all' ? myCerts : myCerts.filter(x => x.category === certFilter);

    const downloadCert = (cert) => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${cert.credentialId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#F1F4F3;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:32px}
    .cert{background:#fff;width:780px;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(4,93,94,.15);position:relative;border:1px solid #e2e8f0}
    .cert::after{content:'';position:absolute;inset:10px;border:1.5px solid rgba(4,93,94,.12);border-radius:6px;pointer-events:none}
    .top-bar{height:8px;background:linear-gradient(90deg,#045D5E,#FC7300)}
    .bottom-bar{height:8px;background:linear-gradient(90deg,#FC7300,#045D5E)}
    .body{padding:44px 56px 36px;text-align:center}
    .brand{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:24px}
    .brand-name{font-size:18px;font-weight:900;color:#045D5E;letter-spacing:1.5px;text-transform:uppercase}
    .brand-sub{font-size:10px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:2px}
    .cert-title{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:14px}
    .divider{display:flex;align-items:center;gap:10px;margin:0 auto 28px;max-width:420px}
    .divider-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(4,93,94,.35))}
    .divider-line.r{background:linear-gradient(270deg,transparent,rgba(4,93,94,.35))}
    .certifies{font-size:11px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
    .recipient{font-size:42px;font-weight:900;color:#0f172a;letter-spacing:-1px;line-height:1;padding-bottom:12px;border-bottom:2.5px solid #FC7300;display:inline-block;margin-bottom:16px}
    .completed{font-size:11px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
    .course{font-size:20px;font-weight:800;color:#045D5E;line-height:1.3;margin-bottom:28px;max-width:500px;margin-left:auto;margin-right:auto}
    .seal{width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#045D5E,#034849);border:3px solid #FC7300;box-shadow:0 0 0 5px rgba(4,93,94,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 32px}
    .seal-icon{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid #e2e8f0;padding-top:24px}
    .meta-item{padding:0 12px;text-align:center;border-right:1px solid #e2e8f0}
    .meta-item:last-child{border-right:none}
    .meta-val{font-size:13px;font-weight:700;color:#0f172a}
    .meta-key{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-top:3px}
    .verify{margin-top:20px;font-size:10px;color:#94a3b8;letter-spacing:.5px}
    .verify span{color:#045D5E;font-weight:600}
  </style>
</head>
<body>
  <div class="cert">
    <div class="top-bar"></div>
    <div class="body">
      <div class="brand">
        <svg width="36" height="40" viewBox="0 0 100 110" fill="none">
          <defs><linearGradient id="g" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0a9396"/><stop offset="100%" stop-color="#057a7b"/></linearGradient></defs>
          <path d="M8 14 L8 72 Q8 106 50 106 Q92 106 92 72 L92 14 L70 14 L70 72 Q70 84 50 84 Q30 84 30 72 L30 14 Z" fill="url(#g)"/>
          <rect x="8" y="8" width="22" height="22" rx="11" fill="url(#g)"/>
          <rect x="70" y="8" width="22" height="22" rx="11" fill="url(#g)"/>
          <path d="M50 25 C46 25 30 27 26 34 L26 66 C30 60 46 59 50 59 Z" fill="white"/>
          <path d="M50 25 C54 25 70 27 74 34 L74 66 C70 60 54 59 50 59 Z" fill="rgba(255,255,255,0.72)"/>
          <path d="M50 0 L53 9 L63 9 L55 15 L58 24 L50 18 L42 24 L45 15 L37 9 L47 9 Z" fill="#FC7300"/>
        </svg>
        <div>
          <div class="brand-name">UAPP Academy</div>
          <div class="brand-sub">Knowledge Hub</div>
        </div>
      </div>
      <div class="cert-title">Certificate of Achievement</div>
      <div class="divider"><div class="divider-line"></div>★<div class="divider-line r"></div></div>
      <div class="certifies">This is to certify that</div>
      <div class="recipient">${cert.userName}</div>
      <div class="completed">has successfully completed</div>
      <div class="course">${cert.courseName}</div>
      <div class="seal"><div class="seal-icon">★</div></div>
      <div class="meta">
        <div class="meta-item"><div class="meta-val">${formatDate(cert.issuedDate)}</div><div class="meta-key">Issued On</div></div>
        <div class="meta-item"><div class="meta-val">${cert.credentialId}</div><div class="meta-key">Credential ID</div></div>
      </div>
      <div class="verify">Verify at <span>uapp.academy/verify/${cert.credentialId}</span></div>
    </div>
    <div class="bottom-bar"></div>
  </div>
</body>
</html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${cert.credentialId}.html`; a.click();
      URL.revokeObjectURL(url);
      toast('Certificate downloaded');
    };

    return (
      <div>
        <PageHeader title={isAdmin ? 'All Certificates' : 'My Certificates'} subtitle={`${myCerts.length} certificate${myCerts.length === 1 ? '' : 's'} ${isAdmin ? 'issued' : 'earned'}`} />

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 'calc(50% - 8px)' : 220}px, 1fr))`, gap: 16, marginBottom: tokens.space[6] }}>
          {isAdmin ? (<>
            <StatCard label="Total Issued" value={myCerts.length} icon={Award} color={c.secondary} />
            <StatCard label="Distinctions" value={myCerts.filter(x => x.grade === 'Distinction').length} icon={Star} color={c.warning} />
            <StatCard label="Merits" value={myCerts.filter(x => x.grade === 'Merit').length} icon={TrendingUp} color={c.info} />
            <StatCard label="Unique Learners" value={new Set(myCerts.map(x => x.userName)).size} icon={Users} color={c.primarySolid} />
          </>) : (<>
            <StatCard label="Total Earned" value={myCerts.length} icon={Award} color={c.secondary} />
            <StatCard label="Courses Done" value={new Set(myCerts.map(x => x.courseId)).size} icon={CheckCircle} color={c.success} />
            <StatCard label="Categories" value={new Set(myCerts.map(x => x.category)).size} icon={Grid} color={c.info} />
            <StatCard label="Latest" value={myCerts.length ? formatDate(myCerts.slice().sort((a,b) => new Date(b.issuedDate)-new Date(a.issuedDate))[0].issuedDate) : '—'} icon={Calendar} color={c.primarySolid} />
          </>)}
        </div>

        <Card style={{ marginBottom: 20 }}>
          <div className="pills-row">
            {cats.map(cat => (
              <button key={cat} onClick={() => setCertFilter(cat)}
                style={{ padding: '7px 14px', border: 'none', borderRadius: tokens.radius.md, background: certFilter === cat ? c.primarySolid : c.bgSubtle, color: certFilter === cat ? '#fff' : c.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 38 }}>
                {cat === 'all' ? `All (${myCerts.length})` : `${cat} (${myCerts.filter(x => x.category === cat).length})`}
              </button>
            ))}
          </div>
        </Card>

        {visible.length === 0 ? (
          <Card><EmptyState icon={Award} title="No certificates yet" description="Complete courses to earn certificates." action={<Button icon={Compass} onClick={() => setCurrentPage('courses')}>Browse courses</Button>} /></Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(auto-fill, minmax(300px, 1fr))`, gap: isMobile ? 10 : 16 }}>
            {visible.map(cert => {
              return (
                <div key={cert.id} onClick={() => setActiveCert(cert)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveCert(cert); }}
                  style={{
                    background: '#fff', borderRadius: tokens.radius.lg, overflow: 'hidden',
                    border: `1px solid ${c.border}`, cursor: 'pointer',
                    boxShadow: tokens.shadow.xs,
                    transition: tokens.transition,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = tokens.shadow.md; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = tokens.shadow.xs; e.currentTarget.style.transform = 'none'; }}>
                  {/* Top gradient stripe */}
                  <div style={{ height: 5, background: `linear-gradient(90deg, ${c.primarySolid}, ${c.secondary})` }} />

                  <div style={{ padding: isMobile ? 12 : 18 }}>
                    {/* Brand header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 10 : 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UAPPLogo size={isMobile ? 20 : 26} />
                        {!isMobile && (
                          <div>
                            <div style={{ fontSize: 9.5, fontWeight: 800, color: c.primarySolid, letterSpacing: 1.2, textTransform: 'uppercase' }}>UAPP Academy</div>
                            <div style={{ fontSize: 8, color: c.textSubtle, letterSpacing: 0.8, textTransform: 'uppercase' }}>Knowledge Hub</div>
                          </div>
                        )}
                      </div>
                      <span style={{ padding: '2px 8px', background: c.primaryLight, color: c.primarySolid, borderRadius: tokens.radius.full, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, border: `1px solid ${c.primarySolid}30`, textTransform: 'uppercase' }}>{cert.category}</span>
                    </div>

                    {/* Ornamental divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: isMobile ? 10 : 14 }}>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${c.primarySolid}50, transparent)` }} />
                      <Award size={isMobile ? 11 : 13} color={c.secondary} />
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, ${c.primarySolid}50, transparent)` }} />
                    </div>

                    {/* Certificate body */}
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? 10 : 14 }}>
                      <div style={{ fontSize: isMobile ? 8.5 : 9.5, color: c.textSubtle, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>This certifies that</div>
                      <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 900, color: c.text, lineHeight: 1.1, marginBottom: 5, letterSpacing: -0.3 }}>{cert.userName}</div>
                      <div style={{ fontSize: isMobile ? 8.5 : 9.5, color: c.textSubtle, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>has successfully completed</div>
                      <div style={{ fontSize: isMobile ? 10.5 : 12.5, fontWeight: 700, color: c.primarySolid, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cert.courseName}</div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: isMobile ? 8 : 10, borderTop: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: isMobile ? 9 : 10, color: c.textSubtle }}>{formatDate(cert.issuedDate)}</span>
                      <span style={{ fontSize: 9, color: c.primarySolid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{cert.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certificate Detail Modal */}
        <Modal open={!!activeCert} onClose={() => setActiveCert(null)} size="lg"
          footer={activeCert && <>
            <Button variant="outline" icon={Copy} onClick={() => { navigator.clipboard?.writeText(activeCert.credentialId); toast('Credential ID copied'); }}>Copy ID</Button>
            <Button variant="outline" icon={Share2} onClick={() => toast('Verification link copied')}>Share</Button>
            <Button icon={Download} onClick={() => downloadCert(activeCert)}>Download</Button>
          </>}>
          {activeCert && (() => {
            return (
              <div>

                {/* ── Certificate paper ── */}
                <div style={{
                  background: '#fff', borderRadius: tokens.radius.lg, overflow: 'hidden',
                  border: `1px solid ${c.border}`, position: 'relative',
                  boxShadow: '0 4px 24px rgba(4,93,94,0.10)',
                }}>
                  {/* Inner frame line */}
                  <div style={{ position: 'absolute', inset: 10, border: `1.5px solid ${c.primarySolid}18`, borderRadius: 6, pointerEvents: 'none', zIndex: 1 }} />

                  {/* Top bar */}
                  <div style={{ height: 8, background: `linear-gradient(90deg, ${c.primarySolid}, ${c.secondary})` }} />

                  <div style={{ padding: isMobile ? '24px 20px 20px' : '32px 44px 28px', textAlign: 'center', position: 'relative', zIndex: 2 }}>

                    {/* Brand */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <UAPPLogo size={isMobile ? 32 : 42} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 900, color: c.primarySolid, letterSpacing: 1.5, textTransform: 'uppercase' }}>UAPP Academy</div>
                        <div style={{ fontSize: isMobile ? 8 : 9, color: c.textSubtle, letterSpacing: 2.5, textTransform: 'uppercase', marginTop: 2 }}>Knowledge Hub</div>
                      </div>
                    </div>

                    {/* Certificate title */}
                    <div style={{ fontSize: isMobile ? 10 : 11, letterSpacing: 3, textTransform: 'uppercase', color: c.textSubtle, fontWeight: 600, marginBottom: 14 }}>Certificate of Achievement</div>

                    {/* Ornamental divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto 22px', maxWidth: 380 }}>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c.primarySolid}50)` }} />
                      <Award size={16} color={c.secondary} />
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${c.primarySolid}50)` }} />
                    </div>

                    {/* Body */}
                    <div style={{ fontSize: 11, color: c.textSubtle, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>This is to certify that</div>
                    <div style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: c.text, letterSpacing: -0.5, lineHeight: 1.05, marginBottom: 14, display: 'inline-block', borderBottom: `3px solid ${c.secondary}`, paddingBottom: 10 }}>
                      {activeCert.userName}
                    </div>
                    <div style={{ fontSize: 11, color: c.textSubtle, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 14, marginBottom: 10 }}>has successfully completed</div>
                    <div style={{ fontSize: isMobile ? 15 : 20, fontWeight: 800, color: c.primarySolid, lineHeight: 1.3, marginBottom: 24, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
                      {activeCert.courseName}
                    </div>

                    {/* Completion seal */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                      <div style={{
                        width: isMobile ? 72 : 88, height: isMobile ? 72 : 88, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${c.primarySolid}, #034849)`,
                        border: `3px solid ${c.secondary}`,
                        boxShadow: `0 0 0 5px ${c.primarySolid}18`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Award size={isMobile ? 22 : 28} color="#fff" />
                      </div>
                    </div>

                    {/* Credential + date row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: `1px solid ${c.border}`, paddingTop: 20, marginBottom: 12 }}>
                      <div style={{ textAlign: 'center', borderRight: `1px solid ${c.border}`, paddingRight: 12 }}>
                        <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: c.text }}>{formatDate(activeCert.issuedDate)}</div>
                        <div style={{ fontSize: 9, color: c.textSubtle, letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 }}>Issued On</div>
                      </div>
                      <div style={{ textAlign: 'center', paddingLeft: 12 }}>
                        <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: c.primarySolid, wordBreak: 'break-all' }}>{activeCert.credentialId}</div>
                        <div style={{ fontSize: 9, color: c.textSubtle, letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 }}>Credential ID</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 10, color: c.textSubtle, textAlign: 'center' }}>
                      Verify at <span style={{ color: c.primarySolid, fontWeight: 600 }}>uapp.academy/verify/{activeCert.credentialId}</span>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div style={{ height: 8, background: `linear-gradient(90deg, ${c.secondary}, ${c.primarySolid})` }} />
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — PROFILE
     ════════════════════════════════════════════════════════════════════ */
  const ProfilePage = () => {
    const [edit, setEdit] = useState(false);
    const [profile, setProfile] = useState({
      name: currentUser?.name, email: currentUser?.name?.toLowerCase().replace(' ', '.') + '@uapp.com',
      phone: '+44 7700 900123', location: 'London, UK', bio: 'Passionate about education and helping students achieve their dreams.',
    });
    const [draft, setDraft] = useState(profile);
    const inProgress = courses.filter(x => x.progress > 0 && x.progress < 100).length;
    const completed = courses.filter(x => x.progress === 100).length;
    const hoursLogged = courses.reduce((sum, x) => sum + (x.progress > 0 ? parseFloat(x.duration) * (x.progress / 100) : 0), 0);

    const save = () => {
      if (!draft.name.trim()) { toast('Name is required', 'danger'); return; }
      setProfile(draft); setCurrentUser({ ...currentUser, name: draft.name });
      setEdit(false); toast('Profile updated');
    };

    return (
      <div>
        <PageHeader title="My Profile" subtitle="Manage your personal information">
          {!edit ? <Button icon={Edit2} onClick={() => { setDraft(profile); setEdit(true); }}>Edit Profile</Button> : (
            <><Button variant="outline" onClick={() => setEdit(false)}>Cancel</Button>
              <Button icon={Save} onClick={save}>Save Changes</Button></>
          )}
        </PageHeader>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 2fr', gap: 16 }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Avatar name={profile.name} size={88} color={c.primarySolid} />
              <h2 style={{ margin: '14px 0 4px', fontSize: 18, fontWeight: 800, color: c.text }}>{profile.name}</h2>
              <Badge variant={currentUser?.role === 'admin' ? 'danger' : currentUser?.role === 'manager' ? 'info' : 'primary'}>{roleConfig[currentUser?.role]?.label}</Badge>
              <p style={{ margin: '14px 0 0', fontSize: 13, color: c.textSubtle, lineHeight: 1.5 }}>{profile.bio}</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 18, paddingTop: 18, borderTop: `1px solid ${c.border}` }}>
                {[['In Progress', inProgress, c.primarySolid], ['Completed', completed, c.success], ['Hours', Math.round(hoursLogged) + 'h', c.secondary]].map(([k, v, col]) => (
                  <div key={k} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: col }}>{v}</div>
                    <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 2 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: c.text }}>Personal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Full Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Location', 'location']
              ].map(([label, key]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
                  {edit
                    ? <Input value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />
                    : <div style={{ padding: '10px 0', borderBottom: `1px solid ${c.border}`, color: c.text, fontWeight: 500, fontSize: 14 }}>{profile[key]}</div>}
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bio</label>
                {edit
                  ? <Textarea value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} rows={3} />
                  : <div style={{ padding: '10px 0', color: c.text, fontWeight: 500, fontSize: 14, lineHeight: 1.6 }}>{profile.bio}</div>}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     PAGE — USER SETTINGS
     ════════════════════════════════════════════════════════════════════ */
  const UserSettingsPage = () => {
    const [tab, setTab] = useState('notifications');
    return (
      <div>
        <PageHeader title="Settings" subtitle="Manage your account preferences" />
        <Card>
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'notifications', label: 'Notifications' }, { id: 'appearance', label: 'Appearance' },
            { id: 'privacy', label: 'Privacy' }, { id: 'language', label: 'Language' },
          ]} />
          {tab === 'notifications' && (
            <div>
              <Toggle checked={userSettings.emailNotifications} onChange={v => setUserSettings({ ...userSettings, emailNotifications: v })} label="Email Notifications" description="Get product updates and important emails" />
              <Toggle checked={userSettings.pushNotifications} onChange={v => setUserSettings({ ...userSettings, pushNotifications: v })} label="Push Notifications" description="Receive browser push notifications" />
              <Toggle checked={userSettings.weeklyDigest} onChange={v => setUserSettings({ ...userSettings, weeklyDigest: v })} label="Weekly Digest" description="A summary of activity, every Monday" />
            </div>
          )}
          {tab === 'appearance' && (
            <div>
              <Toggle checked={isDark} onChange={v => setUserSettings({ ...userSettings, darkMode: v })} label="Dark Mode" description="Easier on the eyes in low light" />
            </div>
          )}
          {tab === 'privacy' && (
            <div>
              <Toggle checked={true} onChange={() => {}} label="Profile visible to team" description="Let teammates see your name, role, and progress" />
              <Toggle checked={false} onChange={() => {}} label="Show learning activity" description="Allow your activity to appear on team dashboards" />
            </div>
          )}
          {tab === 'language' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Language</label>
                <Select value={userSettings.language} onChange={e => setUserSettings({ ...userSettings, language: e.target.value })}>
                  <option value="en">English (UK)</option><option value="es">Spanish</option><option value="fr">French</option>
                </Select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Timezone</label>
                <Select value={userSettings.timezone} onChange={e => setUserSettings({ ...userSettings, timezone: e.target.value })}>
                  <option value="UTC">UTC</option><option value="GMT">GMT (London)</option><option value="EST">EST (New York)</option>
                </Select>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     REVIEW MODAL — open helper + state
     ════════════════════════════════════════════════════════════════════ */
  const [reviewModalCourseId, setReviewModalCourseId] = useState(null);
  const [reviewStep, setReviewStep] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const reviewTextareaRef = useRef(null);

  const openReviewModal = (courseId) => {
    setReviewModalCourseId(courseId);
    setReviewStep(1); setReviewRating(0); setReviewHover(0); setReviewFeedback('');
  };
  const closeReviewModal = () => setReviewModalCourseId(null);

  const ReviewModalUI = () => {
    if (!reviewModalCourseId) return null;
    const course = courses.find(x => x.id === reviewModalCourseId);
    if (!course) return null;

    const submit = () => {
      const newReview = {
        courseId: course.id, userId: currentUser?.role, userName: currentUser?.name,
        userRole: roleConfig[currentUser?.role]?.label, rating: reviewRating, feedback: reviewFeedback,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        helpful: 0,
      };
      setCourseReviews(prev => [newReview, ...prev]);
      setReviewStep(3);
    };

    return (
      <Modal open={!!reviewModalCourseId} onClose={closeReviewModal} title={reviewStep === 3 ? 'Thanks for your feedback!' : 'Rate this course'} subtitle={reviewStep < 3 ? course.title : undefined} size="md"
        footer={
          reviewStep === 1 ? (
            <><Button variant="outline" onClick={closeReviewModal}>Cancel</Button>
              <Button disabled={!reviewRating} iconRight={ChevronRight} onClick={() => setReviewStep(2)}>Next</Button></>
          ) : reviewStep === 2 ? (
            <><Button variant="outline" icon={ChevronLeft} onClick={() => setReviewStep(1)}>Back</Button>
              <Button icon={Send} onClick={submit}>Submit review</Button></>
          ) : (<Button onClick={closeReviewModal}>Close</Button>)
        }>
        {reviewStep === 1 && (
          <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
            <p style={{ margin: '0 0 24px', color: c.textMuted, fontSize: 14 }}>How would you rate this course?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)} onClick={() => setReviewRating(s)} aria-label={`Rate ${s} of 5 stars`}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Star size={40} fill={s <= (reviewHover || reviewRating) ? c.warning : 'none'} color={s <= (reviewHover || reviewRating) ? c.warning : c.border} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: c.textSubtle, height: 18 }}>
              {(reviewHover || reviewRating) === 1 && 'Poor'}
              {(reviewHover || reviewRating) === 2 && 'Fair'}
              {(reviewHover || reviewRating) === 3 && 'Good'}
              {(reviewHover || reviewRating) === 4 && 'Very Good'}
              {(reviewHover || reviewRating) === 5 && 'Excellent!'}
            </div>
          </div>
        )}
        {reviewStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={22} fill={s <= reviewRating ? c.warning : 'none'} color={c.warning} strokeWidth={1.5} />)}
            </div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: c.text }}>Share your thoughts <span style={{ color: c.textSubtle, fontWeight: 500 }}>(optional)</span></label>
            <textarea ref={reviewTextareaRef} value={reviewFeedback} onChange={e => setReviewFeedback(e.target.value)} rows={5} placeholder="What did you find most useful? Anything that could be improved?"
              style={{ width: '100%', padding: 12, fontSize: 14, color: c.text, background: c.surface, border: `1px solid ${c.border}`, borderRadius: tokens.radius.md, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: c.textSubtle, textAlign: 'right', marginTop: 4 }}>{reviewFeedback.length} / 500</div>
          </div>
        )}
        {reviewStep === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.successLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <CheckCircle size={32} color={c.success} />
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c.text }}>Your review is in</h3>
            <p style={{ margin: '6px 0 0', color: c.textSubtle, fontSize: 14 }}>Reviews like yours help other learners discover great courses.</p>
          </div>
        )}
      </Modal>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     USER SWITCH PANEL
     ════════════════════════════════════════════════════════════════════ */
  const UserSwitchPanel = () => {
    if (!showUserSwitch) return null;
    const q = userSearch.trim().toLowerCase();
    const filtered = switchableUsers.filter(u => !q || u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q) || u.group.toLowerCase().includes(q));
    const groups = filtered.reduce((acc, u) => { (acc[u.group] = acc[u.group] || { name: u.group, color: u.groupColor, items: [] }).items.push(u); return acc; }, {});
    const groupArr = Object.values(groups);

    const handleSwitch = (user) => {
      setCurrentUser({ name: user.name, role: user.role });
      setShowUserSwitch(false); setUserSearch(''); setCurrentPage('dashboard');
      toast(`Viewing as ${user.name}`);
    };

    return (
      <>
        <div onClick={() => setShowUserSwitch(false)} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1100 }} />
        <div role="dialog" aria-label="Switch user account" style={{
          position: 'fixed', top: isMobile ? 16 : 72, right: isMobile ? 16 : 24, left: isMobile ? 16 : 'auto',
          width: isMobile ? 'auto' : 380, maxHeight: isMobile ? 'calc(100vh - 32px)' : 'calc(100vh - 96px)',
          background: c.surface, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.xl,
          border: `1px solid ${c.border}`, zIndex: 1101, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px 12px', background: c.bgSubtle, borderBottom: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 10 }}>Switch User Account</div>
            <Input icon={Search} placeholder="Search by name or role" value={userSearch} onChange={e => setUserSearch(e.target.value)} autoFocus ariaLabel="Search users" />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            {groupArr.length === 0 ? <EmptyState icon={Search} title="No users found" /> : groupArr.map(g => (
              <div key={g.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: g.color + '15', border: `1px solid ${g.color}30`, borderRadius: tokens.radius.md, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={13} color={g.color} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: g.color, letterSpacing: 1, textTransform: 'uppercase' }}>{g.name}</span>
                  </div>
                  <span style={{ padding: '0 8px', height: 20, borderRadius: 10, background: c.surface, border: `1px solid ${g.color}40`, display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: g.color }}>{g.items.length}</span>
                </div>
                {g.items.map(u => {
                  const active = currentUser?.name === u.name;
                  return (
                    <button key={u.id} onClick={() => handleSwitch(u)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', border: 'none', borderRadius: tokens.radius.md, background: active ? g.color + '12' : 'transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = c.surfaceHover; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                      <Avatar name={u.name} size={36} color={u.avatarColor} online={u.online} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: active ? g.color : c.text, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: active ? g.color : c.textSubtle, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.title}</div>
                      </div>
                      {active && <div style={{ width: 22, height: 22, borderRadius: '50%', background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={12} color="#fff" strokeWidth={3} /></div>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 18px', borderTop: `1px solid ${c.border}`, background: c.bgSubtle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: c.textMuted }}>Viewing as</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.primarySolid }}>{currentUser?.name}</span>
          </div>
        </div>
      </>
    );
  };

  /* ════════════════════════════════════════════════════════════════════
     GLOBAL SEARCH PANEL
     ════════════════════════════════════════════════════════════════════ */
  const SearchPanel = () => {
    if (!showSearch) return null;
    const sections = [];
    if (searchResults) {
      if (searchResults.courseHits.length) sections.push({ label: 'Courses', icon: BookOpen, items: searchResults.courseHits.map(x => ({ title: x.title, sub: x.category, onClick: () => { setDetailCourse(x.id); setCurrentPage('courses'); setShowSearch(false); } })) });
      if (searchResults.tutorialHits.length) sections.push({ label: 'Tutorials', icon: Lightbulb, items: searchResults.tutorialHits.map(x => ({ title: x.title, sub: x.category, onClick: () => { setCurrentPage('tutorials'); setShowSearch(false); } })) });
      if (searchResults.articleHits.length) sections.push({ label: 'Articles', icon: FileText, items: searchResults.articleHits.map(x => ({ title: x.title, sub: x.category, onClick: () => { setCurrentPage('resources'); setShowSearch(false); } })) });
      if (searchResults.certHits.length) sections.push({ label: 'Certificates', icon: Award, items: searchResults.certHits.map(x => ({ title: x.courseName, sub: `${x.userName} • ${x.credentialId}`, onClick: () => { setCurrentPage('certificates'); setShowSearch(false); } })) });
    }
    return (
      <>
        <div onClick={() => setShowSearch(false)} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1200, backdropFilter: 'blur(2px)' }} />
        <div role="dialog" aria-label="Search" style={{ position: 'fixed', top: isMobile ? 16 : 80, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 620, background: c.surface, borderRadius: tokens.radius.lg, boxShadow: tokens.shadow.xl, border: `1px solid ${c.border}`, zIndex: 1201, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 14, borderBottom: `1px solid ${c.border}` }}>
            <Input icon={Search} placeholder="Search courses, tutorials, articles, certificates…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus ariaLabel="Search" />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: searchResults ? 10 : 0 }}>
            {!searchResults ? (
              <div style={{ padding: 28, textAlign: 'center', color: c.textSubtle }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: c.textMuted }}>Start typing to search</div>
                <div style={{ fontSize: 12, color: c.textSubtle, marginTop: 4 }}>Search across courses, tutorials, articles, and certificates</div>
              </div>
            ) : searchResults.total === 0 ? (
              <EmptyState icon={Search} title="No results found" description={`Nothing matches "${searchQuery}". Try a different term.`} />
            ) : sections.map(sec => (
              <div key={sec.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: c.textSubtle, textTransform: 'uppercase' }}>
                  <sec.icon size={12} /> {sec.label}
                </div>
                {sec.items.map((it, i) => (
                  <button key={i} onClick={it.onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', borderRadius: tokens.radius.md, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = c.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: c.text, fontSize: 13.5 }}>{it.title}</div>
                      <div style={{ fontSize: 11.5, color: c.textSubtle, marginTop: 2 }}>{it.sub}</div>
                    </div>
                    <ArrowRight size={14} color={c.textSubtle} />
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 14px', borderTop: `1px solid ${c.border}`, background: c.bgSubtle, fontSize: 11, color: c.textSubtle, display: 'flex', justifyContent: 'space-between' }}>
            <span><kbd style={{ padding: '1px 5px', background: c.surface, borderRadius: 3, border: `1px solid ${c.border}`, fontFamily: 'monospace' }}>esc</kbd> to close</span>
            <span>Press <kbd style={{ padding: '1px 5px', background: c.surface, borderRadius: 3, border: `1px solid ${c.border}`, fontFamily: 'monospace' }}>⌘K</kbd> to open anywhere</span>
          </div>
        </div>
      </>
    );
  };
  /* ESC closes search */
  useEffect(() => {
    if (!showSearch) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowSearch(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSearch]);

  /* ════════════════════════════════════════════════════════════════════
     TOAST CONTAINER
     ════════════════════════════════════════════════════════════════════ */
  const ToastContainer = () => (
    <div role="region" aria-live="polite" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => {
        const variants = {
          success: { icon: CheckCircle, color: c.success, bg: c.successLight, text: c.successText },
          danger:  { icon: AlertCircle, color: c.danger,  bg: c.dangerLight,  text: c.dangerText },
          warning: { icon: AlertTriangle, color: c.warning, bg: c.warningLight, text: c.warningText },
          info:    { icon: Inbox, color: c.info, bg: c.infoLight, text: c.infoText },
        }[t.variant] || { icon: CheckCircle, color: c.success, bg: c.successLight, text: c.successText };
        const Icon = variants.icon;
        return (
          <div key={t.id} role="status" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: c.surface, borderRadius: tokens.radius.md, boxShadow: tokens.shadow.lg,
            border: `1px solid ${c.border}`, borderLeft: `4px solid ${variants.color}`,
            minWidth: 280, maxWidth: 420, animation: 'slideIn 0.25s ease-out', pointerEvents: 'auto',
          }}>
            <Icon size={18} color={variants.color} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 13.5, color: c.text, fontWeight: 500 }}>{t.message}</div>
            <IconButton size="sm" icon={X} ariaLabel="Dismiss" onClick={() => dismissToast(t.id)} variant="ghost" />
          </div>
        );
      })}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════
     CONFIRM DIALOG
     ════════════════════════════════════════════════════════════════════ */
  const ConfirmDialog = () => (
    <Modal open={!!confirmDialog} onClose={() => setConfirmDialog(null)} title={confirmDialog?.title} size="sm"
      footer={confirmDialog && <>
        <Button variant="outline" onClick={() => setConfirmDialog(null)}>{confirmDialog.cancelLabel || 'Cancel'}</Button>
        <Button variant={confirmDialog.variant || 'primary'} onClick={() => { confirmDialog.onConfirm && confirmDialog.onConfirm(); setConfirmDialog(null); }}>{confirmDialog.confirmLabel || 'Confirm'}</Button>
      </>}>
      {confirmDialog && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: confirmDialog.variant === 'danger' ? c.dangerLight : c.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} color={confirmDialog.variant === 'danger' ? c.danger : c.warning} />
          </div>
          <p style={{ margin: 0, color: c.textMuted, fontSize: 14, lineHeight: 1.55 }}>{confirmDialog.message}</p>
        </div>
      )}
    </Modal>
  );

  /* ════════════════════════════════════════════════════════════════════
     PAGE ROUTER
     ════════════════════════════════════════════════════════════════════ */
  const PageContent = () => {
    switch (currentPage) {
      case 'dashboard':       return <DashboardPage />;
      case 'courses':         return <CoursesPage />;
      case 'my-learning':     return <MyLearningPage />;
      case 'tutorials':       return <TutorialsPage />;
      case 'resources':       return <ResourcesPage />;
      case 'certificates':    return <CertificatesPage />;
      case 'upload':          return canUpload ? <UploadPage /> : <DashboardPage />;
      case 'submissions':     return canUpload ? <SubmissionsPage /> : <DashboardPage />;
      case 'approvals':       return canApprove ? <ApprovalsPage /> : <DashboardPage />;
      case 'course-reviews':  return canApprove ? <AdminCourseReviewsPage /> : <DashboardPage />;
      case 'content':         return canApprove ? <ContentManagementPage /> : <DashboardPage />;
      case 'settings':        return canApprove ? <AdminSettingsPage /> : <DashboardPage />;
      case 'team-progress':   return canViewTeam ? <TeamProgressPage /> : <DashboardPage />;
      case 'assign':          return canViewTeam ? <AssignTrainingPage /> : <DashboardPage />;
      case 'profile':         return <ProfilePage />;
      case 'user-settings':   return <UserSettingsPage />;
      default:                return <DashboardPage />;
    }
  };

  /* ════════════════════════════════════════════════════════════════════
     MAIN RETURN
     ════════════════════════════════════════════════════════════════════ */
  const mainPaddingLeft = isMobile ? 0 : (collapsed ? 76 : 252);

  return (
    <div style={{ background: c.bg, color: c.text, minHeight: '100vh', fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        *:focus-visible { outline: none; box-shadow: ${tokens.ring}; }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [role="button"]:focus-visible { outline: none; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${c.borderStrong}; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        /* Mobile global resets */
        @media (max-width: 767px) {
          html { -webkit-text-size-adjust: 100%; }
          * { -webkit-tap-highlight-color: transparent; }
          input, select, textarea { font-size: 16px !important; }
          button, [role="button"], a { min-height: 44px; }
          .modal-sheet { animation: slideUp 0.28s cubic-bezier(0.32,0.72,0,1); }
        }
        /* Horizontal-scroll pill rows */
        .pills-row { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 2px; flex-wrap: nowrap !important; }
        .pills-row::-webkit-scrollbar { display: none; }
      `}</style>

      <a href="#main-content" style={{ position: 'absolute', left: -9999, top: 8, padding: '8px 16px', background: c.primarySolid, color: '#fff', borderRadius: tokens.radius.md, zIndex: 9999 }}
        onFocus={e => e.target.style.left = '8px'} onBlur={e => e.target.style.left = '-9999px'}>Skip to main content</a>

      <Sidebar />
      <div style={{ marginLeft: mainPaddingLeft, transition: 'margin-left 0.2s' }}>
        <Header />
        <main id="main-content" style={{ padding: isMobile ? 16 : 24, paddingBottom: isMobile ? 'calc(16px + env(safe-area-inset-bottom))' : 32, minHeight: 'calc(100vh - 64px)' }}>
          <PageContent />
        </main>
      </div>

      <ReviewModalUI />
      {editPermUser && <UserPermModal user={editPermUser} onClose={() => setEditPermUser(null)} />}
      <UserSwitchPanel />
      <SearchPanel />
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

export default KnowledgeHub;
