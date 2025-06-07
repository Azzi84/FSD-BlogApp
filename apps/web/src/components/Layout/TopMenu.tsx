"use client";

import { useRouter } from "next/navigation";
import ThemeSwitch from "../Themes/ThemeSwitcher";

function debounce<T extends (...args: Any[]) => Any>(fn: T, delay = 300) {
  let timeoutId: Any;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function TopMenu({ query }: { query?: string }) {
  const router = useRouter();

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value;
      router.push(`/search?q=${search}`);
    },
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center">
        <form action="#" method="GET" className="w-full max-w-md">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              name="q"
              id="search"
              placeholder="Search"
              defaultValue={query}
              onChange={handleSearch}
              className="block w-full rounded-md border-0 py-1.5 pl-4 pr-8 text-gray-900 dark:text-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
        </form>
        <div className="ml-6">
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}
