import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React, { memo } from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/common.utils';

type NavBarProps = {};

const NavBar = memo<NavBarProps>(() => {
    // так как кеш полиси всегда сперва кеш, а после редиректа результат квери берется из кеша то тут ставлю
    // нетворк, но еще лучше использовать нормализованный кеш
    // https://formidable.com/open-source/urql/docs/graphcache/
    // const [{ data, fetching }] = useMeQuery({ requestPolicy: 'network-only' });
    const [{ data, fetching }] = useMeQuery({
        // так как навбар на страницах с ssr нужно сказать чтобы этот запрос скипался при ssr делаю это через pause: true, проверяя
        // наличие window
        pause: isServer(),
    });
    // @ts-ignore logoutData example
    const [{ data: logoutData, fetching: logoutFetching }, logout] = useLogoutMutation();

    let body = null;

    // console.log(data);

    // data is loading
    if (fetching) {
        // user not logged in
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </>
        );
        // user is logged in
    } else {
        body = (
            <>
                <Flex align="center">
                    <Box mr={4}>{data.me.username}</Box>
                    <Button isLoading={logoutFetching} onClick={() => logout()}>
                        Logout
                    </Button>
                </Flex>
            </>
        );
    }

    return (
        <Flex bg="lightblue" p={4}>
            <Box ml={'auto'}>{body}</Box>
        </Flex>
    );
});

export default NavBar;
