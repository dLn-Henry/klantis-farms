import type { Metadata } from "next";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { MediaUploader } from "@/components/media/MediaUploader";
import { MediaLibrary, PrivateNote } from "@/components/media/MediaLibrary";
import { listMedia } from "@/lib/data/repositories/media";
import { getCurrentFarmId } from "@/lib/data/current-farm";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage() {
  const [items, farmId] = await Promise.all([listMedia(), getCurrentFarmId()]);
  const site = items.filter((m) => m.bucket === "site-media");
  const priv = items.filter((m) => m.bucket === "private-media");

  return (
    <>
      <DashboardTopbar title="Media Library" />

      <div className="p-6 lg:p-8 space-y-10">
        {!farmId ? (
          <div className="bg-white border border-border rounded-md p-8 text-sm font-semibold text-ink-soft">
            You&apos;re not a member of a farm yet, so there&apos;s no library to show.
          </div>
        ) : (
          <>
            <section>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-extrabold">Website images</h2>
                  <p className="text-sm text-ink-soft mt-0.5">
                    Logo, favicon, blog and product pictures. Anyone on the internet can see these.
                  </p>
                </div>
                <MediaUploader farmId={farmId} bucket="site-media" label="Upload images" />
              </div>
              <MediaLibrary items={site} emptyText="No images yet. Upload your first one." />
            </section>

            <section>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-extrabold">Private files</h2>
                  <p className="text-sm text-ink-soft mt-0.5">Veterinary photos and documents.</p>
                  <div className="mt-1"><PrivateNote /></div>
                </div>
                <MediaUploader farmId={farmId} bucket="private-media" label="Upload files" />
              </div>
              <MediaLibrary items={priv} emptyText="No private files yet." />
            </section>
          </>
        )}
      </div>
    </>
  );
}
