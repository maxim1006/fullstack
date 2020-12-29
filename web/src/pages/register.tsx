import React, { memo } from 'react';
import { Field, Form, Formik } from 'formik';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import Wrapper from '../components/wrapper/wrapper';
import { Box } from '@chakra-ui/react';
import { useMutation } from 'urql';

type RegisterPageProps = {};

const REGISTER_MUTATION = `
mutation Register($username:String!, $password:String!) {
  register(options: { username: $username, password: $password }) {
    errors {
      field
      message
    }
    user {
      username
      id
      createdAt
      updatedAt
    }
  }
}
`;

const RegisterPage = memo<RegisterPageProps>(() => {
    const [{}, register] = useMutation(REGISTER_MUTATION);
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
                initialValues={{ name: '', email: '', password: '' }}
                onSubmit={(values, actions) => {
                    setTimeout(async () => {
                        // console.log('FormValues ', values);
                        const { name, password } = values;

                        try {
                            const { data } = await register({
                                username: name,
                                password,
                            });

                            if (Array.isArray(data.register.errors)) {
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
                                <Field name="name" validate={validateName}>
                                    {({ field, form }: any) => (
                                        <FormControl isInvalid={form.errors.name && form.touched.name} isRequired>
                                            <FormLabel htmlFor="name">First name</FormLabel>
                                            <Input {...field} id="name" placeholder="name" />
                                            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </Box>
                            <Field name="email" validate={validateEmail}>
                                {({ field, form }: any) => (
                                    <FormControl isInvalid={form.errors.email && form.touched.email}>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <Input {...field} id="email" placeholder="email" />
                                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>
                            <Field name="password">
                                {({ field, form }: any) => (
                                    <FormControl isRequired>
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

export default RegisterPage;
