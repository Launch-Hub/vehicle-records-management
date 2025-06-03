import { ChartAreaInteractive } from "@/components/page/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/page/dashboard/section-cards";
import { DataTable } from "@/components/shared/list/data-table";
import { data } from "@/constants/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  )
}
