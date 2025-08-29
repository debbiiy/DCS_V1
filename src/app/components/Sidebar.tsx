'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CgProfile } from 'react-icons/cg'
import { AiFillDashboard } from 'react-icons/ai'
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { MdOutlineRateReview,MdOutlineUploadFile } from "react-icons/md";



export default function Sidebar({ isOpen, setIsOpen }: any) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('email')
      const storedUsername = localStorage.getItem('username')
      const storedRole = localStorage.getItem('userRole')
      if (storedEmail) setEmail(storedEmail)
      if (storedUsername) setUsername(storedUsername)
      if (storedRole) setRole(storedRole)
    }
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-[#2d3244] shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 text-white flex flex-col h-full justify-between">
        <div>
          <div className="mt-6">
            <div className="flex flex-col items-center mb-2 space-y-2">
              <div className="bg-[#2d3244] rounded-full p-4 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.2),_8px_8px_15px_rgba(0,0,0,0.3)]">
                <CgProfile size={80} className="text-white" />
              </div>
              <p className="text-xl font-semibold capitalize">{username || '-'}</p>
              <p className="text-md text-gray-300 text-center">{email || '-'}</p>
            </div>
          </div>

          <ul className="space-y-4 mt-6">

            {/* 1. Dashboard */}
            <li>
              <Link
                href={
                  role === 'ADMIN'
                    ? '/dashboard/admin'
                    : role === 'APPROVER'
                    ? '/dashboard/approver'
                    : role === 'REVIEWER'
                    ? '/dashboard/reviewer'
                    : '/dashboard/user'
                }
                className="flex items-center space-x-3 text-gray-300 hover:text-white"
              >
                <AiFillDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>

            {/* 2. Dokumen Disetujui */}
            {['USER', 'ADMIN', 'REVIEWER', 'APPROVER'].includes(role) && (
              <li>
                <Link
                  href="/dashboard/approved"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white"
                >
                  <HiOutlineClipboardDocumentCheck size={20} />
                  <span>Dokumen Disetujui</span>
                </Link>
              </li>
            )}

            {/* 3. Approval Dokumen */}
            {(role === 'ADMIN' || role === 'REVIEWER' || role === 'APPROVER') && (
              <li>
                <Link
                  href={
                    role === 'ADMIN'
                      ? '/dashboard/admin/approval'
                      : role === 'REVIEWER'
                      ? '/dashboard/reviewer/approval'
                      : '/dashboard/approver/approval'
                  }
                  className="flex items-center space-x-3 text-gray-300 hover:text-white"
                >
                  <MdOutlineRateReview size={20} />
                  <span>Approval Dokumen</span>
                </Link>
              </li>
            )}

            {/* 4. Pengajuan Dokumen */}
            {(role === 'USER' || role === 'ADMIN') && (
              <li>
                <Link
                  href={
                    role === 'ADMIN'
                      ? '/dashboard/admin/pengajuan'
                      : '/dashboard/user/pengajuan'
                  }
                  className="flex items-center space-x-3 text-gray-300 hover:text-white"
                >
                  <MdOutlineUploadFile size={20} />
                  <span>Pengajuan Dokumen</span>
                </Link>
              </li>
            )}

          </ul>
        </div>
      </div>
    </div>
  )
}
