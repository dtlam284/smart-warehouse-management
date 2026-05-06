import React from 'react'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useAppDispatch } from '@/store'
import { loginAdmin } from '@/store/slices/authSlice'


//#region login screen
export function LoginScreen() {
  //#region hooks
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { status, refreshProfile } = useAuth()
  const dispatch = useAppDispatch()
  //#endregion hooks

  //#region local state
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  //#endregion local state

  //#region redirect state
  const redirect = searchParams.get('redirect') || '/'
  //#endregion redirect state

  //#region auth redirect
  if (status === 'authenticated') {
    return <Navigate to={redirect} replace />
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <h1 className="text-base font-semibold text-slate-900">
            Checking existing session
          </h1>
          <p className="text-sm text-slate-500">Please wait.</p>
        </div>
      </div>
    )
  }
  //#endregion auth redirect

  //#region form submit
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedUsername = username.trim()

    if (!normalizedUsername || !password.trim()) {
      toast.error('Username and password are required')
      return
    }

    setIsSubmitting(true)

    try {
      await dispatch(
        loginAdmin({
          username: normalizedUsername,
          password,
        }),
      ).unwrap()

      const profile = await refreshProfile()

      if (!profile) {
        throw new Error('Unable to validate session')
      }

      navigate(redirect, { replace: true })
      toast.success('Signed in')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }
  //#endregion form submit

  //#region render
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/*#region Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-semibold text-slate-900">Admin Sign In</h1>

          <p className="mt-1 text-sm text-slate-600">
            Use your username, email, or phone number to access Base CMS.
          </p>
        </div>
        {/*#endregion Header */}

        {/*#region Login Form */}
        <form onSubmit={submit} className="space-y-4">
          {/*#region Username Field */}
          <div>
            <input
              type="text"
              autoComplete="username"
              title="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Email or phone number"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/*#endregion Username Field */}

          {/*#region Password Field */}
          <div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              title="Password"
              placeholder="Enter your password"
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {/*#endregion Password Field */}

          {/*#region Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          {/*#endregion Submit Button */}
        </form>
        {/*#endregion Login Form */}
      </div>
    </div>
  )
  //#endregion render
}
//#endregion login screen
