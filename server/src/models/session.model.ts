import session from 'express-session';

export type ExtendedSessionType = session.Session & Partial<session.SessionData> & {userId?: number}
