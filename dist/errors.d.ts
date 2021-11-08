import { tokenType } from "./types";
export declare class EmptyAuthticationHeaderError extends Error {
    constructor();
}
export declare class InvalidAuthticationHeaderError extends Error {
    constructor();
}
export declare class TokenBlockedError extends Error {
    constructor();
}
export declare class InvalidTokenError extends Error {
    constructor();
}
export declare class TokenTypeError extends Error {
    readonly expectedType: tokenType;
    constructor(expectedType: tokenType);
}
export declare class TokenDecodeError extends Error {
    constructor();
}
export declare class NotBasicAuthError extends Error {
    constructor();
}
export declare class BasicAuthError extends Error {
    constructor();
}
