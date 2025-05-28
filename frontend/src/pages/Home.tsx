import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page of our application.</p>
      <ThemeSwitcher />
      <Button className="mt-4" onClick={() => alert('Button clicked!')}>
        Click Me
      </Button>
    </div>
  )
}
