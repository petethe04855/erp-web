'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TweaksPanel from '@/components/TweaksPanel'
import { useErpStore } from '@/lib/store/useErpStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const [authenticated, setAuthenticated] = useState(false)
	const [loading, setLoading] = useState(true)
	const currentUser = useErpStore(s => s.currentUser)
	const setCurrentUser = useErpStore(s => s.setCurrentUser)
	const fetchInitialState = useErpStore(s => s.fetchInitialState)

	useEffect(() => {
		const token = localStorage.getItem('chawy_token')

		if (pathname === '/login') {
			setAuthenticated(false)
			setLoading(false)
			return
		}

		if (!token) {
			router.push('/login')
		} else {
			// Decrypt or verify token claims loosely on client for UI role mapping
			try {
				const base64Url = token.split('.')[1]
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
				const payload = JSON.parse(window.atob(base64))
				
				if (payload.exp && Date.now() >= payload.exp * 1000) {
					localStorage.removeItem('chawy_token')
					router.push('/login')
				} else {
					if (!currentUser.id) {
						setCurrentUser({
							id: payload.userId,
							name: payload.name || 'User',
							role: payload.role || 'sales'
						})
					}
					// Fetch actual database records
					fetchInitialState()
					setAuthenticated(true)
				}
			} catch (e) {
				localStorage.removeItem('chawy_token')
				router.push('/login')
			}
			setLoading(false)
		}
	}, [pathname, router, currentUser.id, setCurrentUser])

	if (pathname === '/login') {
		return <>{children}</>
	}

	if (loading) {
		return (
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100vw',
				height: '100vh',
				backgroundColor: '#F3F4F6'
			}}>
				<div style={{ color: '#4F46E5', fontWeight: 600, fontSize: 16 }}>Loading ERP system...</div>
			</div>
		)
	}

	if (!authenticated) {
		return null
	}

	return (
		<>
			<Sidebar />
			<main className="app-main" style={{ flex: 1, minHeight: '100vh', overflowX: 'hidden' }}>
				{children}
			</main>
			<TweaksPanel />
		</>
	)
}
