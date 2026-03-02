import { env } from '../../config/env';

export async function GQLFetch<T, V = Record<string, any>>(
    query: string,
    variables?: V
): Promise<T> {
    const response = await fetch(env.PUBLIC_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const { data, errors } = await response.json();

    if (errors) {
        console.error('GQL Errors:', errors);
        throw new Error(errors[0].message);
    }

    return data as T;
}
