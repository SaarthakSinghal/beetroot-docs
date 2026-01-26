import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { Github } from "lucide-react";

export default async function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      sidebar={{ enabled: true }}
      links={[
        ...(baseOptions().links ?? []),
        {
          type: "icon",
          icon: <Github className="size-4" />,
          label: "GitHub",
          url: "https://github.com/SaarthakSinghal/beetroot-docs",
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
