import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedNavFramer } from "@/components/ui/navigation-menu";

export default function TopNavIsland() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AnimatedNavFramer />
    </ThemeProvider>
  );
}
