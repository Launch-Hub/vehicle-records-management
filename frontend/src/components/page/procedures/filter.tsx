import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchIcon, FilterIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STEP_TABS } from '@/constants/general'

interface ProcedureFilterProps {
  onSearchChange: (search: string) => void
  onStepChange: (step: number | undefined) => void
  currentSearch: string
  currentStep: number | undefined
}

const stepOptions = [
  { value: 'all', label: 'Tất cả các bước' },
  ...STEP_TABS.map((step) => ({
    value: step.value.toString(),
    label: `${step.value}. ${step.label}`,
  })),
]

export function ProcedureFilter({
  onSearchChange,
  onStepChange,
  currentSearch,
  currentStep,
}: ProcedureFilterProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState(currentSearch)
  const [step, setStep] = useState(currentStep?.toString())
  const isUpdatingFromURL = useRef(false)

  // Update URL parameters when filters change (but not when updating from URL)
  useEffect(() => {
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false
      return
    }

    const searchParams = new URLSearchParams(location.search)

    if (search) {
      searchParams.set('search', search)
    } else {
      searchParams.delete('search')
    }

    if (step && step !== 'all') {
      searchParams.set('step', step)
    } else {
      searchParams.delete('step')
    }

    const newSearch = searchParams.toString()
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`

    if (newUrl !== location.pathname + location.search) {
      navigate(newUrl, { replace: true })
    }
  }, [search, step, location.pathname, navigate])

  // Parse URL parameters on component mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const urlSearch = searchParams.get('search') || ''
    const urlStep = searchParams.get('step') || 'all'

    let hasChanges = false

    if (urlSearch !== search) {
      setSearch(urlSearch)
      onSearchChange(urlSearch)
      hasChanges = true
    }

    if (urlStep !== step) {
      setStep(urlStep)
      onStepChange(urlStep !== 'all' ? parseInt(urlStep) : undefined)
      hasChanges = true
    }

    if (hasChanges) {
      isUpdatingFromURL.current = true
    }
  }, [location.search, onSearchChange, onStepChange])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleStepChange = (value: string) => {
    setStep(value)
    onStepChange(value !== 'all' ? parseInt(value) : undefined)
  }

  const clearFilters = () => {
    setSearch('')
    setStep('all')
    onSearchChange('')
    onStepChange(undefined)
  }

  const hasActiveFilters = search || (step && step !== 'all')

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 lg:px-6">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm hồ sơ..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Step Filter */}
        <div className="flex-1 max-w-xs">
          <Select value={step} onValueChange={handleStepChange}>
            <SelectTrigger className="w-full max-w-[180px]">
              <SelectValue placeholder="Chọn bước xử lý" />
            </SelectTrigger>
            <SelectContent>
              {stepOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <FilterIcon className="h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  )
}
