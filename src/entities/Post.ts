import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Post {
    @PrimaryKey()
    id!: number;

    @Property({ type: 'Date' }) // означает колонку в бд
    createdAt = new Date();

    @Property({ type: 'Date', onUpdate: () => new Date() })
    updatedAt = new Date();

    @Property({ type: 'text' })
    title!: string;

    @Property()
    description?: string = '';

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
