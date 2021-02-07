import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType() // чтобы работало с гкл
@Entity()
export class Post {
    @Field() // чтобы работало с гкл
    @PrimaryKey()
    id!: number;

    @Field(() => String) // чтобы работало с гкл
    @Property({ type: 'Date' }) // означает колонку в бд
    createdAt = new Date();

    @Field(() => String) // чтобы работало с гкл
    @Property({ type: 'Date', onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field() // чтобы работало с гкл
    @Property({ type: 'text' })
    title!: string;

    @Field() // чтобы работало с гкл
    @Property()
    description?: string = '';

    // @Field() // тут закомментил чтобы нельзя было добраться из гкл
    // @Property()
    // propThatIsNotInGQL?: string = '';

    // @ManyToOne() // when you provide correct type hint, ORM will read it for you
    // author!: Author;

    // @ManyToOne(() => Publisher) // or you can specify the entity as class reference or string name
    // publisher?: Publisher;

    // @ManyToMany() // owning side can be simple as this!
    // tags = new Collection<BookTag>(this);

    // constructor(title: string, author: Author) {
    //     this.title = title;
    //     this.author = author;
    // }
}
