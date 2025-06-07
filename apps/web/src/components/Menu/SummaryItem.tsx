import Link from "next/link";

export function SummaryItem({
  name,
  link,
  count,
  isSelected,
  title,
}: {
  name: string;
  link: string;
  count: number;
  isSelected: boolean;
  title?: string;
}) {
  return (
    <li className="mb-1">
      <Link
        href={link}
        title={title || name}
        className={`flex justify-between px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isSelected ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
      >
        <span className="text-gray-900 dark:text-gray-100">{name}</span>
        {count > 0 && <span data-test-id="post-count" className="text-gray-500 dark:text-gray-400">{count}</span>}
      </Link>
    </li>
  );
}
