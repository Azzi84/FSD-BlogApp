import { getHistory } from "@/lib/server-data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const months = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function HistoryList({
  selectedYear,
  selectedMonth,
}: {
  selectedYear?: string;
  selectedMonth?: string;
}) {
  const historyItems = await getHistory();

  return (
    <LinkList title="History" icon={<CalendarDaysIcon className="w-5 h-5" />}>
      {historyItems.map((item) => {
        const monthName = months[item.month];
        const isSelected = 
          selectedYear === item.year.toString() && 
          selectedMonth === item.month.toString();
        
        return (
          <SummaryItem
            key={`${item.year}-${item.month}`}
            name={`${monthName}, ${item.year}`}
            count={item.count}
            isSelected={isSelected}
            link={`/history/${item.year}/${item.month}`}
            title={`History / ${monthName}, ${item.year}`}
          />
        );
      })}
    </LinkList>
  );
}
