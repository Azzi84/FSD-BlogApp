import { getTags } from "@/lib/server-data";
import { LinkList } from "./LinkList";
import { SummaryItem } from "./SummaryItem";
import { toUrlPath } from "@repo/utils/url";
import { TagIcon } from "@heroicons/react/24/outline";

export async function TagList({
  selectedTag,
}: {
  selectedTag?: string;
}) {
  const postTags = await getTags();

  return (
    <LinkList title="Tags" icon={<TagIcon className="w-5 h-5" />}>
      {postTags.map((tag) => (
        <SummaryItem
          key={tag.name}
          count={tag.count}
          name={tag.name}
          isSelected={selectedTag === toUrlPath(tag.name)}
          link={`/tags/${toUrlPath(tag.name)}`}
          title={`Tag / ${tag.name}`}
        />
      ))}
    </LinkList>
  );
}
