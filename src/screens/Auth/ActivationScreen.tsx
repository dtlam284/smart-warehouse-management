import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authSchemas } from '@/validations/schemas'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    activateThunk,
    clearAuthError,
    resendOtpThunk,
    selectAuthState,
} from '@/store/slices/authSlice'
import { appendRedirectParam, getRedirectParam } from '@/navigators/redirect'
import { maskAuthTarget, sanitizeOtp } from './utils'

//#region interfaces
interface IActivationFormValues {
    otp: string
}
//#endregion interfaces 

//#region constants
const RESEND_COOLDOWN_SECONDS = 60
//#endregion constants

//#region activation screen
export function ActivationScreen() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const auth = useAppSelector(selectAuthState)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<IActivationFormValues>({
        defaultValues: {
            otp: '',
        },
    })
    //#endregion hooks

    const [cooldown, setCooldown] = React.useState(0)

    //#region derived state
    const username = auth.pendingActivationUsername
    const otpValue = watch('otp')
    const otpField = register('otp', authSchemas.otp.code)
    const isBusy = isSubmitting || auth.isSubmitting || auth.isLoading
    const isResendDisabled = isBusy || cooldown > 0
    //#endregion derived state

    //#region effects
    React.useEffect(() => {
        if (cooldown <= 0) {
            return
        }

        const intervalId = window.setInterval(() => {
            setCooldown((currentValue) => Math.max(currentValue - 1, 0))
        }, 1000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [cooldown])
    //#endregion effects

    //#region auth redirect
    if (auth.status === 'authenticated') {
        return <Navigate to={getRedirectParam(location.search)} replace />
    }
    //#endregion auth redirect

    //#region missing username fallback
    if (!username) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        Activation session missing
                    </h1>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        We could not find an account waiting for activation. Please sign in
                        or register again.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                        <Button asChild>
                            <Link to={appendRedirectParam('/auth/login', location.search)}>
                                Back to sign in
                            </Link>
                        </Button>

                        <Button asChild variant="outline">
                            <Link to={appendRedirectParam('/auth/register', location.search)}>
                                Create account
                            </Link>
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

    const handleResendOtp = async () => {
        if (isResendDisabled) {
            return
        }

        const result = await dispatch(
            resendOtpThunk({
                username,
            }),
        )

        if (resendOtpThunk.fulfilled.match(result)) {
            setCooldown(RESEND_COOLDOWN_SECONDS)
        }
    }

    const onSubmit = async (values: IActivationFormValues) => {
        const result = await dispatch(
            activateThunk({
                username,
                otp: values.otp,
            }),
        )

        if (activateThunk.fulfilled.match(result)) {
            navigate(appendRedirectParam('/auth/select-tenant', location.search), {
                replace: true,
            })
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
                        <ShieldCheck className="h-6 w-6" />
                    </div>

                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        Activate Account
                    </h1>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Enter the 6-digit code sent to{' '}
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
                {/*#region redux error */}

                {/*#region otp form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/*#region otp field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="otp"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Verification code
                        </label>

                        <Input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            autoFocus
                            placeholder="123456"
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
                    {/*#endregion otp field */}

                    <Button type="submit" disabled={isBusy} className="w-full">
                        {isBusy ? 'Activating...' : 'Activate account'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={isResendDisabled}
                        onClick={handleResendOtp}
                        className="w-full"
                    >
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                    </Button>
                </form>
                {/*#endregion otp form */}

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already activated?{' '}
                    <Link
                        to={appendRedirectParam('/auth/login', location.search)}
                        className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
