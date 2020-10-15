import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';

const main = async () => {
    const orm = await MikroORM.init(microConfig);

    // создаю инстанс
    const post = orm.em.create(Post, { title: 'First post title1' });
    // вставляю в бд
    await orm.em.persistAndFlush(post);
    console.log();

    // await orm.em.nativeInsert(Post, { title: 'First post title' });
};

main();
