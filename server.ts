import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini API client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Coordinator Allowlist
const MODERATOR_EMAILS = (process.env.MODERATOR_EMAILS || 'vikas2006126@gmail.com,coordinator@cyberfort.edu,lead_prof@cyberfort.edu')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// --- Data Models ---

export interface Clue {
  id: string;
  name: string;
  text: string;
  evidenceSnippet: string;
  locationLabel: string;
  position?: string;
  iconType?: string;
}

export interface BackgroundNode {
  id: string;
  name: string;
  text: string;
  position?: string;
  iconType?: string;
}

export interface ChallengeInternal {
  id: string;
  title: string;
  venueLabel: string;
  environmentTheme: string;
  incidentNarrative?: string;
  themeStyle?: {
    accentColor: 'cyan' | 'emerald' | 'violet' | 'teal';
    glowColor: string;
    hudTag: string;
    bgHue?: string;
  };
  status: 'published' | 'draft';
  clues: Record<string, Clue>;
  backgroundNodes: Record<string, BackgroundNode>;
  distractors: string[];
  options: string[];
  hints: string[];
  secretKey: {
    commonLocationPhrase: string;
    flag: string;
  };
  createdAt: number;
}

export type UserRole = 'STUDENT' | 'COORDINATOR' | 'ADMINISTRATOR';
export type AccountStatus = 'ACTIVE' | 'DEACTIVATED';

export interface UserRecord {
  uid: string;
  email: string;
  fullName: string;
  regNo: string;
  yearOfStudy: 'First Year' | 'Second Year';
  role: UserRole;
  status: AccountStatus;
  passwordHash: string;
  salt: string;
  registeredAt: number;
  deactivatedAt?: number;
  deactivatedBy?: string;
}

export interface SessionRecord {
  token: string;
  uid: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

export interface Attempt {
  userId: string;
  assignmentId?: string;
  assignmentVersion?: number;
  challengeId: string;
  environmentTheme?: string;
  startedAt: number;
  expiresAt: number; // Exactly 25 minutes = 1,500,000 ms
  completed: boolean;
  expired?: boolean;
  completedAt?: number;
  durationSeconds?: number;
  collectedClues: string[];
  identifiedLocation: boolean;
  score: number;
  hintsUsed: number;
  submittedFlag?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetUid: string;
  reason: string;
  moderator: string;
  timestamp: number;
}

export interface ChallengeDraft {
  draftId: string;
  title: string;
  venueLabel: string;
  environmentTheme?: string;
  commonLocationPhrase: string;
  flag: string;
  workstationClue: string;
  cctvClue: string;
  accessLogClue: string;
  distractors: string[];
  hints: string[];
  createdAt: number;
  status: string;
}

// --- Crypto Utilities ---

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// --- Master Challenge Bank & Standard Progressive Hints ---
import {
  CHALLENGE_BANK,
  STANDARD_PROGRESSIVE_HINTS
} from './src/data/challengeBank.ts';

// --- Persistent Database Store ---

const DB_FILE = path.join(__dirname, 'data', 'cyberfort_db.json');

interface DatabaseSchema {
  users: Record<string, UserRecord>;
  sessions: Record<string, SessionRecord>;
  attempts: Record<string, Attempt>;
  challenges: Record<string, ChallengeInternal>;
  auditLogs: AuditLog[];
  drafts: ChallengeDraft[];
}

let dbData: DatabaseSchema = {
  users: {},
  sessions: {},
  attempts: {},
  challenges: {},
  auditLogs: [],
  drafts: []
};

function ensureDbDirectory() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveDatabase() {
  try {
    ensureDbDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save database:', err);
  }
}

function loadDatabase() {
  try {
    ensureDbDirectory();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DB] Could not read existing database, initializing fresh:', err);
  }

  // Populate and refresh challenges from Master Challenge Bank
  CHALLENGE_BANK.forEach(ch => {
    dbData.challenges[ch.id] = {
      ...ch,
      ...(dbData.challenges[ch.id] || {}),
      themeStyle: ch.themeStyle,
      incidentNarrative: ch.incidentNarrative,
      clues: ch.clues,
      backgroundNodes: ch.backgroundNodes,
      secretKey: ch.secretKey,
      venueLabel: ch.venueLabel,
      environmentTheme: ch.environmentTheme,
      hints: [...STANDARD_PROGRESSIVE_HINTS]
    };
  });

  // Guarantee that every challenge in the database uses the generic, non-leaking 3 progressive hints
  Object.values(dbData.challenges).forEach(ch => {
    ch.hints = [...STANDARD_PROGRESSIVE_HINTS];
  });

  // Ensure every user has a valid status
  Object.values(dbData.users).forEach(u => {
    if (!u.status) u.status = 'ACTIVE';
  });

  // Ensure Initial Coordinator/Administrator account exists: vikas2006126@gmail.com
  const coordinatorEmail = 'vikas2006126@gmail.com';
  const existingCoord = Object.values(dbData.users).find(
    u => u.email.toLowerCase() === coordinatorEmail.toLowerCase()
  );

  if (!existingCoord) {
    const salt = generateSalt();
    const coordUid = 'coord_' + Date.now();
    dbData.users[coordUid] = {
      uid: coordUid,
      email: coordinatorEmail,
      fullName: 'Vikas (Lead Coordinator & Admin)',
      regNo: 'COORD-2026-01',
      yearOfStudy: 'Second Year',
      role: 'ADMINISTRATOR',
      status: 'ACTIVE',
      passwordHash: hashPassword('CyberFort2026!', salt),
      salt,
      registeredAt: Date.now() - 3600000 * 24
    };
    console.log(`[AUTH] Seeded default administrator: ${coordinatorEmail} (Password: CyberFort2026!)`);
  } else {
    // Ensure role is ADMINISTRATOR and status is ACTIVE
    existingCoord.role = 'ADMINISTRATOR';
    existingCoord.status = 'ACTIVE';
  }

  // Seed benchmark student accounts if empty
  const students = [
    { email: 'aarav.sharma@cyberfort.edu', name: 'Aarav Sharma', regNo: '2026CS1049', year: 'First Year' as const, score: 100, dur: 320, ch: 'ch_soc_01', flag: 'CYBERFORT{SOC_BAY_3}' },
    { email: 'priya.nair@cyberfort.edu', name: 'Priya Nair', regNo: '2026EC2110', year: 'Second Year' as const, score: 95, dur: 410, ch: 'ch_forensic_02', flag: 'CYBERFORT{LAB_2}' },
    { email: 'dev.patel@cyberfort.edu', name: 'Dev Patel', regNo: '2026IT3015', year: 'First Year' as const, score: 90, dur: 512, ch: 'ch_netmon_03', flag: 'CYBERFORT{ZONE_9}' }
  ];

  students.forEach((s, idx) => {
    const exists = Object.values(dbData.users).find(u => u.email.toLowerCase() === s.email.toLowerCase());
    if (!exists) {
      const salt = generateSalt();
      const uid = `student_benchmark_${idx + 1}`;
      dbData.users[uid] = {
        uid,
        email: s.email,
        fullName: s.name,
        regNo: s.regNo,
        yearOfStudy: s.year,
        role: 'STUDENT',
        status: 'ACTIVE',
        passwordHash: hashPassword('StudentPass123!', salt),
        salt,
        registeredAt: Date.now() - 3600000 * (idx + 1)
      };

      // Also seed completed attempt for rich initial leaderboard
      dbData.attempts[uid] = {
        userId: uid,
        assignmentId: 'asgn_seed_' + (idx + 1),
        assignmentVersion: 1,
        challengeId: s.ch,
        environmentTheme: dbData.challenges[s.ch]?.environmentTheme || 'Cybersecurity Investigation',
        startedAt: Date.now() - 3600000 * (idx + 1),
        expiresAt: Date.now() - 3600000 * (idx + 1) + 1500000,
        completed: true,
        completedAt: Date.now() - 3600000 * (idx + 1) + s.dur * 1000,
        durationSeconds: s.dur,
        collectedClues: ['workstation', 'cctv', 'access_log'],
        identifiedLocation: true,
        score: s.score,
        hintsUsed: Math.max(0, Math.floor((100 - s.score) / 5)),
        submittedFlag: s.flag
      };
    }
  });

  saveDatabase();
}

loadDatabase();

// --- Helper: Public Challenge Sanitizer (Never exposes secretKey or flag) ---

function getSanitizedChallenge(ch: ChallengeInternal) {
  return {
    id: ch.id,
    title: ch.title,
    venueLabel: ch.venueLabel,
    environmentTheme: ch.environmentTheme,
    incidentNarrative: ch.incidentNarrative || 'Investigate the three interconnected telemetry nodes to correlate the breach identifier.',
    themeStyle: ch.themeStyle || {
      accentColor: 'cyan',
      glowColor: 'rgba(0, 242, 254, 0.35)',
      hudTag: 'FORENSIC_ENCLAVE'
    },
    status: ch.status,
    clues: Object.values(ch.clues).map(c => ({
      id: c.id,
      name: c.name,
      text: c.text,
      evidenceSnippet: c.evidenceSnippet,
      locationLabel: c.locationLabel || 'Incident Artifact',
      position: c.position || 'top-[44%] left-[28%]',
      iconType: c.iconType || 'terminal'
    })),
    backgroundNodes: Object.values(ch.backgroundNodes).map(b => ({
      id: b.id,
      name: b.name,
      text: b.text,
      position: b.position || 'top-[22%] left-[46%]',
      iconType: b.iconType || 'network'
    })),
    totalHints: ch.hints.length
  };
}

// Helper: Sanitize user record for client
function sanitizeUser(u: UserRecord) {
  const isAllowlisted = MODERATOR_EMAILS.includes(u.email.toLowerCase());
  const isAdmin = u.role === 'ADMINISTRATOR' || isAllowlisted;
  const isCoordinator = u.role === 'COORDINATOR' || isAdmin;
  return {
    uid: u.uid,
    email: u.email,
    fullName: u.fullName,
    regNo: u.regNo,
    yearOfStudy: u.yearOfStudy,
    role: u.role || (isAdmin ? 'ADMINISTRATOR' : isCoordinator ? 'COORDINATOR' : 'STUDENT'),
    status: u.status || 'ACTIVE',
    registeredAt: u.registeredAt,
    isCoordinator,
    isAdmin
  };
}

// --- Authentication Middleware ---

interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  sessionToken?: string;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token.' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const session = dbData.sessions[token];

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
  }

  if (Date.now() > session.expiresAt) {
    delete dbData.sessions[token];
    saveDatabase();
    return res.status(401).json({ error: 'Unauthorized: Session has expired. Please sign in again.' });
  }

  const user = dbData.users[session.uid];
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User account no longer exists.' });
  }

  if (user.status === 'DEACTIVATED') {
    delete dbData.sessions[token];
    saveDatabase();
    return res.status(403).json({
      error: 'Account Suspended: Your account has been deactivated by an administrator. Please contact tournament administration.'
    });
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

function requireCoordinator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const isCoordRole = req.user.role === 'COORDINATOR' || req.user.role === 'ADMINISTRATOR';
    const isAllowlisted = MODERATOR_EMAILS.includes(req.user.email.toLowerCase());

    if (!isCoordRole && !isAllowlisted) {
      return res.status(403).json({
        error: 'Access Denied: Coordinator privileges required. Student accounts are strictly prohibited from coordinator operations.'
      });
    }

    next();
  });
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const isAdminRole = req.user.role === 'ADMINISTRATOR';
    const isAllowlisted = MODERATOR_EMAILS.includes(req.user.email.toLowerCase());

    if (!isAdminRole && !isAllowlisted) {
      return res.status(403).json({
        error: 'Access Denied: Administrator privileges required for user management operations.'
      });
    }

    next();
  });
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Student Registration (Role is strictly locked to STUDENT)
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, regNo, yearOfStudy, password } = req.body;

  if (!fullName || !email || !regNo || !password) {
    return res.status(400).json({ error: 'All fields (Full Name, Email, Reg No, Password) are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = Object.values(dbData.users).find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
  }

  // Check if regNo already exists
  const existingReg = Object.values(dbData.users).find(u => u.regNo.toLowerCase() === regNo.trim().toLowerCase());
  if (existingReg) {
    return res.status(400).json({ error: 'Registration number already enrolled.' });
  }

  const salt = generateSalt();
  const uid = 'student_' + Date.now();
  const newStudent: UserRecord = {
    uid,
    email: cleanEmail,
    fullName: fullName.trim(),
    regNo: regNo.trim().toUpperCase(),
    yearOfStudy: yearOfStudy === 'Second Year' ? 'Second Year' : 'First Year',
    role: 'STUDENT', // Strictly enforce STUDENT role; cannot be overridden
    status: 'ACTIVE',
    passwordHash: hashPassword(password, salt),
    salt,
    registeredAt: Date.now()
  };

  dbData.users[uid] = newStudent;

  // Create session
  const token = generateToken();
  dbData.sessions[token] = {
    token,
    uid,
    role: 'STUDENT',
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 days
  };

  saveDatabase();

  res.status(201).json({
    success: true,
    user: sanitizeUser(newStudent),
    token
  });
});

// Universal Login (Authenticates students, coordinators, and administrators)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = Object.values(dbData.users).find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  if (user.status === 'DEACTIVATED') {
    return res.status(403).json({
      error: 'Account Deactivated: This account has been deactivated by an administrator. Please contact tournament administration.'
    });
  }

  // Create session
  const token = generateToken();
  dbData.sessions[token] = {
    token,
    uid: user.uid,
    role: user.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 days
  };

  saveDatabase();

  res.json({
    success: true,
    user: sanitizeUser(user),
    token
  });
});

// Coordinator Specific Login (Strictly verifies COORDINATOR or ADMINISTRATOR role)
app.post('/api/auth/coordinator-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = Object.values(dbData.users).find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid coordinator credentials.' });
  }

  if (user.status === 'DEACTIVATED') {
    return res.status(403).json({
      error: 'Account Deactivated: This account has been deactivated by an administrator. Please contact tournament administration.'
    });
  }

  const isCoord = user.role === 'COORDINATOR' || user.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(user.email.toLowerCase());
  if (!isCoord) {
    return res.status(403).json({
      error: 'Access Denied: This account does not possess coordinator privileges. Student accounts cannot access the coordinator portal.'
    });
  }

  const token = generateToken();
  dbData.sessions[token] = {
    token,
    uid: user.uid,
    role: user.role === 'ADMINISTRATOR' ? 'ADMINISTRATOR' : 'COORDINATOR',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 3600 * 1000 // 24 hours
  };

  saveDatabase();

  res.json({
    success: true,
    user: sanitizeUser(user),
    token
  });
});

// Coordinator Self-Setup / Password Reset (Exclusively authorized for MODERATOR_EMAILS allowlist)
app.post('/api/auth/coordinator-setup', (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Coordinator email and new password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const isAllowlisted = MODERATOR_EMAILS.includes(cleanEmail);

  if (!isAllowlisted) {
    return res.status(403).json({
      error: 'Access Denied: This email address is not in the authorized coordinator allowlist. Please contact the tournament administrator.'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Coordinator password must be at least 8 characters in length for security compliance.' });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  let targetUser = Object.values(dbData.users).find(u => u.email.toLowerCase() === cleanEmail);
  const salt = generateSalt();
  const passwordHash = hashPassword(newPassword, salt);
  const isVikas = cleanEmail === 'vikas2006126@gmail.com';

  if (!targetUser) {
    const uid = 'coord_' + Date.now();
    targetUser = {
      uid,
      email: cleanEmail,
      fullName: isVikas ? 'Vikas (Lead Coordinator & Admin)' : 'Tournament Coordinator',
      regNo: 'COORD-2026',
      yearOfStudy: 'Second Year',
      role: isVikas ? 'ADMINISTRATOR' : 'COORDINATOR',
      status: 'ACTIVE',
      passwordHash,
      salt,
      registeredAt: Date.now()
    };
    dbData.users[uid] = targetUser;
  } else {
    if (isVikas) {
      targetUser.role = 'ADMINISTRATOR';
    } else if (targetUser.role === 'STUDENT') {
      targetUser.role = 'COORDINATOR';
    }
    targetUser.status = 'ACTIVE';
    targetUser.salt = salt;
    targetUser.passwordHash = passwordHash;
  }

  // Issue authorized coordinator session token
  const token = generateToken();
  dbData.sessions[token] = {
    token,
    uid: targetUser.uid,
    role: targetUser.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 3600 * 1000 // 24 hours
  };

  saveDatabase();

  console.log(`[AUTH] Coordinator password established for ${cleanEmail}`);

  res.json({
    success: true,
    message: 'Coordinator credentials successfully established.',
    user: sanitizeUser(targetUser),
    token
  });
});

// Verify & Restore Active Session
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    user: sanitizeUser(req.user!)
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    delete dbData.sessions[token];
    saveDatabase();
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// -------------------------------------------------------------
// INDIVIDUALIZED RANDOMIZED CTF CHALLENGE & ATTEMPT API
// -------------------------------------------------------------

// Public Challenge overview for landing view
app.get('/api/challenge', (req, res) => {
  const defaultCh = Object.values(dbData.challenges)[0];
  res.json({ challenge: getSanitizedChallenge(defaultCh) });
});

// Start or retrieve individualized attempt for authenticated student
app.post('/api/attempt/start', requireAuth, (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  let attempt = dbData.attempts[uid];

  const now = Date.now();
  const TWENTY_FIVE_MINUTES_MS = 25 * 60 * 1000; // 1,500,000 ms (25 minutes)

  if (!attempt) {
    // Select an individualized challenge from the bank
    const allPublished = Object.values(dbData.challenges).filter(c => c.status === 'published');

    // Controlled duplicate avoidance: Find challenges currently active among other concurrent students
    const activeAssignedChallengeIds = new Set(
      Object.values(dbData.attempts)
        .filter(a => !a.completed && !a.expired && a.userId !== uid)
        .map(a => a.challengeId)
    );

    // Filter to available variants not currently active
    const availablePool = allPublished.filter(c => !activeAssignedChallengeIds.has(c.id));

    let assignedChallenge: ChallengeInternal;
    if (availablePool.length > 0) {
      // Controlled cryptographic randomization across available unassigned pool
      const poolIndex = crypto.randomInt(0, availablePool.length);
      assignedChallenge = availablePool[poolIndex];
    } else {
      // If all variants are concurrently active, pick the least assigned variant
      const countMap: Record<string, number> = {};
      allPublished.forEach(c => { countMap[c.id] = 0; });
      Object.values(dbData.attempts).forEach(a => {
        if (!a.completed && !a.expired) {
          countMap[a.challengeId] = (countMap[a.challengeId] || 0) + 1;
        }
      });
      const sortedByLeastActive = [...allPublished].sort((a, b) => (countMap[a.id] || 0) - (countMap[b.id] || 0));
      assignedChallenge = sortedByLeastActive[0] || allPublished[0];
    }

    const assignmentId = 'asgn_' + uid + '_' + crypto.randomBytes(6).toString('hex');

    attempt = {
      userId: uid,
      assignmentId,
      assignmentVersion: 1,
      challengeId: assignedChallenge.id,
      environmentTheme: assignedChallenge.environmentTheme,
      startedAt: now,
      expiresAt: now + TWENTY_FIVE_MINUTES_MS, // Exactly 25 minutes
      completed: false,
      expired: false,
      collectedClues: [],
      identifiedLocation: false,
      score: 0,
      hintsUsed: 0
    };

    dbData.attempts[uid] = attempt;
    saveDatabase();
    console.log(`[CHALLENGE ASSIGNED] Student: ${req.user!.fullName} (${uid}) -> Assignment: ${assignmentId} | Variant: ${assignedChallenge.id} | Environment: ${assignedChallenge.environmentTheme} | Target: ${assignedChallenge.secretKey.commonLocationPhrase}`);
  } else {
    // Check if expired
    if (!attempt.completed && now > attempt.expiresAt) {
      attempt.expired = true;
      saveDatabase();
    }
  }

  const assigned = dbData.challenges[attempt.challengeId] || Object.values(dbData.challenges)[0];

  res.json({
    attempt,
    challenge: getSanitizedChallenge(assigned),
    serverTime: now,
    remainingSeconds: Math.max(0, Math.round((attempt.expiresAt - now) / 1000)),
    unlockedHints: STANDARD_PROGRESSIVE_HINTS.slice(0, attempt.hintsUsed).map((text, idx) => ({
      number: idx + 1,
      label: `HINT ${idx + 1}`,
      text
    }))
  });
});

// Collect clue for student's assigned challenge
app.post('/api/attempt/collect-clue', requireAuth, (req: AuthenticatedRequest, res) => {
  const { clueKey } = req.body;
  const uid = req.user!.uid;
  const attempt = dbData.attempts[uid];

  if (!attempt) return res.status(404).json({ error: 'Active attempt not found.' });

  const now = Date.now();
  if (now > attempt.expiresAt && !attempt.completed) {
    attempt.expired = true;
    saveDatabase();
    return res.status(403).json({ error: 'Time Expired: The 25-minute challenge window has concluded.', expired: true });
  }

  if (attempt.completed) return res.status(400).json({ error: 'Challenge already completed.' });

  const challenge = dbData.challenges[attempt.challengeId];
  if (!challenge) return res.status(404).json({ error: 'Assigned challenge not found.' });

  if (!challenge.clues[clueKey] && !challenge.backgroundNodes[clueKey]) {
    return res.status(400).json({ error: 'Invalid object identifier for this challenge.' });
  }

  if (challenge.clues[clueKey]) {
    if (!attempt.collectedClues.includes(clueKey)) {
      attempt.collectedClues.push(clueKey);
    }
    // Award 30 points if all 3 primary clues are collected
    if (attempt.collectedClues.length >= 3) {
      attempt.score = Math.max(attempt.score, 30);
    }
    saveDatabase();
  }

  res.json({
    success: true,
    collectedClues: attempt.collectedClues,
    score: attempt.score,
    allCluesFound: attempt.collectedClues.length >= 3
  });
});

// Verify common location phrase for student's assigned challenge
app.post('/api/attempt/verify-location', requireAuth, (req: AuthenticatedRequest, res) => {
  const { selectedLocation } = req.body;
  const uid = req.user!.uid;
  const attempt = dbData.attempts[uid];

  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

  const now = Date.now();
  if (now > attempt.expiresAt && !attempt.completed) {
    attempt.expired = true;
    saveDatabase();
    return res.status(403).json({ error: 'Time Expired: The 25-minute challenge window has concluded.', expired: true });
  }

  if (attempt.collectedClues.length < 3) {
    return res.status(400).json({ error: 'You must inspect all three clues before verifying the common location.' });
  }

  const challenge = dbData.challenges[attempt.challengeId];
  if (!challenge) return res.status(404).json({ error: 'Assigned challenge not found.' });

  const authoritativePhrase = challenge.secretKey.commonLocationPhrase.trim().toUpperCase();
  const candidate = (selectedLocation || '').trim().toUpperCase();

  const isMatch = candidate === authoritativePhrase;
  if (!isMatch) {
    return res.status(400).json({
      verified: false,
      message: 'The selected location is not confirmed by all three records. Re-examine your clues.'
    });
  }

  attempt.identifiedLocation = true;
  attempt.score = Math.max(attempt.score, 60); // 30 (clues) + 30 (phrase) = 60
  saveDatabase();

  res.json({
    verified: true,
    score: attempt.score,
    message: `Target location resolved: ${authoritativePhrase}. Capture the flag terminal unlocked!`
  });
});

// Reveal Hint (deducts 5 points from final score)
app.post('/api/attempt/use-hint', requireAuth, (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const attempt = dbData.attempts[uid];

  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

  const now = Date.now();
  if (now > attempt.expiresAt && !attempt.completed) {
    attempt.expired = true;
    saveDatabase();
    return res.status(403).json({ error: 'Time Expired: The 25-minute challenge window has concluded.', expired: true });
  }

  if (attempt.completed) return res.status(400).json({ error: 'Challenge already completed.' });

  const challenge = dbData.challenges[attempt.challengeId];
  if (!challenge) return res.status(404).json({ error: 'Assigned challenge not found.' });

  const currentHintIndex = attempt.hintsUsed;
  if (currentHintIndex >= STANDARD_PROGRESSIVE_HINTS.length) {
    return res.status(400).json({ error: 'All 3 progressive hints have already been revealed.' });
  }

  const hintText = STANDARD_PROGRESSIVE_HINTS[currentHintIndex];
  attempt.hintsUsed += 1;
  saveDatabase();

  res.json({
    hintNumber: attempt.hintsUsed,
    hintLabel: `HINT ${attempt.hintsUsed}`,
    hintText,
    hintsUsed: attempt.hintsUsed,
    totalHints: 3,
    penaltyNotice: '5 points deducted from final flag completion score per hint used.'
  });
});

// Submit final authoritative flag for student's specific challenge
app.post('/api/attempt/submit-flag', requireAuth, (req: AuthenticatedRequest, res) => {
  const { submittedFlag } = req.body;
  const uid = req.user!.uid;
  const attempt = dbData.attempts[uid];

  if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

  const now = Date.now();
  if (now > attempt.expiresAt && !attempt.completed) {
    attempt.expired = true;
    saveDatabase();
    return res.status(403).json({ error: 'Time Expired: The 25-minute challenge window has concluded.', expired: true });
  }

  if (attempt.collectedClues.length < 3) {
    return res.status(400).json({ error: 'Investigate all evidence nodes to unlock terminal access.' });
  }

  if (attempt.completed) {
    return res.json({
      verified: true,
      alreadyCompleted: true,
      attempt
    });
  }

  const challenge = dbData.challenges[attempt.challengeId];
  if (!challenge) return res.status(404).json({ error: 'Assigned challenge not found.' });

  const cleanInput = (submittedFlag || '').trim().replace(/\s+/g, '');
  const targetFlag = challenge.secretKey.flag.trim().replace(/\s+/g, '');

  if (cleanInput.toUpperCase() !== targetFlag.toUpperCase()) {
    return res.status(400).json({
      verified: false,
      message: 'Flag rejected. The pattern does not match the shared signature across your assigned incident logs. Check your findings and formatting.'
    });
  }

  // Calculate final authoritative score: 100 max minus 5 pts per hint used (min 70)
  const durationSeconds = Math.max(1, Math.round((now - attempt.startedAt) / 1000));
  const calculatedScore = Math.max(70, 100 - (attempt.hintsUsed * 5));

  attempt.completed = true;
  attempt.identifiedLocation = true;
  attempt.completedAt = now;
  attempt.durationSeconds = durationSeconds;
  attempt.score = calculatedScore;
  attempt.submittedFlag = challenge.secretKey.flag;

  saveDatabase();

  res.json({
    verified: true,
    attempt
  });
});

// -------------------------------------------------------------
// PUBLIC LEADERBOARD API
// -------------------------------------------------------------

app.get('/api/leaderboard', (req, res) => {
  const board: any[] = [];

  Object.values(dbData.attempts).forEach((att) => {
    if (att.completed) {
      const u = dbData.users[att.userId];
      board.push({
        uid: att.userId,
        displayName: u?.fullName || 'Investigator ' + att.userId.slice(0, 6),
        yearOfStudy: u?.yearOfStudy || 'First Year',
        score: att.score,
        durationSeconds: att.durationSeconds || 0,
        completedAt: att.completedAt || Date.now()
      });
    }
  });

  // Sort by score DESC, then durationSeconds ASC
  board.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.durationSeconds - b.durationSeconds;
  });

  res.json({ leaderboard: board });
});

// -------------------------------------------------------------
// COORDINATOR / MODERATOR PROTECTED API
// -------------------------------------------------------------

// Participant audit listing (Strictly coordinator-only)
app.get('/api/moderator/participants', requireCoordinator, (req: AuthenticatedRequest, res) => {
  const list: any[] = [];

  Object.values(dbData.users).forEach((u) => {
    const att = dbData.attempts[u.uid];
    list.push({
      uid: u.uid,
      fullName: u.fullName,
      email: u.email,
      regNo: u.regNo,
      yearOfStudy: u.yearOfStudy,
      role: u.role,
      status: u.status || 'ACTIVE',
      registeredAt: u.registeredAt,
      attempt: att || null
    });
  });

  res.json({
    participants: list,
    auditLogs: dbData.auditLogs
  });
});

// -------------------------------------------------------------
// USER MANAGEMENT & ADMINISTRATIVE ACCESS CONTROL
// -------------------------------------------------------------

// List all managed users (Strictly requireAdmin)
app.get('/api/admin/users', requireAdmin, (req: AuthenticatedRequest, res) => {
  const usersList: any[] = [];
  const allUsers = Object.values(dbData.users);

  allUsers.forEach((u) => {
    const isAllowlisted = MODERATOR_EMAILS.includes(u.email.toLowerCase());
    const att = dbData.attempts[u.uid];
    usersList.push({
      uid: u.uid,
      fullName: u.fullName,
      email: u.email,
      regNo: u.regNo,
      yearOfStudy: u.yearOfStudy,
      role: u.role || (isAllowlisted ? 'ADMINISTRATOR' : 'STUDENT'),
      status: u.status || 'ACTIVE',
      registeredAt: u.registeredAt,
      deactivatedAt: u.deactivatedAt,
      deactivatedBy: u.deactivatedBy,
      score: att?.score ?? null,
      hasAttempt: !!att,
      attemptCompleted: att?.completed ?? false,
      isAllowlistedAdmin: isAllowlisted
    });
  });

  // Sort: Administrators and Coordinators first, then newest registrations
  usersList.sort((a, b) => {
    const roleWeight = (role: string) => role === 'ADMINISTRATOR' ? 3 : role === 'COORDINATOR' ? 2 : 1;
    if (roleWeight(b.role) !== roleWeight(a.role)) {
      return roleWeight(b.role) - roleWeight(a.role);
    }
    return (b.registeredAt || 0) - (a.registeredAt || 0);
  });

  const summary = {
    total: allUsers.length,
    students: allUsers.filter(u => u.role === 'STUDENT').length,
    coordinators: allUsers.filter(u => u.role === 'COORDINATOR').length,
    administrators: allUsers.filter(u => u.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(u.email.toLowerCase())).length,
    deactivated: allUsers.filter(u => u.status === 'DEACTIVATED').length
  };

  res.json({
    users: usersList,
    summary,
    currentUserId: req.user!.uid,
    currentUserRole: req.user!.role
  });
});

// Change user role (Strictly requireAdmin with audit log and last-admin protection)
app.post('/api/admin/change-role', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { targetUid, newRole, reason } = req.body;

  if (!targetUid || !newRole) {
    return res.status(400).json({ error: 'Target user ID and new role are required.' });
  }

  const allowedRoles: UserRole[] = ['STUDENT', 'COORDINATOR', 'ADMINISTRATOR'];
  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ error: `Invalid role specified. Allowed roles: ${allowedRoles.join(', ')}` });
  }

  const targetUser = dbData.users[targetUid];
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user account not found in database.' });
  }

  const previousRole = targetUser.role;
  if (previousRole === newRole) {
    return res.status(400).json({ error: `User is already assigned the ${newRole} role.` });
  }

  // Security Check: Protect the last remaining administrator from demotion
  const isTargetAdmin = targetUser.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(targetUser.email.toLowerCase());
  if (isTargetAdmin && newRole !== 'ADMINISTRATOR') {
    const otherActiveAdmins = Object.values(dbData.users).filter(u =>
      u.uid !== targetUid &&
      (u.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(u.email.toLowerCase())) &&
      u.status !== 'DEACTIVATED'
    );

    if (otherActiveAdmins.length === 0) {
      return res.status(400).json({
        error: 'Security Protection: Cannot demote the last remaining authorized administrator.'
      });
    }
  }

  // Update role
  targetUser.role = newRole;

  // Update all active sessions for this user to reflect the new role
  Object.keys(dbData.sessions).forEach(token => {
    if (dbData.sessions[token].uid === targetUid) {
      dbData.sessions[token].role = newRole;
    }
  });

  // Record role change in audit trail
  const logEntry: AuditLog = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action: 'ROLE_MODIFICATION',
    targetUid: targetUser.uid,
    reason: `Role changed from ${previousRole} to ${newRole}. Justification: ${reason ? reason.trim() : 'Administrative role adjustment'}`,
    moderator: `${req.user!.fullName} (${req.user!.email})`,
    timestamp: Date.now()
  };
  dbData.auditLogs.unshift(logEntry);

  saveDatabase();

  res.json({
    success: true,
    message: `Account role for ${targetUser.fullName} (${targetUser.email}) successfully changed from ${previousRole} to ${newRole}.`,
    user: sanitizeUser(targetUser),
    logEntry
  });
});

// Deactivate or Reactivate Account (Strictly requireAdmin)
app.post('/api/admin/set-status', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { targetUid, status, reason } = req.body;

  if (!targetUid || !status) {
    return res.status(400).json({ error: 'Target user ID and status are required.' });
  }

  if (status !== 'ACTIVE' && status !== 'DEACTIVATED') {
    return res.status(400).json({ error: 'Invalid status. Allowed values: ACTIVE, DEACTIVATED.' });
  }

  const targetUser = dbData.users[targetUid];
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  if (targetUser.status === status) {
    return res.status(400).json({ error: `Account is already ${status.toLowerCase()}.` });
  }

  // Security Check: Protect the last administrator from deactivation
  if (status === 'DEACTIVATED') {
    const isTargetAdmin = targetUser.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(targetUser.email.toLowerCase());
    if (isTargetAdmin) {
      const otherActiveAdmins = Object.values(dbData.users).filter(u =>
        u.uid !== targetUid &&
        (u.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(u.email.toLowerCase())) &&
        u.status !== 'DEACTIVATED'
      );

      if (otherActiveAdmins.length === 0) {
        return res.status(400).json({
          error: 'Security Protection: Cannot deactivate the last remaining authorized administrator.'
        });
      }
    }
  }

  // Update status
  targetUser.status = status;
  if (status === 'DEACTIVATED') {
    targetUser.deactivatedAt = Date.now();
    targetUser.deactivatedBy = req.user!.email;

    // Invalidate all active sessions immediately for the deactivated user
    Object.keys(dbData.sessions).forEach(tok => {
      if (dbData.sessions[tok].uid === targetUid) {
        delete dbData.sessions[tok];
      }
    });
  } else {
    delete targetUser.deactivatedAt;
    delete targetUser.deactivatedBy;
  }

  const logEntry: AuditLog = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action: status === 'DEACTIVATED' ? 'ACCOUNT_DEACTIVATED' : 'ACCOUNT_REACTIVATED',
    targetUid: targetUser.uid,
    reason: `Account ${status.toLowerCase()} by administrator. Justification: ${reason ? reason.trim() : 'Administrative status update'}`,
    moderator: `${req.user!.fullName} (${req.user!.email})`,
    timestamp: Date.now()
  };
  dbData.auditLogs.unshift(logEntry);

  saveDatabase();

  res.json({
    success: true,
    message: `Account for ${targetUser.fullName} (${targetUser.email}) has been ${status === 'DEACTIVATED' ? 'deactivated and all active sessions terminated' : 'reactivated'}.`,
    user: sanitizeUser(targetUser),
    logEntry
  });
});

// Permanent Account Deletion (Strictly requireAdmin)
app.delete('/api/admin/users/:uid', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { uid: targetUid } = req.params;
  const { reason } = req.body || {};

  if (!targetUid) {
    return res.status(400).json({ error: 'Target user ID is required.' });
  }

  const targetUser = dbData.users[targetUid];
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  // Security Check: Prevent deleting the last authorized administrator
  const isTargetAdmin = targetUser.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(targetUser.email.toLowerCase());
  if (isTargetAdmin) {
    const otherActiveAdmins = Object.values(dbData.users).filter(u =>
      u.uid !== targetUid &&
      (u.role === 'ADMINISTRATOR' || MODERATOR_EMAILS.includes(u.email.toLowerCase())) &&
      u.status !== 'DEACTIVATED'
    );

    if (otherActiveAdmins.length === 0) {
      return res.status(400).json({
        error: 'Security Protection: Cannot delete the last remaining authorized administrator.'
      });
    }
  }

  // Prevent admin from deleting their own currently logged-in account
  if (targetUid === req.user!.uid) {
    return res.status(400).json({
      error: 'Security Protection: You cannot delete your own currently authenticated administrator account.'
    });
  }

  // Purge all sessions for this user
  Object.keys(dbData.sessions).forEach(tok => {
    if (dbData.sessions[tok].uid === targetUid) {
      delete dbData.sessions[tok];
    }
  });

  // Clean up related attempt record to avoid orphaned references
  const hadAttempt = !!dbData.attempts[targetUid];
  delete dbData.attempts[targetUid];

  // Record audit log before deleting user record
  const logEntry: AuditLog = {
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action: 'ACCOUNT_PERMANENTLY_DELETED',
    targetUid,
    reason: `Permanently deleted user ${targetUser.fullName} (${targetUser.email}, ${targetUser.regNo}, Role: ${targetUser.role}). Had attempt: ${hadAttempt}. Justification: ${reason || 'Permanent purge requested'}`,
    moderator: `${req.user!.fullName} (${req.user!.email})`,
    timestamp: Date.now()
  };
  dbData.auditLogs.unshift(logEntry);

  // Delete user from database
  delete dbData.users[targetUid];

  saveDatabase();

  res.json({
    success: true,
    message: `Account for ${targetUser.fullName} (${targetUser.email}) and its authentication records have been permanently purged.`,
    logEntry
  });
});

// Reset participant attempt (Strictly coordinator-only with mandatory reason)
app.post('/api/moderator/reset-participant', requireCoordinator, (req: AuthenticatedRequest, res) => {
  const { targetUid, reason } = req.body;

  if (!targetUid || !reason) {
    return res.status(400).json({ error: 'Target student UID and official audit reason are mandatory.' });
  }

  const targetUser = dbData.users[targetUid];
  if (!targetUser) return res.status(404).json({ error: 'Target user not found.' });

  delete dbData.attempts[targetUid];

  const logEntry: AuditLog = {
    id: 'audit_' + Date.now(),
    action: 'RESET_ATTEMPT',
    targetUid,
    reason: reason.trim(),
    moderator: req.user!.email,
    timestamp: Date.now()
  };

  dbData.auditLogs.unshift(logEntry);
  saveDatabase();

  res.json({
    success: true,
    message: `Attempt for ${targetUser.fullName} (${targetUser.regNo}) has been cleared.`,
    logEntry
  });
});

// Gemini AI Challenge Generator (Server-Side using @google/genai with gemini-3.8-flash)
app.post('/api/moderator/generate-variant', requireCoordinator, async (req: AuthenticatedRequest, res) => {
  try {
    const prompt = `
Create an alternate, beginner-friendly cybersecurity CTF investigation challenge for CYBERFORT 2026.
Requirements:
1. Exactly ONE specific room/location phrase repeated verbatim across 3 forensic clues (e.g., "VAULT 8", "RACK 14", "BAY 5", "ARCHIVE 4", "POD D").
2. 3 distractors that do NOT appear across all 3 clues.
3. Clue 1 is from Digital Workstation, Clue 2 is from CCTV Monitor, Clue 3 is from Access Log Terminal.
4. Flag format must strictly be CYBERFORT{LOCATION_WITH_UNDERSCORES}.
5. Venue label should follow: CYBERFORT — CAREER PRESS SCHOOL — [LOCATION]
6. Environment theme should be concise (e.g., "Industrial Automation Bay", "Cryo Storage Vault").
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a cybersecurity CTF challenge author designing structured beginner forensics CTF scenarios.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            venueLabel: { type: Type.STRING },
            environmentTheme: { type: Type.STRING },
            commonLocationPhrase: { type: Type.STRING },
            flag: { type: Type.STRING },
            workstationClue: { type: Type.STRING },
            cctvClue: { type: Type.STRING },
            accessLogClue: { type: Type.STRING },
            distractors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'title',
            'venueLabel',
            'environmentTheme',
            'commonLocationPhrase',
            'flag',
            'workstationClue',
            'cctvClue',
            'accessLogClue',
            'distractors',
            'hints'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const draftId = 'draft_' + Date.now();
    const draftRecord: ChallengeDraft = {
      draftId,
      ...parsed,
      createdAt: Date.now(),
      status: 'pending_review'
    };

    dbData.drafts.unshift(draftRecord);
    saveDatabase();

    res.json({ success: true, draft: draftRecord });
  } catch (err: any) {
    console.error('Gemini Challenge Generation Error:', err);
    res.status(500).json({
      error: 'AI Challenge Generation failed: ' + (err.message || 'Unknown error')
    });
  }
});

app.get('/api/moderator/drafts', requireCoordinator, (req, res) => {
  res.json({ drafts: dbData.drafts });
});

// Optionally activate a drafted variant into the active challenge pool
app.post('/api/moderator/activate-draft', requireCoordinator, (req: AuthenticatedRequest, res) => {
  const { draftId } = req.body;
  const draft = dbData.drafts.find(d => d.draftId === draftId);
  if (!draft) return res.status(404).json({ error: 'Draft not found.' });

  const options = [draft.commonLocationPhrase, ...(draft.distractors || ['SERVER ROOM', 'DATA CENTER'])].slice(0, 4);

  const newChallenge: ChallengeInternal = {
    id: draftId,
    title: draft.title || 'OPERATION SHADOW HUNT (AI VARIANT)',
    venueLabel: draft.venueLabel || `CYBERFORT — CAREER PRESS SCHOOL — ${draft.commonLocationPhrase}`,
    environmentTheme: draft.environmentTheme || 'AI Forensics Chamber',
    status: 'published',
    clues: {
      workstation: {
        id: 'workstation',
        name: 'Digital Workstation',
        text: draft.workstationClue,
        evidenceSnippet: `HOST: WS-VARIANT | TAG: ${draft.commonLocationPhrase} | STATUS: LOGGED`,
        locationLabel: 'Workstation Terminal'
      },
      cctv: {
        id: 'cctv',
        name: 'CCTV Security Wall Monitor',
        text: draft.cctvClue,
        evidenceSnippet: `CAM_FEED: CH-SECURITY | LOC: ${draft.commonLocationPhrase} | STATUS: RECORDED`,
        locationLabel: 'Wall Surveillance'
      },
      access_log: {
        id: 'access_log',
        name: 'Access Log Terminal',
        text: draft.accessLogClue,
        evidenceSnippet: `RFID: PASS-ACTIVE | LOCATION: ${draft.commonLocationPhrase} | STATUS: VERIFIED`,
        locationLabel: 'Card Access Unit'
      }
    },
    backgroundNodes: {
      network_console: {
        id: 'network_console',
        name: 'Network Switch Matrix',
        text: 'Core packet traces nominal.'
      },
      artifact_case: {
        id: 'artifact_case',
        name: 'Hardware Storage Unit',
        text: 'Sealed storage enclosure intact.'
      },
      incident_cabinet: {
        id: 'incident_cabinet',
        name: 'Schematic Archive',
        text: 'Campus architectural topology.'
      }
    },
    distractors: draft.distractors || [],
    options,
    hints: draft.hints || [
      'Compare the registered locations across all three inspected records.',
      'Look for the room identifier repeated identically in all three logs.'
    ],
    secretKey: {
      commonLocationPhrase: draft.commonLocationPhrase,
      flag: draft.flag
    },
    createdAt: Date.now()
  };

  dbData.challenges[draftId] = newChallenge;
  draft.status = 'active_published';
  saveDatabase();

  res.json({
    success: true,
    message: `Challenge variant added to active pool: ${newChallenge.title}`,
    activeChallenge: getSanitizedChallenge(newChallenge)
  });
});

// CSV Export (Protected by coordinator verification)
app.get('/api/export-csv', requireCoordinator, (req: AuthenticatedRequest, res) => {
  const rows = [
    ['Registration No', 'Full Name', 'Email', 'Year of Study', 'Role', 'Status', 'Challenge ID', 'Score', 'Hints Used', 'Duration (s)', 'Flag Captured']
  ];

  Object.values(dbData.users).forEach((u) => {
    const att = dbData.attempts[u.uid];
    rows.push([
      `"${u.regNo || 'N/A'}"`,
      `"${u.fullName || ''}"`,
      `"${u.email || ''}"`,
      `"${u.yearOfStudy || ''}"`,
      `"${u.role}"`,
      `"${att?.completed ? 'COMPLETED' : att?.expired ? 'EXPIRED' : att ? 'IN_PROGRESS' : 'NOT_STARTED'}"`,
      `"${att?.challengeId || 'N/A'}"`,
      `${att?.score ?? 0}`,
      `${att?.hintsUsed ?? 0}`,
      `${att?.durationSeconds ?? 0}`,
      `"${att?.submittedFlag || 'NO'}"`
    ]);
  });

  const csvData = rows.map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="CYBERFORT_2026_RESULTS_${Date.now()}.csv"`);
  res.send(csvData);
});

// Live Database Inspection (Coordinator Only)
app.get('/api/moderator/database-inspect', requireCoordinator, (req: AuthenticatedRequest, res) => {
  res.json({
    databaseFilePath: DB_FILE,
    databaseFileSize: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
    lastSaved: Date.now(),
    summary: {
      totalUsers: Object.keys(dbData.users).length,
      studentCount: Object.values(dbData.users).filter(u => u.role === 'STUDENT').length,
      coordinatorCount: Object.values(dbData.users).filter(u => u.role === 'COORDINATOR').length,
      totalChallenges: Object.keys(dbData.challenges).length,
      totalAttempts: Object.keys(dbData.attempts).length,
      completedAttempts: Object.values(dbData.attempts).filter(a => a.completed).length,
      activeSessions: Object.keys(dbData.sessions).length,
      auditLogsCount: dbData.auditLogs.length,
      draftsCount: dbData.drafts.length
    },
    users: Object.values(dbData.users).map(u => sanitizeUser(u)),
    attempts: dbData.attempts,
    challenges: Object.values(dbData.challenges).map(c => ({
      id: c.id,
      title: c.title,
      venueLabel: c.venueLabel,
      environmentTheme: c.environmentTheme,
      commonLocationPhrase: c.secretKey.commonLocationPhrase,
      flag: c.secretKey.flag
    })),
    auditLogs: dbData.auditLogs
  });
});

// Full Raw Database Download (Coordinator Only)
app.get('/api/moderator/download-database', requireCoordinator, (req: AuthenticatedRequest, res) => {
  if (!fs.existsSync(DB_FILE)) {
    saveDatabase();
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="cyberfort_db_backup_${Date.now()}.json"`);
  res.sendFile(DB_FILE);
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC ASSETS
// -------------------------------------------------------------

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYBERFORT 2026] Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CYBERFORT 2026] Startup failed:', err);
});
