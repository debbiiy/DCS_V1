'use client'

import { useEffect, useMemo, useState } from 'react'
import { FaEye, FaSearch, FaFileExport, FaSync } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import MainLayout from '../components/MainLayout'

type Role = 'ADMIN' | 'REVIEWER' | 'APPROVER' | 'USER' | ''

interface ApprovedDoc {
  id: string | number
  documentNo: string
  docName: string
  docType: string
  modifiedDate?: string | null
  submittedBy?: string | null
}

interface Props {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pageTitle?: string
  forceRole?: Role
}

export default function ApprovedDocuments({ pageTitle = 'Dokumen Disetujui', forceRole }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<Role>('')
  const [docs, setDocs] = useState<ApprovedDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fromDate, setFromDate] = useState<string>('') 
  const [toDate, setToDate] = useState<string>('')     
  const [type, setType] = useState<string>('')         
  const [q, setQ] = useState<string>('')               
  const [trigger, setTrigger] = useState<number>(0)   

  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    if (typeof window === 'undefined') return
    const r = (localStorage.getItem('userRole') || '') as Role
    setRole(forceRole ?? r)
  }, [forceRole])

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (fromDate) params.append('from', fromDate)
        if (toDate) params.append('to', toDate)
        if (type) params.append('type', type)
        if (q) params.append('q', q)

        // const url = params.toString() ? `/api/document/approved?${params.toString()}` : '/api/document/approved'
        const url = '/api/document/approved'

        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const normalized: ApprovedDoc[] = (data || []).map((d: any) => ({
          id: d.id,
          documentNo: d.documentNo ?? d.document_no ?? d.no ?? '',
          docName: d.docName ?? d.title ?? '',
          docType: d.docType ?? d.type ?? '',
          modifiedDate: d.modifiedDate ?? d.updatedAt ?? d.modified_at ?? null,
          submittedBy: d.submittedBy ?? d.owner ?? d.createdBy ?? null,
        }))

        setDocs(normalized)
      } catch (e: any) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [trigger])

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const passType = !type || (d.docType || '').toLowerCase() === type.toLowerCase()
      const passFrom =
        !fromDate ||
        (d.modifiedDate ? new Date(d.modifiedDate) >= new Date(fromDate) : true)
      const passTo =
        !toDate ||
        (d.modifiedDate ? new Date(d.modifiedDate) <= new Date(toDate + 'T23:59:59') : true)
      const term = q.trim().toLowerCase()
      const passQ =
        !term ||
        (d.documentNo?.toLowerCase().includes(term) ||
         d.docName?.toLowerCase().includes(term) ||
         d.docType?.toLowerCase().includes(term))

      return passType && passFrom && passTo && passQ
    })
  }, [docs, fromDate, toDate, type, q])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = () => {
    setPage(1)
    setTrigger((s) => s + 1)
  }

  const handleReset = () => {
    setFromDate('')
    setToDate('')
    setType('')
    setQ('')
    setPage(1)
    setTrigger((s) => s + 1)
  }

  const exportExcel = () => {
    const rows = filtered.map((d, i) => ({
      No: i + 1,
      'Doc Number': d.documentNo,
      'Last Modified':
        d.modifiedDate ? new Date(d.modifiedDate).toLocaleString() : '-',
      Type: d.docType,
      'Name / Title': d.docName,
      'Submitted By': d.submittedBy || '-',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Approved')
    XLSX.writeFile(wb, 'approved_documents.xlsx')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">
        <MainLayout isOpen={isOpen}>
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-700">{pageTitle}</h1>
          </div>

          <div className="px-6">
            <div className="bg-white rounded-md shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-xs text-gray-600 block mb-1">From</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-2 text-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">To</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-2 text-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Doc Type</label>
                <select
                  className="w-full border rounded px-2 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="SOP">SOP</option>
                  <option value="Instruksi Kerja">Instruksi Kerja</option>
                  <option value="Formulir">Formulir</option>
                  <option value="Laporan">Laporan</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 block mb-1">Search (No/Title/Type)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Cari dokumen…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <button
                    onClick={handleSearch}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded bg-sky-600 text-white hover:bg-sky-700"
                    title="Search"
                  >
                    <FaSearch /> Search
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded border hover:bg-gray-50"
                    title="Reset"
                  >
                    <FaSync /> Reset
                  </button>
                  <button
                    onClick={exportExcel}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    title="Export to Excel"
                  >
                    <FaFileExport /> Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 mt-4">
            <div className="rounded-sm overflow-hidden border border-gray-200 bg-white">
              <div className="px-4 py-3 text-sm text-gray-500">
                {loading ? 'Loading…' : error ? `Error: ${error}` : `Total: ${filtered.length} dokumen`}
              </div>
              <table className="min-w-max w-full text-sm">
                <thead className="bg-sky-50">
                  <tr className="text-sky-800">
                    <th className="text-left px-4 py-3 font-semibold">No</th>
                    <th className="text-left px-4 py-3 font-semibold">Doc Number</th>
                    <th className="text-left px-4 py-3 font-semibold">Last Modified</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Name / Title</th>
                    <th className="text-left px-4 py-3 font-semibold">Submitted By</th>
                    <th className="text-center px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        {loading ? 'Loading…' : 'No approved documents'}
                      </td>
                    </tr>
                  ) : (
                    pageData.map((doc, idx) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{(page - 1) * pageSize + idx + 1}</td>
                        <td className="px-4 py-3">{doc.documentNo}</td>
                        <td className="px-4 py-3">
                          {doc.modifiedDate ? new Date(doc.modifiedDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">{doc.docType}</td>
                        <td className="px-4 py-3">{doc.docName}</td>
                        <td className="px-4 py-3">{doc.submittedBy || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={`/api/document/${doc.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-sky-100 text-sky-700"
                            title="Lihat Lembar Pengesahan"
                          >
                            <FaEye />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-gray-500">
                  Page {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 text-sm rounded border disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </MainLayout>
        <Footer />
      </div>
    </div>
  )
}
