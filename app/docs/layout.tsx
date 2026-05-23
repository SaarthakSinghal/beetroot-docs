import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { KeepAndroidOpenDialogController } from "@/components/keep-android-open/KeepAndroidOpenDialogController";
import { KeepAndroidOpenIcon } from "@/components/keep-android-open/KeepAndroidOpenIcon";
import { Github } from "lucide-react";

export default async function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <>
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
            text: "GitHub",
            url: "https://github.com/SaarthakSinghal/beetroot-docs",
            external: true,
          },
          {
            type: "icon",
            icon: <KeepAndroidOpenIcon />,
            label: "Keep Android Open",
            text: "Keep Android Open",
            url: "#keep-android-open",
            active: "none",
          },
        ]}
      >
        {children}
      </DocsLayout>
      <KeepAndroidOpenDialogController />
    </>
  );
}
