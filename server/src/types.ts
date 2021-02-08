import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import IORedis from 'ioredis';

export type AppContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    req: Request;
    res: Response;
    redis: IORedis.Redis;
};
