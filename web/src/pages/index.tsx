import NavBar from '../components/navbar/navbar.component';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/create-urql-client.utils';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
    // по умолчанию использую клиентский запрос, но если сделать withUrqlClient(createUrqlClient, { ssr: true }) то все запросы
    // с этой страницы пойдут с ssr
    const [{ data }] = usePostsQuery();

    return (
        <>
            <NavBar />
            <p>Hello world</p>
            {data ? (
                <ul>
                    {data.posts.map(i => (
                        <li key={i.id}>{i.title}</li>
                    ))}
                </ul>
            ) : (
                'loading...'
            )}
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
