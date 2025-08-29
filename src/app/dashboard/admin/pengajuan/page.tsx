'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Footer from '../../../components/Footer'
import MainLayout from '../../../components/MainLayout'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import * as XLSX from 'xlsx'
import { RiFileExcelLine } from "react-icons/ri"
import {FaFilePdf } from "react-icons/fa"

interface FormData {
  isoType: string
  docType: string
  title: string
  objective: string
  file: File | null
}

export default function PengajuanPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [docNumber, setDocNumber] = useState('')
  const [userInfo, setUserInfo] = useState({ username: '', dept: '', email: '' })
  const [form, setForm] = useState<FormData>({ isoType: '', docType: '', title: '', objective: '', file: null })
  const [documents, setDocuments] = useState<any[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [docTypeFilter, setDocTypeFilter] = useState('')
  const [titleFilter, setTitleFilter] = useState('')

  useEffect(() => {
    const username = localStorage.getItem('username') || ''
    const dept = localStorage.getItem('dept') || ''
    const email = localStorage.getItem('email') || ''
    setUserInfo({ username, dept, email })

    fetchDocuments(email)
    generateDocNumber()
  }, [])

  const fetchDocuments = async (email: string) => {
    try {
      const res = await fetch(`/api/document?email=${email}`)
      const data = await res.json()
      setDocuments(data)
      setFilteredDocuments(data)
    } catch (error) {
      console.error('Fetch error:', error)
    }
  }

  const generateDocNumber = async () => {
    try {
      const res = await fetch('/api/document/all')
      const allDocs = await res.json()
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const prefix = `DOC${year}${month}`
      const counter = (allDocs.filter((d: any) => d.documentNo?.startsWith(prefix)).length + 1).toString().padStart(5, '0')
      setDocNumber(`${prefix}${counter}`)
    } catch (error) {
      console.error('Failed to generate doc number')
    }
  }
  const handleSearch = () => {
    let filtered = documents

    if (fromDate) {
      const from = new Date(fromDate)
      filtered = filtered.filter((doc) => new Date(doc.createdAt) >= from)
    }

    if (toDate) {
      const to = new Date(toDate)
      filtered = filtered.filter((doc) => new Date(doc.createdAt) <= to)
    }

    if (docTypeFilter) {
      filtered = filtered.filter((doc) => doc.docType === docTypeFilter)
    }

    if (titleFilter) {
      filtered = filtered.filter((doc) =>
        doc.docName.toLowerCase().includes(titleFilter.toLowerCase())
      )
    }
    setFilteredDocuments(filtered)
  }

  const handleReset = () => {
    setFromDate(null)
    setToDate(null)
    setDocTypeFilter('')
    setTitleFilter('')
    setFilteredDocuments(documents)
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDocuments)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents')
    XLSX.writeFile(workbook, 'Approval-documents.xlsx')
  }
  const handleSubmit = async (status: 'draft' | 'submit') => {
    if (status === 'submit') {
      const isNew = editingIndex === null
      const isFileValid = !!form.file || (!!existingFilePath && !isNew)

      if (!form.docType || !form.title || !form.objective || !isFileValid || !form.isoType) {
        alert('Lengkapi semua field untuk submit.')
        return
      }
    }

    const formData = new FormData()
    formData.append('isoType', form.isoType)
    formData.append('docType', form.docType)
    formData.append('docName', form.title)
    formData.append('objective', form.objective)
    if (form.file) formData.append('file', form.file as Blob)
    formData.append('requestFrom', userInfo.username)
    formData.append('dept', userInfo.dept)
    formData.append('email', userInfo.email)
    formData.append('status', status)
    formData.append('createdBy', userInfo.email)
    formData.append('documentNo', docNumber)
    formData.append('retainFile', (!form.file && editingIndex !== null).toString())

    const url = editingIndex !== null ? `/api/document/${documents[editingIndex].id}` : '/api/document'
    const method = editingIndex !== null ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, body: formData })
      if (res.ok) {
        const updatedDoc = await res.json()
        if (editingIndex !== null) {
          const updatedDocs = [...documents]
          updatedDocs[editingIndex] = {
            ...updatedDocs[editingIndex],
            ...updatedDoc,
          }
          setDocuments(updatedDocs)
        } else {
          setDocuments(prev => [...prev, updatedDoc])
        }
        alert(status === 'submit' ? 'Dokumen berhasil disubmit' : 'Disimpan sebagai draft')
        setShowForm(false)
        setForm({ isoType: '', docType: '', title: '', objective: '', file: null })
        setEditingIndex(null)
        setExistingFilePath(null)
        generateDocNumber()
      } else {
        const error = await res.json()
        alert(error.error || 'Gagal menyimpan dokumen')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Terjadi kesalahan saat menyimpan dokumen')
    }
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col">
        <MainLayout isOpen={isOpen}>
          <div className="bg-white shadow-md rounded-md p-6 relative overflow-x-auto">
            <div className="flex gap-4 items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Document Entry Page</h2>
              <button
                onClick={async () => {
                  setForm({ isoType: '', docType: '', title: '', objective: '', file: null })
                  setEditingIndex(null)
                  setExistingFilePath(null)
                  await generateDocNumber()
                  setShowForm(true)
                  setIsReadOnly(false)
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded text-sm shadow"
              >
                + New
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <DatePicker
                selected={fromDate}
                onChange={(date: Date | null) => setFromDate(date)}
                className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                placeholderText="FROM"
                dateFormat="dd/MM/yyyy"
              />
              <DatePicker
                selected={toDate}
                onChange={(date: Date | null) => setToDate(date)}
                className="border border-gray-300 rounded-sm px-3 py-2 text-sm"
                placeholderText="TO"
                dateFormat="dd/MM/yyyy"
              />
              <div className="relative w-48">
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="w-full appearance-none border border-gray-300 bg-white text-gray-700 py-2 px-3 pr-8 rounded leading-tight"
              >
                <option value=""></option>
                <option value="SOP">SOP</option>
                <option value="Instruksi Kerja">Instruksi Kerja</option>
                <option value="Formulir">Formulir</option>
                <option value="Laporan">Laporan</option>
                </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.516 7.548l4.484 4.483 4.484-4.483L15.4 9l-5.4 5.4L4.6 9z" />
                </svg>
               </div>
          </div>
          <input
            type="text"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-sm text-sm"
            placeholder="NAME / TITLE"
          />
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Search</button>
        <button onClick={handleReset} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm">Reset</button>
        <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"><RiFileExcelLine /></button>
      </div>
            <table className="min-w-max w-full text-sm mt-4 border">
              <thead className="bg-gray-100">
                <tr className="text-sm text-gray-700">
                  <th colSpan={4} className="border border-gray-300 px-3 py-2"></th>
                  <th colSpan={2} className="border border-gray-300 px-3 py-2">Reviewed</th>
                  <th colSpan={2} className="border border-gray-300 px-3 py-2">1st Approval</th>
                  <th colSpan={2} className="border border-gray-300 px-3 py-2">2nd Approval</th>
                  <th colSpan={2} className="border border-gray-300 px-3 py-2">Latest Modified</th>
                  <th className="border border-gray-300 px-3 py-2"></th>
                </tr>
                <tr className="text-xs text-gray-600">
                  <th className="px-3 py-1 border border-gray-300">No</th>
                  <th className="px-3 py-1 border border-gray-300">Doc Number</th>
                  <th className="px-3 py-1 border border-gray-300">Type</th>
                  <th className="px-3 py-1 border border-gray-300">Name / Title</th>
                  <th className="px-3 py-1 border border-gray-300">By</th>
                  <th className="px-3 py-1 border border-gray-300">Date</th>
                  <th className="px-3 py-1 border border-gray-300">By</th>
                  <th className="px-3 py-1 border border-gray-300">Date</th>
                  <th className="px-3 py-1 border border-gray-300">By</th>
                  <th className="px-3 py-1 border border-gray-300">Date</th>
                  <th className="px-3 py-1 border border-gray-300">By</th>
                  <th className="px-3 py-1 border border-gray-300">Date</th>
                  <th className="px-3 py-1 border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="border border-gray-300 text-center text-gray-500 py-4">No documents found</td>
                  </tr>
                ) : (
                filteredDocuments.map((doc, idx) => (
                  <tr key={idx} className="text-gray-700">
                    <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.documentNo}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.docType}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.docName}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.reviewedBy || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.reviewedDate ? new Date(doc.reviewedDate).toLocaleDateString() : '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.approval1By || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.approval1Date ? new Date(doc.approval1Date).toLocaleDateString() : '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.approval2By || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.approval2Date ? new Date(doc.approval2Date).toLocaleDateString() : '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.modifiedBy || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{doc.modifiedDate ? new Date(doc.modifiedDate).toLocaleDateString() : '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setShowForm(true)
                          setForm({
                            isoType: doc.isoType || '',
                            docType: doc.docType || '',
                            title: doc.docName || '',
                            objective: doc.objective || '',
                            file: null,
                          })
                          setDocNumber(doc.documentNo)
                          setExistingFilePath(doc.attachmentPath || null)
                          setEditingIndex(idx)
                          setIsReadOnly(doc.status === 'submit')
                        }}
                        className={`inline-flex items-center justify-center h-8 px-3 rounded-md text-sm font-medium shadow-sm transition-colors
                          ${doc.status === 'submit'
                            ? 'bg-gray-400 text-white hover:bg-gray-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        {doc.status === 'submit' ? 'View' : 'Edit'}
                      </button>

                      {doc.reviewedBy && (
                        <a
                          href={`/api/document/${doc.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Lihat PDF"
                          className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-red-500 text-white
                                    hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm
                                    transition-colors"
                        >
                          <FaFilePdf className="text-lg" />
                        </a>
                      )}
                    </div>
                  </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </MainLayout>
        <Footer />
      </div>
        {showForm && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white w-[700px] rounded shadow-lg p-6 relative border">
            <h3 className="text-lg font-semibold mb-4">Form Entry Document</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold">Document No</label><input type="text" value={docNumber} disabled className="w-full bg-gray-200 p-2 rounded border border-gray-300" /></div>
              <div><label className="text-sm font-semibold">ISO Type</label><select value={form.isoType} onChange={e => setForm({ ...form, isoType: e.target.value })} className="w-full p-2 rounded border border-gray-300"><option value="">-- Select --</option><option>HALAL</option><option>9001:2015</option><option>14001:2015</option><option>45001:2015</option><option>37001:2015</option></select></div>
              <div><label className="text-sm font-semibold">Request From</label><input type="text" value={userInfo.username} disabled className="w-full bg-gray-200 p-2 rounded border border-gray-300" /></div>
              <div><label className="text-sm font-semibold">Dept.</label><input type="text" value={userInfo.dept} disabled className="w-full bg-gray-200 p-2 rounded border border-gray-300" /></div>
              <div><label className="text-sm font-semibold">Doc. Type</label><select value={form.docType} onChange={e => setForm({ ...form, docType: e.target.value })} className="w-full p-2 rounded border border-gray-300"><option value="">-- Select --</option><option>SOP</option><option>Instruksi Kerja</option><option>Formulir</option><option>Laporan</option></select></div>
              <div><label className="text-sm font-semibold">Doc. Name / Title</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2 rounded border border-gray-300" /></div>
              <div className="col-span-2"><label className="text-sm font-semibold">Objective</label><textarea value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} className="w-full p-2 rounded border border-gray-300" /></div>
              <div className="col-span-2">
                <label className="text-sm font-semibold block mb-1">Attachment File</label>
                <input
                  type="file"
                  onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })}
                  className="block w-full p-1 border border-gray-300 rounded text-sm"
                />
               {form.file ? (
                <p className="mt-2 text-sm font-semibold text-black">
                  Attached File:{' '}
                  <a
                    href={URL.createObjectURL(form.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {form.file.name}
                  </a>
                </p>
              ) : existingFilePath ? (
                <p className="mt-2 text-sm font-semibold text-black">
                  Existing File:{' '}
                  <a
                    href={existingFilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {existingFilePath.split('/').pop()}
                  </a>
                </p>
              ) : null}
                {editingIndex !== null && !form.file && (
                  <p className="text-xs text-orange-500 mt-1">*File akan tetap sama jika tidak diupload ulang</p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Close</button>
            {!isReadOnly && (
              <>
                <button onClick={() => handleSubmit('draft')} className="px-4 py-2 bg-blue-500 text-white rounded">Save Draft</button>
                <button onClick={() => handleSubmit('submit')} className="px-4 py-2 bg-yellow-500 text-white rounded">Submit to Reviewer</button>
              </>
            )}
          </div>
          </div>
        </div>)}
    </div>
  )
}