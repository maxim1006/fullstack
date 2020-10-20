import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';

console.log('__dirname ', __dirname);
console.log('process.cwd ', process.cwd());

export default {
    migrations: {
        path: path.join(__dirname, './migrations'), // path to folder with migration files
        pattern: /^[\w-]+\d+\.[jt]s$/, // how to match migration files
    },
    entities: [Post],
    dbName: 'lireddit',
    debug: !__prod__,
    user: 'postgres',
    password: 'postgres',
    type: 'postgresql',
} as Parameters<typeof MikroORM.init>[0];
