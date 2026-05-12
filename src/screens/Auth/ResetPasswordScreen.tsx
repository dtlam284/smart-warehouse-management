import { useEffect } from 'react'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authSchemas } from '@/validations/schemas'
import { useAppDispatch, useAppSelector } from '@/store'
import { clearAuthError, resetPasswordThunk, selectAuthState } from '@/store/slices/authSlice'
import { maskAuthTarget, sanitizeOtp } from './utils'

//#region interfaces
interface IResetPasswordFormValues {
    otp: string
    newPassword: string
    confirmPassword: string
}

interface IResetPasswordLocationState {
    username?: string
}
//#endregion interfaces

//#region reset password screen
export function ResetPasswordScreen() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const auth = useAppSelector(selectAuthState)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<IResetPasswordFormValues>({
        defaultValues: {
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
    })
    //#endregion hooks

    //#region derived state
    const locationState = location.state as IResetPasswordLocationState | null
    const username = locationState?.username?.trim() ?? ''
    const otpValue = watch('otp')
    const newPassword = watch('newPassword')
    const otpField = register('otp', authSchemas.resetPassword.otp)
    const isBusy = isSubmitting || auth.isSubmitting || auth.isLoading
    //#endregion derived state

    //#region auth redirect
    if (auth.status === 'authenticated') {
        return <Navigate to="/" replace />
    }
    //#endregion auth redirect

    //#region missing username fallback
    if (!username) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <KeyRound className="h-6 w-6" />
                    </div>

                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        Reset session missing
                    </h1>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        We could not find the account for this password reset. Please request a new
                        reset code.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                        <Button asChild>
                            <Link to="/auth/forgot-password">Request reset code</Link>
                        </Button>

                        <Button asChild variant="outline">
                            <Link to="/auth/login">Back to sign in</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
    //#endregion missing username fallback

    //#region handlers
    const clearErrorIfNeeded = () => {
        if (auth.error || auth.errorCode) {
            dispatch(clearAuthError())
        }
    }

    const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const sanitizedValue = sanitizeOtp(event.target.value)

        setValue('otp', sanitizedValue, {
            shouldValidate: true,
            shouldDirty: true,
        })

        clearErrorIfNeeded()
    }

    const onSubmit = async (values: IResetPasswordFormValues) => {
        const result = await dispatch(
            resetPasswordThunk({
                username,
                code: values.otp,
                password: values.newPassword,
                confirmPassword: values.confirmPassword,
            }),
        )

        if (resetPasswordThunk.fulfilled.match(result)) {
            navigate('/auth/login', { replace: true })
        }
    }
    //#endregion handlers

    //#region render
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/*#region header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <KeyRound className="h-6 w-6" />
                    </div>

                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        Reset Password
                    </h1>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Enter the reset code sent to{' '}
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                            {maskAuthTarget(username)}
                        </span>
                        .
                    </p>
                </div>
                {/*#endregion header */}

                {/*#region redux error */}
                {auth.error ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        {auth.error}
                    </div>
                ) : null}
                {/*#endregion redux error */}

                {/*#region reset password form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/*#region OTP Field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="otp"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Reset code
                        </label>

                        <Input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="******"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.otp)}
                            className="text-center text-lg tracking-[0.4em]"
                            {...otpField}
                            value={otpValue}
                            onChange={handleOtpChange}
                        />

                        {errors.otp?.message ? (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {errors.otp.message}
                            </p>
                        ) : null}
                    </div>
                    {/*#endregion OTP field */}

                    {/*#region new password field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="newPassword"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            New password
                        </label>

                        <Input
                            id="newPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.newPassword)}
                            {...register('newPassword', {
                                ...authSchemas.resetPassword.newPassword,
                                onChange: clearErrorIfNeeded,
                            })}
                        />

                        {errors.newPassword?.message ? (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {errors.newPassword.message}
                            </p>
                        ) : null}
                    </div>
                    {/*#endregion new password field */}

                    {/*#region confirm password field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Confirm password
                        </label>

                        <Input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            {...register('confirmPassword', {
                                ...authSchemas.resetPassword.confirmNewPassword,
                                validate: (value) =>
                                    value === newPassword || 'Passwords do not match',
                                onChange: clearErrorIfNeeded,
                            })}
                        />

                        {errors.confirmPassword?.message ? (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {errors.confirmPassword.message}
                            </p>
                        ) : null}
                    </div>
                    {/*#endregion confirm password field */}

                    {/*#region submit button */}
                    <Button type="submit" disabled={isBusy} className="w-full">
                        {isBusy ? 'Resetting password...' : 'Reset password'}
                    </Button>
                    {/*#endregion submit button */}
                </form>
                {/*#endregion reset password form */}

                {/*#region footer */}
                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Remember your password?{' '}
                    <Link
                        to="/auth/login"
                        className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Sign in
                    </Link>
                </p>
                {/*#endregion footer */}
            </div>
        </div>
    )
    //#endregion render
}
//#endregion reset password screen
