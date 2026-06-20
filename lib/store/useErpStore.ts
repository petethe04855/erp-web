'use client'

import { create } from 'zustand'
import {
	createErpWorkflowState,
	initialWorkflowState,
	type ErpWorkflowStore,
	type ErpWorkflowState,
	type Product,
	type BundleComponent,
	type SamplingCampaign,
	type SamplingRecipient,
} from '@/lib/store/erpWorkflow'
import type { AppUser, ErpSettings } from '@/lib/store/erpTypes'

const DEFAULT_SETTINGS: ErpSettings = {
	company: {
		name: 'Chawy Pet Food',
		taxId: '0123456789012',
		address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
		phone: '02-123-4567',
		email: 'hello@chawypet.com',
		website: 'www.chawypet.com',
		currency: 'THB',
		vatRate: 7,
		invoicePrefix: 'INV-2026-',
		soPrefix: 'SO-2026-',
	},
	notifications: {
		nearExpiry: true,
		nearExpiryDays: 30,
		lowStock: true,
		latePO: true,
		newSO: true,
		paymentDue: true,
	},
	modules: {
		quotation: true,
		salesOrders: true,
		invoice: true,
		returns: true,
		purchaseReq: true,
		purchaseOrder: true,
		skuMaster: true,
		stockBalance: true,
		goodsReceive: true,
		goodsIssue: true,
		stockTransfer: true,
		stockCheck: true,
		expenses: true,
		plReport: true,
		budget: true,
		tiktokOrders: true,
		liveContent: true,
		manualOrder: true,
		tiktokCalculator: true,
		sampling: true,
		userManagement: true,
		tiktokSetup: true,
	},
	livePayroll: {
		hourlyRate: 120,
		clipBonus: 100,
	},
}

const getApiUrl = () => {
	return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
}

const getHeaders = () => {
	const token = typeof window !== 'undefined' ? localStorage.getItem('chawy_token') : ''
	return {
		'Content-Type': 'application/json',
		'Authorization': token ? `Bearer ${token}` : '',
	}
}

const nextId = (prefix: string, ids: string[]) => {
	const max = ids.reduce((highest, id) => {
		const n = Number(id.replace(prefix, ''))
		return Number.isFinite(n) ? Math.max(highest, n) : highest
	}, 0)
	return `${prefix}${String(max + 1).padStart(4, '0')}`
}

interface CustomErpStore extends ErpWorkflowStore {
	fetchInitialState: () => Promise<void>
}

export const useErpStore = create<CustomErpStore>((set, get) => {
	const workflow = createErpWorkflowState(set as any, get as any, initialWorkflowState) as ErpWorkflowStore

	return ({
	schemaVersion: 15,
	quotations: [],
	salesOrders: [],
	invoices: [],
	purchaseRequests: [],
	purchaseOrders: [],
	goodsReceives: [],
	stockMovements: [],
	products: [],
	stockLots: [],
	samplingCampaigns: [],
	currentUser: { id: '', name: 'Guest', role: 'sales' },
	goodsIssues: [],
	stockReturns: [],
	stockAdjustments: [],
	stockTransfers: [],
	expenses: [],
	budgets: [],
	bundleComponents: [],
	tiktokOrders: [],
	liveSessions: [],
	contentSchedule: [],
	manualOrders: [],
	settings: DEFAULT_SETTINGS,

	// GET /api/init
	fetchInitialState: async () => {
		try {
			const res = await fetch(`${getApiUrl()}/api/init`, {
				headers: getHeaders(),
			})
			if (!res.ok) return
			const data = await res.json()
			set({
				quotations: data.quotations || [],
				salesOrders: data.salesOrders || [],
				invoices: data.invoices || [],
				purchaseRequests: data.purchaseRequests || [],
				purchaseOrders: data.purchaseOrders || [],
				goodsReceives: data.goodsReceives || [],
				stockMovements: data.stockMovements || [],
				products: data.products || [],
				stockLots: data.stockLots || [],
				samplingCampaigns: data.samplingCampaigns || [],
				goodsIssues: data.goodsIssues || [],
				stockReturns: data.stockReturns || [],
				stockAdjustments: data.stockAdjustments || [],
				stockTransfers: data.stockTransfers || [],
				expenses: data.expenses || [],
				budgets: data.budgets || [],
				bundleComponents: data.bundleComponents || [],
				tiktokOrders: data.tiktokOrders || [],
				liveSessions: data.liveSessions || [],
				contentSchedule: data.contentSchedule || [],
				manualOrders: data.manualOrders || [],
				settings: data.settings || DEFAULT_SETTINGS,
			})
		} catch (e) {
			console.error('Failed to load initial ERP state', e)
		}
	},

	setCurrentUser: (user: AppUser) => {
		set({ currentUser: user })
	},

	// ── Settings ──
	updateSettings: async (patch: Partial<ErpSettings>) => {
		const newSettings = { ...get().settings, ...patch }
		set({ settings: newSettings })
		await fetch(`${getApiUrl()}/api/settings`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify(patch),
		})
	},

	// ── Products ──
	addProduct: (input) => {
		const newProduct = {
			...input,
			stock: 0,
			reservedQty: 0,
			isActive: true,
			barcode: input.barcode || '',
			weightGrams: input.weightGrams || 0,
			wholesalePrice: input.wholesalePrice || 0,
			reorder: input.reorder || 0,
			isBundle: input.isBundle || false,
			note: input.note || '',
			price: input.retailPrice,
		} as Product

		fetch(`${getApiUrl()}/api/products`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(newProduct),
		}).then(res => res.json()).then(data => {
			set(s => ({ products: [...s.products, data] }))
		})

		return newProduct
	},

	updateProduct: (input) => {
		fetch(`${getApiUrl()}/api/products/${input.sku}`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify(input),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		const current = get().products.find(p => p.sku === input.sku)
		return current ? { ...current, ...input } as Product : null
	},

	deleteProduct: (sku) => {
		fetch(`${getApiUrl()}/api/products/${sku}`, {
			method: 'DELETE',
			headers: getHeaders(),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		set(s => ({ products: s.products.filter(p => p.sku !== sku) }))
		return true
	},

	setBundleComponents: (input) => {
		fetch(`${getApiUrl()}/api/bundle-components`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(input),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		const mapped = input.components.map(c => ({
			bundleSku: input.bundleSku,
			componentSku: c.componentSku,
			qty: c.qty,
		})) as BundleComponent[]
		return mapped
	},

	calcBundleVirtualStock: (bundleSku: string) => {
		const comps = get().bundleComponents.filter(c => c.bundleSku === bundleSku)
		if (comps.length === 0) return 0
		let virtualQty = Infinity
		for (const comp of comps) {
			const prod = get().products.find(p => p.sku === comp.componentSku)
			if (!prod) return 0
			const available = Math.max(0, prod.stock - prod.reservedQty)
			virtualQty = Math.min(virtualQty, Math.floor(available / comp.qty))
		}
		return virtualQty === Infinity ? 0 : virtualQty
	},

	// ── Quotations ──
	createQuotation: (input) => {
		const quotation = workflow.createQuotation(input)
		fetch(`${getApiUrl()}/api/quotations`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(quotation),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})

		return quotation
	},

	updateQuotationStatus: (id, status, note) => {
		const updated = workflow.updateQuotationStatus(id, status, note)
		fetch(`${getApiUrl()}/api/quotations/${id}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status, note }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	convertQuotationToSalesOrder: (quotationId) => {
		const salesOrder = workflow.convertQuotationToSalesOrder(quotationId)
		fetch(`${getApiUrl()}/api/quotations/${quotationId}/convert`, {
			method: 'POST',
			headers: getHeaders(),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return salesOrder
	},

	// ── Sales Orders ──
	createSalesOrder: (input) => {
		const salesOrder = workflow.createSalesOrder(input)
		fetch(`${getApiUrl()}/api/sales-orders`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(salesOrder),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})

		return salesOrder
	},

	updateSalesOrderStatus: (soId, status) => {
		const updated = workflow.updateSalesOrderStatus(soId, status)
		fetch(`${getApiUrl()}/api/sales-orders/${soId}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	// ── Invoices ──
	createInvoice: (input) => {
		const invoice = workflow.createInvoice(input)
		fetch(`${getApiUrl()}/api/invoices`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(input),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return invoice
	},

	createInvoiceFromSO: (salesOrderId) => {
		const invoice = workflow.createInvoiceFromSO(salesOrderId)
		fetch(`${getApiUrl()}/api/invoices/from-so/${salesOrderId}`, {
			method: 'POST',
			headers: getHeaders(),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return invoice
	},

	recordPayment: (invoiceId, amount) => {
		const invoice = workflow.recordPayment(invoiceId, amount)
		fetch(`${getApiUrl()}/api/invoices/${invoiceId}/payment`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({ amount }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return invoice
	},

	// ── Purchase Requests ──
	createPurchaseRequest: (input) => {
		const purchaseRequest = workflow.createPurchaseRequest(input)
		fetch(`${getApiUrl()}/api/purchase-requests`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(purchaseRequest),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return purchaseRequest
	},

	updatePRStatus: (prId, status) => {
		const updated = workflow.updatePRStatus(prId, status)
		fetch(`${getApiUrl()}/api/purchase-requests/${prId}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	convertPRtoPO: (prId, supplier, etaDate, itemCosts) => {
		const purchaseOrder = workflow.convertPRtoPO(prId, supplier, etaDate, itemCosts)
		fetch(`${getApiUrl()}/api/purchase-requests/${prId}/convert`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({ supplier, etaDate, itemCosts }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return purchaseOrder
	},

	// ── Purchase Orders ──
	createPurchaseOrder: (input) => {
		const purchaseOrder = workflow.createPurchaseOrder(input)
		fetch(`${getApiUrl()}/api/purchase-orders`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(purchaseOrder),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return purchaseOrder
	},

	updatePOStatus: (poId, status) => {
		const updated = workflow.updatePOStatus(poId, status)
		fetch(`${getApiUrl()}/api/purchase-orders/${poId}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	// ── Goods Receive ──
	createGoodsReceive: (input) => {
		const goodsReceive = workflow.createGoodsReceive(input)
		if (!goodsReceive) return null
		fetch(`${getApiUrl()}/api/goods-receives`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(goodsReceive),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return goodsReceive
	},

	// ── Sampling ──
	createSamplingCampaign: (input) => {
		const campaign: SamplingCampaign = {
			id: nextId('SAMP-', get().samplingCampaigns.map(c => c.id)),
			name: input.name,
			sku: input.sku,
			skuName: input.skuName,
			targetQty: input.targetQty,
			givenQty: 0,
			note: input.note,
			startDate: input.startDate,
			endDate: input.endDate,
			status: 'Active',
			recipients: [],
		}
		set(s => ({ samplingCampaigns: [campaign, ...s.samplingCampaigns] }))

		fetch(`${getApiUrl()}/api/sampling-campaigns`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(campaign),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return campaign
	},

	addSamplingRecipient: (input) => {
		const campaign = get().samplingCampaigns.find(c => c.id === input.campaignId)
		if (!campaign || campaign.status !== 'Active') return null

		const recipient: SamplingRecipient = {
			id: `RCP-${Date.now()}`,
			name: input.name,
			contact: input.contact,
			qtyGiven: input.qtyGiven,
			date: input.date,
			feedback: input.feedback ?? '',
			converted: input.converted ?? false,
		}
		const updated: SamplingCampaign = {
			...campaign,
			givenQty: campaign.givenQty + input.qtyGiven,
			recipients: [...campaign.recipients, recipient],
		}
		set(s => ({
			samplingCampaigns: s.samplingCampaigns.map(c => c.id === input.campaignId ? updated : c),
			products: s.products.map(p => p.sku === campaign.sku ? { ...p, stock: p.stock - input.qtyGiven } : p),
		}))

		fetch(`${getApiUrl()}/api/sampling-campaigns/${input.campaignId}/recipients`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(recipient),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	updateSamplingStatus: (id, status) => {
		const campaign = get().samplingCampaigns.find(c => c.id === id)
		if (!campaign) return null

		const updated: SamplingCampaign = { ...campaign, status }
		set(s => ({ samplingCampaigns: s.samplingCampaigns.map(c => c.id === id ? updated : c) }))

		fetch(`${getApiUrl()}/api/sampling-campaigns/${id}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	// ── Goods Issue ──
	createGoodsIssue: (input) => {
		const goodsIssue = workflow.createGoodsIssue(input)
		if (!goodsIssue) return null
		fetch(`${getApiUrl()}/api/goods-issues`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(goodsIssue),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return goodsIssue
	},

	// ── Returns ──
	createStockReturn: (input) => {
		const stockReturn = workflow.createStockReturn(input)
		fetch(`${getApiUrl()}/api/stock-returns`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(stockReturn),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return stockReturn
	},

	// ── Stock Adjustments ──
	createStockAdjustment: (input) => {
		const adjustment = workflow.createStockAdjustment(input)
		fetch(`${getApiUrl()}/api/stock-adjustments`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(adjustment),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return adjustment
	},

	// ── Stock Transfers ──
	createStockTransfer: (input) => {
		const transfer = workflow.createStockTransfer(input)
		if (!transfer) return null
		fetch(`${getApiUrl()}/api/stock-transfers`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(transfer),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return transfer
	},

	// ── Finance ──
	createExpense: (input) => {
		const expense = workflow.createExpense(input)
		fetch(`${getApiUrl()}/api/expenses`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(expense),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return expense
	},

	upsertBudget: (input) => {
		const budget = workflow.upsertBudget(input)
		fetch(`${getApiUrl()}/api/budgets`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(budget),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return budget
	},

	// ── TikTok Orders ──
	addTiktokOrder: (input) => {
		const order = workflow.addTiktokOrder(input)
		fetch(`${getApiUrl()}/api/tiktok-orders`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(order),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return order
	},

	markTiktokOrderImported: (id) => {
		fetch(`${getApiUrl()}/api/tiktok-orders/${id}/imported`, {
			method: 'PUT',
			headers: getHeaders(),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
	},

	applyTiktokSettlement: (input) => {
		const order = workflow.applyTiktokSettlement(input)
		fetch(`${getApiUrl()}/api/tiktok-orders/${input.orderId}/settle`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(input),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return order
	},

	// ── Live Sessions ──
	addLiveSession: (input) => {
		const session = workflow.addLiveSession(input)
		fetch(`${getApiUrl()}/api/live-sessions`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(session),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return session
	},

	updateLiveSessionStatus: (id, status) => {
		const updated = workflow.updateLiveSessionStatus(id, status)
		const approvedBy = get().currentUser.name
		fetch(`${getApiUrl()}/api/live-sessions/${id}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status, approvedBy }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	// ── Content Schedule ──
	addContentSchedule: (input) => {
		const item = workflow.addContentSchedule(input)
		fetch(`${getApiUrl()}/api/content-schedule`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(item),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return item
	},

	updateContentScheduleStatus: (id, status) => {
		const updated = workflow.updateContentScheduleStatus(id, status)
		fetch(`${getApiUrl()}/api/content-schedule/${id}/status`, {
			method: 'PUT',
			headers: getHeaders(),
			body: JSON.stringify({ status }),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return updated
	},

	// ── Manual Orders ──
	addManualOrder: (input) => {
		const order = workflow.addManualOrder(input)
		fetch(`${getApiUrl()}/api/manual-orders`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify(order),
		}).then(res => {
			if (res.ok) get().fetchInitialState()
		})
		return order
	},
	})
})
