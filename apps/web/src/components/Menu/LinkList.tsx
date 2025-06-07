import type { PropsWithChildren, ReactElement } from "react";

interface LinkListProps {
  title: string;
  icon?: ReactElement;
}

export function LinkList({ title, icon, children }: PropsWithChildren<LinkListProps>) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
        {icon && <span className="text-gray-600 dark:text-gray-300">{icon}</span>}
        {title}
      </h2>
      <ul className="space-y-1">
        {children}
      </ul>
    </div>
  );
}
