export default function MainLayout({
  children,
  isOpen,
}: {
  children: React.ReactNode
  isOpen: boolean
}) {
  return (
    <main
      className={`transition-all duration-300 px-6 pt-20 flex-1 ${isOpen ? 'ml-64' : 'ml-0'}`}
    >
      {children}
    </main>
  )
}
