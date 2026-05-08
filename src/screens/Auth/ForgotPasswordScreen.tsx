import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authSchemas } from '@/validations/schemas'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  clearAuthError,
  forgotPasswordThunk,
  selectAuthState,
} from '@/store/slices/authSlice'

//#region interfaces
interface IForgotPasswordFormValues {
  username: string
}
//#endregion interfaces

//#region forgot password screen
export function ForgotPasswordScreen() {
  //#region hooks
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const auth = useAppSelector(selectAuthState)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IForgotPasswordFormValues>({
    defaultValues: {
      username: '',
    },
  })
  //#endregion hooks

  //#region derived state
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

  const onSubmit = async (values: IForgotPasswordFormValues) => {
    const username = values.username.trim()

    const result = await dispatch(
      forgotPasswordThunk({
        username,
      }),
    )

    if (forgotPasswordThunk.fulfilled.match(result)) {
      navigate('/auth/reset-password', {
        replace: true,
        state: {
          username,
        },
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
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Forgot Password
          </h1>

          {/* <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Enter your username, email, or phone number. We&apos;ll send you a reset
            code.
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

        {/*#region forgot password form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                ...authSchemas.forgotPassword.username,
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

          {/*#region submit button */}
          <Button type="submit" disabled={isBusy} className="w-full">
            {isBusy ? 'Sending code...' : 'Send reset code'}
          </Button>
          {/*#endregion submit button */}
        </form>
        {/*#endregion forgot password form */}

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
//#endregion forgot password screen
