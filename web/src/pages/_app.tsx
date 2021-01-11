import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import { AppProps } from 'next/app';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, RegisterMutation } from '../generated/graphql';

const client = createClient({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
        // при запросах посылать также куки
        credentials: 'include',
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    login: (result, _, cache) => {
                        cache.updateQuery({ query: MeDocument }, () => {
                            // console.log(result);

                            if ((result as LoginMutation).login.errors) {
                                return MeDocument;
                            }

                            return {
                                me: (result as LoginMutation).login.user,
                            };
                        });
                    },
                    logout: (result, _, cache) => {
                        cache.updateQuery({ query: MeDocument }, () => {
                            console.log(result);
                            if ((result as LogoutMutation).logout) {
                                return {
                                    me: null,
                                };
                            }

                            return MeDocument;
                        });
                    },
                    register: (result, _, cache) => {
                        cache.updateQuery({ query: MeDocument }, () => {
                            console.log(result);

                            if ((result as RegisterMutation).register.errors) {
                                return MeDocument;
                            }

                            return {
                                me: (result as RegisterMutation).register.user,
                            };
                        });
                    },
                },
            },
        }),
        fetchExchange,
    ],
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider value={client}>
            <ChakraProvider resetCSS theme={theme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </Provider>
    );
}

export default MyApp;
