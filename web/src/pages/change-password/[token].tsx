import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { Field, Form, Formik } from 'formik';
import { FieldError, useChangePasswordMutation } from '../../generated/graphql';
import { Box, Link } from '@chakra-ui/react';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/button';
import Wrapper from '../../components/wrapper/wrapper';
import React, { useState } from 'react';
import { toErrorMap } from '../../utils/error.utils';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/create-urql-client.utils';
import NextLink from 'next/link';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    const [, changePassword] = useChangePasswordMutation();
    const router = useRouter();
    const [tokenError, setTokenError] = useState('');

    return (
        <Wrapper>
            <Formik
                initialValues={{ newPassword: '' }}
                onSubmit={async (values, actions) => {
                    const { data } = await changePassword({
                        newPassword: values.newPassword,
                        token,
                    });

                    if (Array.isArray(data?.changePassword?.errors)) {
                        const errorMap = toErrorMap(data?.changePassword.errors as FieldError[]);

                        if ('token' in errorMap) {
                            setTokenError(errorMap.token);
                        }

                        actions.setErrors(errorMap);
                    } else {
                        // change password passed
                        router.push('/');
                    }
                }}
            >
                {props => {
                    // console.log(props);
                    return (
                        <Form>
                            <Box mt={4}>
                                <Field name="newPassword">
                                    {({ field, form }: any) => (
                                        <FormControl
                                            isInvalid={form.errors.newPassword && form.touched.newPassword}
                                            isRequired
                                        >
                                            <FormLabel htmlFor="newPassword">New password</FormLabel>
                                            <Input {...field} id="newPassword" placeholder="new password" />
                                            {tokenError && (
                                                <Box>
                                                    <Box style={{ color: 'red' }}>{tokenError}</Box>
                                                    <Box>
                                                        <NextLink href="/forgot-password">
                                                            <Link>Change Password</Link>
                                                        </NextLink>
                                                    </Box>
                                                </Box>
                                            )}
                                            <FormErrorMessage>{form.errors.newPassword}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                </Field>
                            </Box>
                            <Button mt={4} colorScheme="teal" isLoading={props.isSubmitting} type="submit">
                                Submit
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </Wrapper>
    );
};

// dont ssr this page
export default withUrqlClient(createUrqlClient)(ChangePassword as any);

// у URQL своя жизнь поэтому должен сделать как выше
export const getStaticProps: GetStaticProps = async context => {
    return {
        props: { token: context.params?.token },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        // если true то некст кидает на страничку, фолс - на 404
        fallback: true,
    };
};
