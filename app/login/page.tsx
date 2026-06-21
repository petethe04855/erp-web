'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useErpStore } from '@/lib/store/useErpStore'
import { readApiResponse } from '@/lib/apiResponse'

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const setCurrentUser = useErpStore(s => s.setCurrentUser)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

		try {
			const res = await fetch(`${apiUrl}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			})

			const data = await readApiResponse<{ token: string; user: Parameters<typeof setCurrentUser>[0] }>(res)

			// Store JWT Token in LocalStorage and Cookies
			localStorage.setItem('chawy_token', data.token)
			document.cookie = `chawy_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`

			// Update Zustand Store
			setCurrentUser(data.user)

			// Redirect to Dashboard
			router.push('/')
		} catch (err: any) {
			setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: '100vh',
			width: '100vw',
			flex: 1,
			backgroundColor: '#F3F4F6',
			fontFamily: 'system-ui, -apple-system, sans-serif'
		}}>
			<div style={{
				width: '100%',
				maxWidth: 420,
				backgroundColor: '#FFFFFF',
				borderRadius: 12,
				boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
				border: '1px solid #E5E7EB',
				padding: 36,
			}}>
				<div style={{ textAlign: 'center', marginBottom: 28 }}>
					<span style={{
						display: 'inline-block',
						padding: '8px 16px',
						backgroundColor: '#EEF2FF',
						color: '#4F46E5',
						borderRadius: 20,
						fontSize: 12,
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
						marginBottom: 12
					}}>
						Chawy Pet Food
					</span>
					<h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
						Sign in to ERP System
					</h2>
					<p style={{ fontSize: 14, color: '#6B7280', marginTop: 8, marginBottom: 0 }}>
						Enter admin details to manage your store
					</p>
				</div>

				{error && (
					<div style={{
						backgroundColor: '#FEF2F2',
						border: '1px solid #FCA5A5',
						color: '#DC2626',
						borderRadius: 6,
						padding: '12px 14px',
						fontSize: 13,
						marginBottom: 20,
						textAlign: 'center'
					}}>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: 18 }}>
						<label style={{
							display: 'block',
							fontSize: 12,
							fontWeight: 600,
							color: '#374151',
							marginBottom: 6,
							textTransform: 'uppercase',
							letterSpacing: '0.02em'
						}}>
							Username / User ID
						</label>
						<input
							type="text"
							value={username}
							onChange={e => setUsername(e.target.value)}
							required
							placeholder="e.g. admin"
							style={{
								width: '100%',
								padding: '10px 14px',
								border: '1px solid #D1D5DB',
								borderRadius: 6,
								fontSize: 14,
								outline: 'none',
								transition: 'border-color 0.2s',
								color: '#000000',
								backgroundColor: '#FFFFFF'
							}}
						/>
					</div>

					<div style={{ marginBottom: 24 }}>
						<label style={{
							display: 'block',
							fontSize: 12,
							fontWeight: 600,
							color: '#374151',
							marginBottom: 6,
							textTransform: 'uppercase',
							letterSpacing: '0.02em'
						}}>
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							placeholder="••••••••"
							style={{
								width: '100%',
								padding: '10px 14px',
								border: '1px solid #D1D5DB',
								borderRadius: 6,
								fontSize: 14,
								outline: 'none',
								transition: 'border-color 0.2s',
								color: '#000000',
								backgroundColor: '#FFFFFF'
							}}
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						style={{
							width: '100%',
							padding: '12px',
							backgroundColor: '#4F46E5',
							color: '#FFFFFF',
							border: 'none',
							borderRadius: 6,
							fontSize: 14,
							fontWeight: 600,
							cursor: loading ? 'not-allowed' : 'pointer',
							transition: 'background-color 0.2s',
							opacity: loading ? 0.7 : 1
						}}
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				
			</div>
		</div>
	)
}
