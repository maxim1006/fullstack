import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { AppContext } from '../types';
import { User } from '../entities/User';
import argon2 from 'argon2';
import { DBErrorCodes, ERROR_ALREADY_EXISTS, QID } from '../constants';
import { ExtendedSessionType } from '../models/session.model';
import { UsernamePasswordInput } from '../models/username-password-input.model';
import { validateRegister } from '../validators/user.validator';
// import { sendEmail } from '../utils/send-emails';

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
    @Mutation(() => Boolean)
    async forgotPassword(@Arg('email') email: string, @Ctx() { em }: AppContext): Promise<boolean> {
        const user = await em.findOne(User, { username: email });

        if (!user) {
            // email is not in the db
            // в этом случае просто возвращаем true чтобы запретить перебор emails и отсылки фишинговых писем
            return true;
        }

        // await sendEmail(email);

        return true;
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req, em }: AppContext): Promise<User | null> {
        // not logged in, userId is set in login method
        if (!(req.session as ExtendedSessionType)?.userId) {
            return null;
        }

        // logged in
        return await em.findOne(User, { id: (req.session as ExtendedSessionType)?.userId });
    }

    // UserResponse то что нужно возвращать из register и что вернет гкл
    @Mutation(() => UserResponse)
    // тут подписал ретерн тайп чтобы тс ругался
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: AppContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);

        if (errors) {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password);
        // создаю пользователя
        const user = em.create(User, { username: options.username, email: options.email, password: hashedPassword });

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
        (req.session as ExtendedSessionType)!.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: AppContext
    ): Promise<UserResponse> {
        const user = await em.findOne(
            User,
            usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail }
        );

        // так обрабатываю ошибки в гкл
        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: `there is no such user: ${usernameOrEmail}`,
                    },
                ],
            };
        }

        const valid = await argon2.verify(user.password, password);

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

        // добавляю юзеру сессию, можно проверить в гкл, в сессии могу хранить что угодно, в принципе тут храню
        // userId и эта запись закидывает куку с сессией, но могу добавить еще какую-нибудь инфо в сессию
        (req.session as ExtendedSessionType)!.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: AppContext): Promise<boolean> {
        // удаляю из куков 'qid'
        res.clearCookie(QID);

        return new Promise(res =>
            // в redis удаляю сессию
            req.session?.destroy(err => {
                if (err) {
                    console.log('logout error ', err);
                    return res(false);
                }

                res(true);
            })
        );
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
