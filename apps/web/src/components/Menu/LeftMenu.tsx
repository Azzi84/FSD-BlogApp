import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";
import Link from "next/link";
import Image from "next/image";
import { CogIcon } from "@heroicons/react/24/outline";

export async function LeftMenu() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <Image 
              src="/wsulogo.png" 
              alt="WSU Logo" 
              width={32} 
              height={32} 
              className="rounded"
            />
            Full Stack Blog
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <CategoryList />
            </li>
            <li>
              <HistoryList selectedYear="" selectedMonth="" />
            </li>
            <li>
              <TagList selectedTag="" />
            </li>
            <li className="mt-auto">
              <Link href="http://localhost:3002" className="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:text-primary flex items-center gap-2">
                <CogIcon className="w-4 h-4" />
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
