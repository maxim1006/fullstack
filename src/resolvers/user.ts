import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { AppContext } from '../types';
import { User } from '../entities/User';
import argon2 from 'argon2';
import { DBErrorCodes, ERROR_ALREADY_EXISTS } from '../constants';

// обычно использую @Arg как в post но тут рассматриваю альтернативный подход, вместо нескольких Arg 1 объект
// @InputType для описания @Arg
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    //  Здесь дополнительно задаю тип, так как хочу укать что эти значения  nullable
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { req, em }: AppContext): Promise<User | null> {
        // not logged in, userId is set in login method
        if (!req.session?.userId) {
            return null;
        }

        // logged in
        return await em.findOne(User, { id: req.session?.userId });
    }

    // UserResponse то что нужно возвращать из register и что вернет гкл
    @Mutation(() => UserResponse)
    // тут подписал ретерн тайп чтобы тс ругался
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: AppContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{ field: 'username', message: 'Please provide username with length more than 2 symbols' }],
            };
        }

        if (options.password.length <= 2) {
            return {
                errors: [{ field: 'password', message: 'Please provide password with length more than 2 symbols' }],
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        // создаю пользователя
        const user = em.create(User, { username: options.username, password: hashedPassword });

        try {
            // записываю в бд
            await em.persistAndFlush(user);
        } catch (e) {
            const { code, message } = DBErrorCodes.get(ERROR_ALREADY_EXISTS)!;

            if (e.code === code || e.includes(ERROR_ALREADY_EXISTS)) {
                return {
                    errors: [{ field: 'username', message }],
                };
            }
        }

        // store userId session, set cookie on the user, keep user logged in
        req.session!.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(@Arg('options') options: UsernamePasswordInput, @Ctx() { em, req }: AppContext): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });

        // так обрабатываю ошибки в гкл
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: `there is no such user: ${options.username}`,
                    },
                ],
            };
        }

        const valid = await argon2.verify(user.password, options.password);

        // так обрабатываю ошибки в гкл
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password is not valid',
                    },
                ],
            };
        }

        // добавляю юзеру сессию, можно проверить в гкл, в сессии могу хранить что угодно
        req.session!.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async updatePassword(
        @Arg('username') username: string,
        @Arg('oldpassword') oldpassword: string,
        @Arg('newpassword') newpassword: string,
        @Ctx() { em }: AppContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username });

        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'No such user',
                    },
                ],
            };
        }

        if (await argon2.verify(user.password, oldpassword)) {
            const hashedPassword = await argon2.hash(newpassword);
            user.password = hashedPassword;
            await em.persistAndFlush(user);
        } else {
            // password did not match
        }

        return { user };
    }
}

// Register mutation
// mutation {
//     register(options: { username: "Max", password: "Max" }) {
//         errors {
//             field
//             message
//         }
//         user {
//             username
//             id
//             createdAt
//             updatedAt
//         }
//     }
// }

// Register with props
// mutation Register($username:String!, $password:String!) {
//     register(options: { username: $username, password: $password }) {
//         errors {
//             field
//             message
//         }
//         user {
//             username
//             id
//             createdAt
//             updatedAt
//         }
//     }
// }

// login mutation
// mutation {
//     login(options:{username:"Max2", password:"Max2"}) {
//         user {
//             username
//             createdAt
//             updatedAt
//             id
//         }
//         errors {
//             message
//             field
//         }
//     }
// }

// update password mutation
// mutation {
//     updatePassword(username: "Max", oldpassword: "Max", newpassword: "Max") {
//         user {
//             username
//             id
//         }
//     }
// }
