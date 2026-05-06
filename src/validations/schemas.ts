/*
Rule cho việc nhập form
- Username: bắt buộc nhập, tối thiểu 3 kí tự
- Password: bắt buộc, tối thiểu 6
*/

import type { RegisterOptions } from "react-hook-form";

//#region shared validation rules
const requiredMessage = 'This field is required';
//#endregion shared validation rules

//#region auth validation schemas
export const authSchemas = {
    login: {
        username: {
            required: requiredMessage,
            minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
            },
        } satisfies RegisterOptions,

        password: {
            required: requiredMessage,
            minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
            },
        } satisfies RegisterOptions,
    },

    register: {
        username: {
            required: requiredMessage,
            minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
            },
        } satisfies RegisterOptions,

        fullName: {
            required: requiredMessage,
            minLength: {
                value: 2,
                message: 'Full name must be at least 2 characters',
            },
        } satisfies RegisterOptions,

        password: {
            required: requiredMessage,
            minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
            },
        } satisfies RegisterOptions,

        confirmPassword: {
            required: requiredMessage,
            minLength: {
                value: 6,
                message: 'Please enter your password again',
            },
        } satisfies RegisterOptions,
    },
} as const
//#endregion auth validation schemas
