import Debug from "debug";
export declare class Error2 extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function error(status: number, message: string): Error2;
export declare const debug: Debug.Debugger;
