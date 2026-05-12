import React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { LayoutDashboard, LogOut, Menu, Search } from 'lucide-react'
import { cn } from '@/utils'
import { useIsMobile } from '@/hooks/useMobile'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useAppDispatch, useAppSelector } from '@/store'
import { logoutThunk, selectAuthUser } from '@/store/slices/authSlice'

const NAV_ITEMS = [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }]

export function AdminLayout() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const user = useAppSelector(selectAuthUser)
    const isMobile = useIsMobile(1024)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)
    const sidebarOpen = isMobile ? isMobileSidebarOpen : true

    const handleLogout = async () => {
        await dispatch(logoutThunk())
        navigate('/auth/login', { replace: true })
    }

    return (
        <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: sidebarOpen ? 256 : 0,
                    x: sidebarOpen ? 0 : -256,
                }}
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:block',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
                            <span className="text-sm font-black">C</span>
                        </div>
                        CMS
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            {user?.photo ? (
                                <img
                                    src={user.photo}
                                    alt={user.firstName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {`${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'D'}`}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-200">
                                {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
                            </p>

                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user?.role?.name || user?.email || 'Administrator'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                void handleLogout()
                            }}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>

                    {user?.email ? (
                        <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                        </p>
                    ) : null}
                </div>
            </motion.aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 lg:px-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="-ml-2 rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="relative hidden w-56 md:block">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

                            <input
                                type="text"
                                placeholder="Search modules..."
                                className="h-8 w-full rounded-full border-transparent bg-slate-100 pl-9 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:bg-slate-900 dark:focus:ring-blue-900"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </header>

                <main className="cms-scrollbar flex-1 overflow-y-auto bg-slate-50/50 p-3 transition-colors duration-300 dark:bg-slate-900/50 lg:p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
