'use client'

import { useEffect, useState } from 'react'
import { FaFileAlt, FaChartBar, FaUserPlus, FaClipboardList, FaEye } from 'react-icons/fa'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Footer from '../../components/Footer'
import MainLayout from '../../components/MainLayout'
import { useRouter } from 'next/navigation'

interface Stats {
  SOP: number
  INSTRUKSI_KERJA: number
  FORMULIR: number
  LAPORAN: number
}

export default function ApproverDashboard() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const [approvedDocs, setApprovedDocs] = useState<any[]>([])

  const [stats, setStats] = useState<Stats>({
    SOP: 0,
    INSTRUKSI_KERJA: 0,
    FORMULIR: 0,
    LAPORAN: 0,
  })

  const typeLabel: Record<'SOP'|'INSTRUKSI_KERJA'|'FORMULIR'|'LAPORAN', string> = {
    SOP: 'SOP',
    INSTRUKSI_KERJA: 'Instruksi Kerja',
    FORMULIR: 'Formulir',
    LAPORAN: 'Laporan',
  }

  const goTo = (k: keyof typeof typeLabel) => {
    router.push(`/dashboard/approver/approval?type=${encodeURIComponent(typeLabel[k])}`)
  }

  useEffect(() => {
    fetch('/api/document/summary-count')
      .then(res => res.json())
      .then((data) => {
        const mappedStats: Stats = {
          SOP: 0,
          INSTRUKSI_KERJA: 0,
          FORMULIR: 0,
          LAPORAN: 0,
        }

        data.forEach((item: { docType: string; _count: { docType: number } }) => {
          const key = item.docType.trim().toUpperCase().replace(/\s+/g, '_')
          if (key in mappedStats) {
            mappedStats[key as keyof Stats] = item._count.docType
          }
        })

        setStats(mappedStats)
      })
      .catch((err) => console.error('Failed to fetch stats:', err))
  }, [])

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
          <div className="px-6 py-2">
            <div className="bg-white shadow rounded-md p-6 overflow-x-auto">
            <h1 className="text-2xl font-bold text-gray-600">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <div className="bg-cyan-600 text-white rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer" title="Jumlah dokumen SOP">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{stats.SOP}</div>
                <FaFileAlt size={28} />
              </div>
              <div className="mt-2 text-sm font-semibold">SOP</div>
              <button onClick={() => goTo('SOP')} className="text-xs mt-1 underline underline-offset-4">
                More info →
              </button>
            </div>

            <div className="bg-green-600 text-white rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer" title="Jumlah dokumen Instruksi Kerja">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{stats.INSTRUKSI_KERJA}</div>
                <FaChartBar size={28} />
              </div>
              <div className="mt-2 text-sm font-semibold">INSTRUKSI KERJA</div>
              <button onClick={() => goTo('INSTRUKSI_KERJA')} className="text-xs mt-1 underline underline-offset-4">
                More info →
              </button>
            </div>

            <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer" title="Jumlah dokumen Formulir">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{stats.FORMULIR}</div>
                <FaUserPlus size={28} />
              </div>
              <div className="mt-2 text-sm font-semibold">FORMULIR</div>
              <button onClick={() => goTo('FORMULIR')} className="text-xs mt-1 underline underline-offset-4">
                More info →
              </button>
            </div>

            <div className="bg-red-600 text-white rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-105 transform transition duration-300 ease-in-out cursor-pointer" title="Jumlah dokumen Laporan">
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{stats.LAPORAN}</div>
                <FaClipboardList size={28} />
              </div>
              <div className="mt-2 text-sm font-semibold">LAPORAN</div>
              <button onClick={() => goTo('LAPORAN')} className="text-xs mt-1 underline underline-offset-4">
                More info →
              </button>
            </div>
          </div>
          <div className="px-6 mt-8">
              <h3 className="text-md font-semibold mb-4 border-b border-gray-300 w-full text-center pb-2">
                ISO & Certification
              </h3>
              <div className="flex items-center justify-center gap-x-6 overflow-x-auto">
                <img src="/certified1.png" className="h-12" alt="ISO 27001" />
                <img src="/certified2.png" className="h-12" alt="ISO 9001" />
                <img src="/halal.png" className="h-12" alt="Halal" />
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
