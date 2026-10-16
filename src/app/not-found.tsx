import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h1 className="type-heading-lg text-foreground">
        Halaman atau data tidak ditemukan
      </h1>
      <p className="mt-2 type-body text-muted-foreground">
        Data yang diminta belum tersedia atau tidak dimiliki oleh akun saat ini.
      </p>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/events">Kembali ke Events Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
