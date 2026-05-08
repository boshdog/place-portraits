export function SiteFooter() {
  return (
    <footer className="border-t border-[#e5ddd0] bg-white py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-[#3d2c1e]">Place Portraits</p>
          <p className="text-xs text-[#8a7968]">
            Personalised home artwork, created from your photo.
          </p>
          <p className="text-xs text-[#8a7968]">
            &copy; {new Date().getFullYear()} Place Portraits. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
