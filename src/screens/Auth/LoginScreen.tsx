import { ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authSchemas } from '@/validations/schemas'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  clearAuthError, 
  loginThunk, 
  selectAuthState 
} from '@/store/slices/authSlice'
import { isActivationRequiredMessage } from './utils'

//#region interfaces
interface ILoginFormValues {
  username: string
  password: string
}
//#endregion interfaces

//#region login screen
export function LoginScreen() {
  //#region hooks
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const auth = useAppSelector(selectAuthState)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
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

  const onSubmit = async (values: ILoginFormValues) => {
    const result = await dispatch(
      loginThunk({
        username: values.username.trim(),
        password: values.password,
      }),
    )

    if (loginThunk.fulfilled.match(result)) {
      navigate('/auth/select-tenant', { replace: true })
      return
    }

    if (loginThunk.rejected.match(result)) {
      const message = result.payload

      if (isActivationRequiredMessage(message)) {
        navigate('/auth/activate', { replace: true })
      }
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
            Sign In
          </h1>

          {/* <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Use your username, email, or phone number to access Base CMS.
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

        {/*#region login form */}
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
                ...authSchemas.login.username,
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
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isBusy}
              aria-invalid={Boolean(errors.password)}
              {...register('password', {
                ...authSchemas.login.password,
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

          {/*#region form actions */}
          <div className="flex items-center justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isBusy} className="w-full">
            {isBusy ? 'Signing in...' : 'Sign in'}
          </Button>
          {/*#endregion form actions */}
        </form>
        {/*#endregion login form */}

        {/*#region footer */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Create one
          </Link>
        </p>
        {/*#endregion footer */}
      </div>
    </div>
  )
  //#endregion render
}
//#endregion login ccreen
