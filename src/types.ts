export interface Clue {
  id: string;
  name: string;
  text: string;
  evidenceSnippet: string;
  sourceLabel?: string;
  locationLabel?: string;
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

export interface Challenge {
  id: string;
  title: string;
  venueLabel: string;
  environmentTheme?: string;
  incidentNarrative?: string;
  themeStyle?: {
    glowColor?: string;
    accentColor?: string;
    hudTag?: string;
    bgHue?: string;
  };
  status: 'published' | 'draft';
  clues: Clue[];
  backgroundNodes: BackgroundNode[];
  options?: string[];
  totalHints: number;
}

export type UserRole = 'STUDENT' | 'COORDINATOR' | 'ADMINISTRATOR';
export type AccountStatus = 'ACTIVE' | 'DEACTIVATED';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  regNo: string;
  yearOfStudy: 'First Year' | 'Second Year';
  role: UserRole;
  status?: AccountStatus;
  registeredAt: number;
  isCoordinator: boolean;
  isAdmin?: boolean;
}

export interface Attempt {
  userId: string;
  assignmentId?: string;
  assignmentVersion?: number;
  challengeId: string;
  environmentTheme?: string;
  startedAt: number;
  expiresAt: number; // 1500 seconds (25 minutes) from start
  completed: boolean;
  expired?: boolean;
  completedAt?: number;
  durationSeconds?: number;
  collectedClues: string[];
  identifiedLocation?: boolean;
  score: number;
  hintsUsed: number;
  submittedFlag?: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  yearOfStudy: string;
  score: number;
  durationSeconds: number;
  completedAt: number;
}

export interface ParticipantRecord {
  uid: string;
  fullName: string;
  email: string;
  regNo: string;
  yearOfStudy: string;
  role: UserRole;
  status?: AccountStatus;
  registeredAt?: number;
  attempt: Attempt | null;
}

export interface ManagedUserRecord {
  uid: string;
  fullName: string;
  email: string;
  regNo: string;
  yearOfStudy: string;
  role: UserRole;
  status: AccountStatus;
  registeredAt: number;
  deactivatedAt?: number;
  deactivatedBy?: string;
  score?: number;
  hasAttempt?: boolean;
  attemptCompleted?: boolean;
  isAllowlistedAdmin?: boolean;
}

export interface AuditLogEntry {
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
