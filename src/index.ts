import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';

const main = async () => {
    // connect to db
    // migrations in migration task
    const orm = await MikroORM.init(microConfig);

    // // создаю инстанс
    // const post = orm.em.create(Post, { title: 'First post title1' });
    // // вставляю в бд
    // await orm.em.persistAndFlush(post);

    const posts = await orm.em.find(Post, {});

    console.log(posts);

    // просто другой путь к использованию создания и вставки
    // await orm.em.nativeInsert(Post, { title: 'First post title' });
};

main();
