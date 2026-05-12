import { useEffect } from 'react'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authSchemas } from '@/validations/schemas'
import { useAppDispatch, useAppSelector } from '@/store'
import { clearAuthError, registerThunk, selectAuthState } from '@/store/slices/authSlice'

//#region interfaces
interface IRegisterFormValues {
    username: string
    fullName: string
    password: string
    confirmPassword: string
}
//#endregion interfaces

//#region register screen
export function RegisterScreen() {
    //#region hooks
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const auth = useAppSelector(selectAuthState)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<IRegisterFormValues>({
        defaultValues: {
            username: '',
            fullName: '',
            password: '',
            confirmPassword: '',
        },
    })
    //#endregion hooks

    //#region derived state
    const password = watch('password')
    const isBusy = isSubmitting || auth.isSubmitting || auth.isLoading
    //#endregion derived state

    //#region auth redirect
    if (auth.status === 'authenticated') {
        return <Navigate to="/" replace />
    }
    //#endregion auth redirect

    //#region handlers
    const clearErrorIfNeeded = () => {
        if (auth.error || auth.errorCode) {
            dispatch(clearAuthError())
        }
    }

    const onSubmit = async (values: IRegisterFormValues) => {
        const result = await dispatch(
            registerThunk({
                username: values.username.trim(),
                fullName: values.fullName.trim(),
                password: values.password,
                confirmPassword: values.confirmPassword,
            }),
        )

        if (registerThunk.fulfilled.match(result)) {
            navigate('/auth/activate', { replace: true })
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
                        <UserPlus className="h-6 w-6" />
                    </div>

                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        Sign Up
                    </h1>

                    {/* <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Register with your username, email, or phone number.
          </p> */}
                </div>
                {/*#endregion header */}

                {/*#region redux error */}
                {auth.error ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        {auth.error}
                    </div>
                ) : null}
                {/*#endregion redux error */}

                {/*#region register form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/*#region username field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="username"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Username
                        </label>

                        <Input
                            id="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Email or phone number"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.username)}
                            {...register('username', {
                                ...authSchemas.register.username,
                                onChange: clearErrorIfNeeded,
                            })}
                        />

                        {errors.username?.message ? (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {errors.username.message}
                            </p>
                        ) : null}
                    </div>
                    {/*#endregion username field */}

                    {/*#region full name field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="fullName"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Full name
                        </label>

                        <Input
                            id="fullName"
                            type="text"
                            autoComplete="name"
                            placeholder="Enter your full name"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.fullName)}
                            {...register('fullName', {
                                ...authSchemas.register.fullName,
                                onChange: clearErrorIfNeeded,
                            })}
                        />

                        {errors.fullName?.message ? (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {errors.fullName.message}
                            </p>
                        ) : null}
                    </div>
                    {/*#endregion full name field */}

                    {/*#region password field */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                            Password
                        </label>

                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Create a password"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.password)}
                            {...register('password', {
                                ...authSchemas.register.password,
                                onChange: clearErrorIfNeeded,
                            })}
                        />

                        {errors.password?.message ? (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {errors.password.message}
                            </p>
                        ) : null}
                    </div>
                    {/*#endregion password field */}

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
                            placeholder="Confirm your password"
                            disabled={isBusy}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            {...register('confirmPassword', {
                                ...authSchemas.register.confirmPassword,
                                validate: (value) => value === password || 'Passwords do not match',
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
                        {isBusy ? 'Creating account...' : 'Create account'}
                    </Button>
                    {/*#endregion submit button */}
                </form>
                {/*#endregion register form */}

                {/*#region footer */}
                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
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
//#endregion register screen
