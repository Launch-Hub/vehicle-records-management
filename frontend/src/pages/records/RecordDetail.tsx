import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function RecordDetailPage() {
  const { id } = useParams()

  useEffect(() => {
    console.count(id)
  }, [id])

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page of our application.</p>
    </div>
  )
}
