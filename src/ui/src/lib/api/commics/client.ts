import { env } from '../../config/env';
import { print } from 'graphql';

export async function GQLFetch<T, V = Record<string, any>>(
    query: string,
    variables?: V
): Promise<T> {
    // Sanitize variables: remove undefined values as some GraphQL servers (like async-graphql)
    // might fail to deserialize them into Optional types correctly if they are explicit undefined.
    const cleanVariables = variables
        ? Object.fromEntries(Object.entries(variables).filter(([_, v]) => v !== undefined))
        : undefined;

    const response = await fetch(env.PUBLIC_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: typeof query === 'string' ? query : print(query),
            variables: cleanVariables,
        }),
    });

    const text = await response.text();
    let result;
    try {
        result = JSON.parse(text);
    } catch (e) {
        console.error('[GQLFetch] CRITICAL: Failed to parse JSON. Raw body:', text);
        throw new Error(`Invalid JSON response from GraphQL: ${text.substring(0, 100)}`);
    }

    const { data, errors } = result;

    if (errors) {
        console.error('GQL Errors:', errors);
        throw new Error(errors[0].message);
    }

    return data as T;
}
