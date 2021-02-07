import React, { memo } from 'react';
import { Field, Form, Formik } from 'formik';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import Wrapper from '../components/wrapper/wrapper';
import { Box } from '@chakra-ui/react';
import { FieldError, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/error.utils';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/create-urql-client.utils';

type RegisterPageProps = {};

const RegisterPage = memo<RegisterPageProps>(() => {
    const router = useRouter();
    const [{}, register] = useRegisterMutation();

    function validateName(value: string) {
        return value ? null : 'Name is required';
    }

    function validateEmail(value: string = '') {
        let error;

        if (value.trim() && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value.trim())) {
            error = 'Invalid email address';
        }

        return error;
    }

    return (
        <Wrapper>
            <Formik
                initialValues={{ username: '', email: '', password: '' }}
                onSubmit={(values, actions) => {
                    setTimeout(async () => {
                        // console.log('FormValues ', values);
                        const { username, password, email } = values;

                        try {
                            const { data } = await register({
                                options: {
                                    username,
                                    email,
                                    password,
                                },
                            });

                            if (Array.isArray(data?.register?.errors)) {
                                actions.setErrors(toErrorMap(data?.register?.errors as FieldError[]));
                            } else {
                                // registration/login passed
                                router.push('/');
                            }
                        } catch (e) {
                            console.error('Register.tsx register error ', e);
                        } finally {
                            // чтобы остановить спиннер могу сделать так, а могу просто вернуть промис и когда он
                            // разрезолвится то спиннер пропадет
                            actions.setSubmitting(false);
                        }
                    }, 1000);
                }}
            >
                {props => {
                    // console.log(props);
                    return (
                        <Form>
                            <Box mt={4}>
                                <Field name="username" validate={validateName}>
                                    {({ field, form }: any) => (
                                        <FormControl
                                            isInvalid={form.errors.username && form.touched.username}
                                            isRequired
                                        >
                                            <FormLabel htmlFor="username">First name</FormLabel>
                                            <Input {...field} id="username" placeholder="name" />
                                            <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </Box>
                            <Field name="email" validate={validateEmail}>
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.email && form.touched.email} isRequired>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <Input {...field} id="email" placeholder="email" />
                                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>
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
                                Register
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Wrapper>
    );
});

export default withUrqlClient(createUrqlClient)(RegisterPage);
