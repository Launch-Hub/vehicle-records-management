import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div>
      <header>Header</header>
      <nav>Sidebar</nav>
      <main>
        <Outlet /> {/* Nested route will render here */}
      </main>
    </div>
  )
}

export default MainLayout
