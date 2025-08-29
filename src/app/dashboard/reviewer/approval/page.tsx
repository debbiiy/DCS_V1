'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import Footer from '../../../components/Footer'
import MainLayout from '../../../components/MainLayout'
import * as XLSX from 'xlsx'
import { RiFileExcelLine } from "react-icons/ri"
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function ReviewerPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [isOpen, setIsOpen] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [docTypeFilter, setDocTypeFilter] = useState('')
  const [titleFilter, setTitleFilter] = useState('')

  useEffect(() => {
  if (!documents.length) return;
  if (typeParam) {
    setDocTypeFilter(typeParam);
    const filtered = documents.filter((doc) => doc.docType === typeParam);
    setFilteredDocuments(filtered);
  } else {
    setFilteredDocuments(documents);
  }
}, [documents, typeParam]);

  useEffect(() => {
    fetchAllDocuments()
    const username = localStorage.getItem('username') || ''
    setUserEmail(username)
  }, [])

  const fetchAllDocuments = async () => {
    try {
      const res = await fetch('/api/document/only-submitted')
      const data = await res.json()
      setDocuments(data)
      setFilteredDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
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

  const handleReview = async () => {
    if (!selectedDoc) return

    await fetch(`/api/document/review/${selectedDoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerUsername: userEmail }),
    })

    setShowModal(false)
    setSelectedDoc(null)
    fetchAllDocuments()
  }

  const isAlreadyReviewed = (doc: any) => {
    return !!doc.reviewedBy
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col">
        <MainLayout isOpen={isOpen}>
          <div className="bg-white shadow-md rounded-md p-6 relative overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800"> Reviewer Document Page</h2>
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
                  <tr key={doc.id} className="text-gray-700">
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
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <button
                        onClick={() => { setSelectedDoc(doc); setShowModal(true) }}
                        className={`px-2 py-1 text-xs rounded ${
                          isAlreadyReviewed(doc)
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
            {showModal && selectedDoc && (
              <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl">
                  <h2 className="text-lg font-semibold mb-4">Review Document</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><label>Document No</label><div className="mt-1 p-2 border border-gray-300 rounded bg-gray-200">{selectedDoc.documentNo}</div></div>
                    <div><label>ISO Type</label><div className="mt-1 p-2 border border-gray-300 rounded bg-white">{selectedDoc.isoType}</div></div>
                    <div><label>Request From</label><div className="mt-1 p-2 border border-gray-300 rounded bg-gray-200">{selectedDoc.requestFrom}</div></div>
                    <div><label>Dept</label><div className="mt-1 p-2 border border-gray-300 rounded bg-gray-200">{selectedDoc.dept}</div></div>
                    <div className="col-span-2"><label>Doc. Type</label><div className="mt-1 p-2 border border-gray-300 rounded bg-white">{selectedDoc.docType}</div></div>
                    <div className="col-span-2"><label>Doc. Name / Title</label><div className="mt-1 p-2 border border-gray-300 rounded bg-white">{selectedDoc.docName}</div></div>
                    <div className="col-span-2"><label>Objective</label><div className="mt-1 p-2 border border-gray-300 rounded bg-white">{selectedDoc.objective}</div></div>
                    <div className="col-span-2">
                      <label>Attached File:</label>
                      <a href={selectedDoc.attachmentPath} target="_blank" className="text-blue-600 underline">
                        {selectedDoc.documentNo}_{selectedDoc.docName}
                      </a>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setShowModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Close</button>
                    {isAlreadyReviewed(selectedDoc) ? (
                      <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded cursor-default">Already Reviewed</button>
                    ) : (
                      <button onClick={handleReview} className="bg-blue-600 text-white px-4 py-2 rounded">Review</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </MainLayout>
        <Footer />
      </div>
    </div>
  )
}
