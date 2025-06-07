import type { PropsWithChildren } from "react";

export function Content({ children }: PropsWithChildren) {
  return (
    <div className="lg:pl-72 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  );
}
