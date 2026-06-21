'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TweaksPanel from '@/components/TweaksPanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { ErpResource } from '@/lib/store/useErpStore'

const ROUTE_RESOURCES: Record<string, ErpResource[]> = {
	'/': ['salesOrders', 'expenses', 'invoices', 'products', 'purchaseRequests', 'purchaseOrders', 'stockLots'],
	'/quotation': ['quotations', 'products'],
	'/sales-orders': ['salesOrders', 'invoices', 'products'],
	'/invoice': ['invoices', 'salesOrders', 'products', 'settings'],
	'/returns': ['salesOrders', 'stockReturns', 'products'],
	'/purchase-req': ['purchaseRequests', 'products'],
	'/purchase-order': ['purchaseOrders', 'products'],
	'/sku': ['products', 'bundleComponents'],
	'/bom': ['products', 'bundleComponents'],
	'/stock': ['products', 'stockLots'],
	'/goods-receive': ['goodsReceives', 'purchaseOrders'],
	'/goods-issue': ['products', 'goodsIssues'],
	'/stock-transfer': ['products', 'stockTransfers'],
	'/stock-check': ['products', 'stockAdjustments'],
	'/expenses': ['expenses'],
	'/pl': ['salesOrders', 'expenses', 'tiktokOrders'],
	'/budget': ['budgets', 'expenses'],
	'/tiktok-orders': ['tiktokOrders', 'liveSessions'],
	'/live-sessions': ['liveSessions', 'contentSchedule', 'settings'],
	'/manual-order': ['manualOrders', 'products'],
	'/sampling': ['samplingCampaigns', 'products'],
	'/users': ['users'],
	'/settings': ['settings', 'products'],
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const [authenticated, setAuthenticated] = useState(false)
	const [loading, setLoading] = useState(true)
	const currentUser = useErpStore(s => s.currentUser)
	const setCurrentUser = useErpStore(s => s.setCurrentUser)
	const loadResources = useErpStore(s => s.loadResources)

	useEffect(() => {
		const token = localStorage.getItem('chawy_token')
		const redirectToLogin = () => {
			localStorage.removeItem('chawy_token')
			setAuthenticated(false)
			setLoading(false)
			window.location.replace('/login')
		}

		if (pathname === '/login') {
			setAuthenticated(false)
			setLoading(false)
			return
		}

		if (!token) {
			redirectToLogin()
		} else {
			// Decrypt or verify token claims loosely on client for UI role mapping
			try {
				const base64Url = token.split('.')[1]
				if (!base64Url) {
					redirectToLogin()
					return
				}
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
				const payload = JSON.parse(window.atob(base64))
				
				if (!payload.userId || (payload.exp && Date.now() >= payload.exp * 1000)) {
					redirectToLogin()
				} else {
					if (!currentUser.id) {
						setCurrentUser({
							id: payload.userId,
							name: payload.name || 'User',
							role: payload.role || 'sales'
						})
					}
					setAuthenticated(true)
				}
			} catch (e) {
				redirectToLogin()
			}
			setLoading(false)
		}
	}, [pathname, currentUser.id, setCurrentUser])

	useEffect(() => {
		if (!authenticated || pathname === '/login') return
		const pageResources = ROUTE_RESOURCES[pathname] ?? []
		// Settings powers module visibility in the sidebar, but other badge data
		// is loaded only by the pages that need it.
		const resources = pageResources.includes('settings')
			? pageResources
			: ['settings' as const, ...pageResources]
		loadResources(resources)
	}, [authenticated, pathname, loadResources])

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
