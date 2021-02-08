export const __prod__ = process.env.NODE_ENV === 'production';

export const ERROR_ALREADY_EXISTS = "'already exists'";

export const DBErrorCodes = new Map<string, { code: string; message: string }>([
    [
        ERROR_ALREADY_EXISTS,
        {
            code: '23505',
            message: 'Username already exists, please provide another username',
        },
    ],
]);

export const QID = 'qid';

export const FORGET_PASSWORD_PREFIX = 'forget-password:';
