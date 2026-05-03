"use client";

import { DynamicIcon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/lib/store";
import { ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

const COLORES_TILE: { bg: string; hover: string }[] = [
  { bg: "bg-blue-500",    hover: "hover:bg-blue-600"    },
  { bg: "bg-emerald-500", hover: "hover:bg-emerald-600" },
  { bg: "bg-violet-500",  hover: "hover:bg-violet-600"  },
  { bg: "bg-orange-500",  hover: "hover:bg-orange-600"  },
  { bg: "bg-rose-500",    hover: "hover:bg-rose-600"     },
  { bg: "bg-cyan-500",    hover: "hover:bg-cyan-600"     },
  { bg: "bg-amber-500",   hover: "hover:bg-amber-600"    },
  { bg: "bg-indigo-500",  hover: "hover:bg-indigo-600"   },
  { bg: "bg-teal-500",    hover: "hover:bg-teal-600"     },
  { bg: "bg-pink-500",    hover: "hover:bg-pink-600"     },
];

export default function HomePage() {
  const { menu } = useStore();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 p-1">
      {menu?.map((item, i) => {
        const { bg, hover } = COLORES_TILE[i % COLORES_TILE.length];
        const urlDirecta = item.url || item.items?.[0]?.url || "#";
        const tieneHijos = (item.items?.length ?? 0) > 0;

        return (
          <div key={i} className="relative flex flex-col">
            {/* Tile principal */}
            <Link
              href={urlDirecta}
              aria-label={`Ir a ${item.title}`}
              className="flex flex-col items-center gap-3 px-3 py-6 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent transition-colors duration-200 group"
            >
              <div
                className={`${bg} ${hover} rounded-2xl p-4 shadow-sm group-hover:shadow-lg transition-all duration-200`}
              >
                <DynamicIcon
                  name={item.icon}
                  fallback="LayoutGrid"
                  size={40}
                  className="text-white"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-medium text-center text-foreground leading-tight select-none">
                {item.title}
              </span>
            </Link>

            {/* Popover de sub-secciones */}
            {tieneHijos && (
              <div className="absolute top-2 right-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label={`Ver secciones de ${item.title}`}
                      className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <LayoutGrid size={14} aria-hidden="true" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={4}
                    className="w-52 p-1"
                  >
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.title}
                    </p>
                    <div className="my-1 h-px bg-border" />
                    {item.items.map((sub, j) => (
                      <Link
                        key={j}
                        href={sub.url}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>{sub.title}</span>
                        <ChevronRight size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
                      </Link>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
