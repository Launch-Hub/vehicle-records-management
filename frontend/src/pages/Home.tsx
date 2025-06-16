import logo from '@/assets/file.gif'

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex-1 flex justify-center items-center">
        <img src={logo} alt="logo" className="object-cover h-2/3 rounded-lg" />
      </div>
    </div>
  )
}
