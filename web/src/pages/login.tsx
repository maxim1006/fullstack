import React, { memo } from 'react';
import { Field, Form, Formik } from 'formik';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import Wrapper from '../components/wrapper/wrapper';
import { Box } from '@chakra-ui/react';
import { FieldError, useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/error.utils';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/create-urql-client.utils';
import { withUrqlClient } from 'next-urql';

type LoginPageProps = {};

const LoginPage = memo<LoginPageProps>(() => {
    const router = useRouter();
    const [{}, login] = useLoginMutation();

    function validateName(value: string) {
        return value ? null : 'Name is required';
    }

    return (
        <Wrapper>
            <Formik
                initialValues={{ usernameOrEmail: '', password: '' }}
                onSubmit={async (values, actions) => {
                    // console.log('FormValues ', values);
                    // const { usernameOrEmail, password } = values;

                    try {
                        const { data } = await login(values);

                        if (Array.isArray(data?.login?.errors)) {
                            actions.setErrors(toErrorMap(data?.login.errors as FieldError[]));
                        } else {
                            // registration/login passed
                            router.push('/');
                        }
                    } catch (e) {
                        console.error('Login.tsx login error ', e);
                    } finally {
                        // чтобы остановить спиннер могу сделать так, а могу просто вернуть промис и когда он
                        // разрезолвится то спиннер пропадет
                        actions.setSubmitting(false);
                    }
                }}
            >
                {props => {
                    // console.log(props);
                    return (
                        <Form>
                            <Box mt={4}>
                                <Field name="usernameOrEmail" validate={validateName}>
                                    {({ field, form }: any) => (
                                        <FormControl
                                            isInvalid={form.errors.usernameOrEmail && form.touched.usernameOrEmail}
                                            isRequired
                                        >
                                            <FormLabel htmlFor="usernameOrEmail">User name or email</FormLabel>
                                            <Input {...field} id="usernameOrEmail" placeholder="name" />
                                            <FormErrorMessage>{form.errors.usernameOrEmail}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </Box>
                            <Field name="password">
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.password && form.touched.password} isRequired>
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                        <Input {...field} type="password" id="password" placeholder="password" />
                                        <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>
                            <Button mt={4} colorScheme="teal" isLoading={props.isSubmitting} type="submit">
                                Login
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Wrapper>
    );
});

export default withUrqlClient(createUrqlClient)(LoginPage);
