import { notFound } from "next/navigation";
import { dbGetPreviewByToken } from "@/lib/data";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PreviewClient } from "./PreviewClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(_props: PageProps): Promise<Metadata> {
  return {
    title: "Your Artwork Preview — Place Portraits",
    description: "Your personalised home artwork preview is ready. Preview before you buy.",
    robots: { index: false },
  };
}

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: PageProps) {
  const { token } = await params;
  const data = await dbGetPreviewByToken(token);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 min-h-screen">
        <PreviewClient request={data} />
      </main>
      <SiteFooter />
    </>
  );
}
