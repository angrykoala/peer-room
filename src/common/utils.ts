export function arrayfy<T>(raw: T | Array<T>): Array<T> {
    if (Array.isArray(raw)) return raw;
    else return [raw];
}
