import { MikroORM } from '@mikro-orm/core';
import { __prod__, QID } from './constants';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { AppContext } from './types';
import cors from 'cors';

const main = async () => {
    // send test email
    // sendEmail('maximprosv@gmail.com', 'Hello Max');

    // connect to db
    // migrations in migration task
    const orm = await MikroORM.init(microConfig);

    // удалить всех пользователей
    // await orm.em.nativeDelete(User, {});

    // автоматом будет создавать post таблицу, если будет ошибка надо удалить таблицу в postgres
    // но я использую отдельный скрипт и таску migrate чтобы не ловить ошибки что уже все замегрировано
    // await orm.getMigrator().up();

    const app = express();

    // redis
    const RedisStore = connectRedis(session);
    const redisClient = new Redis();

    // отключаю корс для http://localhost:3000, также в apolloServer.applyMiddleware({ app, cors: false });
    app.use(
        cors({
            // prod
            origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
            credentials: true,
        })
    );

    // добавляем каждому юзеру куку с сессией, обязательно перед тем как апплаю к аполло мидлвер, чтобы использовать в аполло
    // могу qid найти в куках после логина, только надо на шестеренку и поставить requst.credentials: "include"
    app.use(
        session({
            name: QID,
            // говорим что подключаем редис
            // disableTouch отключает ttl (как долго в редис будет храниться сессия, https://github.com/tj/connect-redis#ttl ) говоря редис что мы сами будем управлять продлением сессии
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                sameSite: 'lax', // CSRF protection
                // can't access from JS
                httpOnly: true,
                // can use cookie only in https
                secure: __prod__,
            }, // 1 year
            // секрет для куков
            secret: 'mysecretstring',
            // создавать сессию по умолчанию, а так как мы в сессию записываем id usera то отключаю создание пустой сессии по умолчанию
            saveUninitialized: false,
            // чтобыб постоянно не пинговать редис
            resave: false,
        })
    );
    /////////

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        // через контекст гкл могу достать res req
        context: ({ req, res }): AppContext => ({ em: orm.em, req, res, redis: redisClient }),
    });

    // http://localhost:4000/graphql - playground
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => console.log('app is on 4000 port'));

    // // создаю инстанс
    // const post = orm.em.create(Post, { title: ' Second post title' });
    // // вставляю в бд
    // await orm.em.persistAndFlush(post);

    // так могу искать посты
    // const posts = await orm.em.find(Post, {});
    // console.log(posts);

    // просто другой путь к использованию создания и вставки
    // await orm.em.nativeInsert(Post, { title: 'First post title' });
};

main();
