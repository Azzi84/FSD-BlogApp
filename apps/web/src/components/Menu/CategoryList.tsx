import { getCategories } from "@/lib/server-data";
import { toUrlPath } from "@repo/utils/url";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";
import { FolderIcon } from "@heroicons/react/24/outline";

export async function CategoryList() {
  const categories = await getCategories();
  
  return (
    <LinkList title="Categories" icon={<FolderIcon className="w-5 h-5" />}>
      {categories.map((item) => (
        <SummaryItem
          key={item.name}
          count={item.count}
          name={item.name}
          isSelected={false}
          link={`/category/${toUrlPath(item.name)}`}
          title={`Category / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}
