import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: 'Date' }) // означает колонку в бд
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: 'Date', onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field()
    @Property({ type: 'text', unique: true })
    email!: string;

    @Field()
    @Property({ type: 'text', unique: true })
    username!: string;

    // без @Field() значит что мы не можем выбрать через гкл но создаем это поле в БД
    @Property({ type: 'text' })
    password!: string;
}
