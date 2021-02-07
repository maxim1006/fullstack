// обычно использую @Arg как в post но тут рассматриваю альтернативный подход, вместо нескольких Arg 1 объект
// @InputType для описания @Arg
import { Field, InputType } from 'type-graphql';

@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;
}
