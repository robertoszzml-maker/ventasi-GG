// "use client"

// import { Moon, Sun } from "lucide-react"
// import { useTheme } from "next-themes"
// import React from "react"
// import { Button } from "./ui/button"

// export function ModeToggle() {
//   const { theme, setTheme } = useTheme()
//   const [mounted, setMounted] = React.useState(false);

//   const toggleTheme = () => {
//     if (theme === "dark") {
//       setTheme("light")
//     } else {
//       setTheme("dark")
//     }
//   }

//   React.useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return null;
//   }

//   return (
//     <Button variant="outline" size="icon" onClick={toggleTheme}>
//       {theme === "dark" ? (
//         <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
//       ) : (
//         <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
//       )}
//       <span className="sr-only">Toggle theme</span>
//     </Button>
//   )
// }

"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import React from "react"

import { Switch } from "@/components/ui/switch"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </div>
      <Switch checked={theme === "dark"} onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
    </div>
  )
}

