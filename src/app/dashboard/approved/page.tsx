'use client'

import { useEffect, useState } from 'react'
import { FaEye } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'
import MainLayout from '../../components/MainLayout'

export default function ApprovedDocumentsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [approvedDocs, setApprovedDocs] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/document/approved')
      .then(res => res.json())
      .then(data => setApprovedDocs(data))
      .catch(err => console.error('Failed to fetch approved docs:', err))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">
        <MainLayout isOpen={isOpen}>
          <div className="px-6 py-6">
            <div className="bg-white shadow rounded-md p-6 overflow-x-auto">
                <div className="flex gap-4 items-center mb-4">
                    <h1 className="text-lg font-semibold text-gray-800">Dokumen Disetujui</h1>
                </div>
            <div className="rounded-sm overflow-hidden border border-gray-200 bg-white">
              <table className="min-w-max w-full text-sm">
                <thead className="bg-sky-50">
                  <tr className="text-sky-800">
                    <th className="text-left px-4 py-3 font-semibold">No</th>
                    <th className="text-left px-4 py-3 font-semibold">Doc Number</th>
                    <th className="text-left px-4 py-3 font-semibold">Last Modified</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-left px-4 py-3 font-semibold">Name / Title</th>
                    <th className="text-center px-4 py-3 font-semibold">Status</th>
                    <th className="text-center px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvedDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        No approved documents
                      </td>
                    </tr>
                  ) : (
                    approvedDocs.map((doc: any, idx: number) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{doc.documentNo}</td>
                        <td className="px-4 py-3">
                          {doc.modifiedDate ? new Date(doc.modifiedDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">{doc.docType}</td>
                        <td className="px-4 py-3">{doc.docName}</td>
                        <td className="px-4 py-3 text-center">
                        <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Disetujui
                        </span>
                        </td>
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
            </div>
          </div>
          </div>
        </MainLayout>
        <Footer />
      </div>
    </div>
  )
}
