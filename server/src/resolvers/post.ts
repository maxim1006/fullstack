import { Post } from '../entities/Post';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { AppContext } from 'src/types';

@Resolver()
export class PostResolver {
    // удобно что могу тут использовать Post прямо из micro orm entity, но для этого надо дописать в нем поля
    @Query(() => [Post])
    // @Ctx() ctx это контекст который передал в гкл
    posts(@Ctx() { em }: AppContext): Promise<Post[]> {
        return em.find(Post, {});
    }

    // возвращаю Post или null
    @Query(() => Post, { nullable: true })
    post(
        // имя переменной в гкл будет то что указал в 'id'
        @Arg('id') id: number,
        @Ctx()
        { em }: AppContext
    ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    async createPost(
        // так обычно делаю указывая тип для гкл и для тс, но гкл вроде понимает и без доп указания
        // @Arg('title', () => String) title: string,
        @Arg('title') title: string,
        @Ctx()
        { em }: AppContext
    ): Promise<Post> {
        const post = em.create(Post, { title });

        await em.persistAndFlush(post);

        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('title', () => String, { nullable: true }) title: string,
        @Arg('description', () => String, { nullable: true }) description: string,
        @Arg('id') id: number,
        @Ctx()
        { em }: AppContext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, { id });

        if (!post) {
            return null;
        }

        post.title = title;
        post.description = description ?? '';
        await em.persistAndFlush(post);

        return post;
    }

    @Mutation(() => Boolean, { nullable: true })
    async deletePost(
        @Arg('id') id: number,
        @Ctx()
        { em }: AppContext
    ): Promise<boolean> {
        await em.nativeDelete(Post, { id });
        return true;
    }
}

// пример запроса с аргументов в плейграунде
// query post($id:Int!){
//     post(id: $id) {
//       title
//     }
//   }

// mutation createPost($title:String!) {
//     createPost(title: $title) {
//       id
//       title
//     }
//   }

// mutation {
//     updatePost(id:1, title:"my first post") {
//       id
//       title
//       updatedAt
//     }
//   }

// mutation {
//     deletePost(id:3)
//   }

// variables передаю
// {
//     "id":1
//   }
