"use client";

import { deleteEventAction, updateEventAction } from "@/app/actions/events";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { EventWorkspace } from "@/lib/data/types";
import { ActionFormDialog } from "./action-form-dialog";
import { ConfirmActionDialog } from "./confirm-action-dialog";

export function EventHeaderActions({
  event,
}: {
  event: EventWorkspace["event"];
}) {
  const dateValue = event.eventDate.slice(0, 10);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionFormDialog
        triggerLabel="Edit Event"
        triggerVariant="outline"
        title="Edit Event"
        description="Perbarui nama, tanggal, lokasi, dan target anggaran acara."
        action={updateEventAction}
        submitLabel="Simpan Perubahan"
        actionId="ACT-03"
        hiddenFields={{ eventId: event.id }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-event-name" className="type-body">
              Nama Acara (wajib)
            </Label>
            <Input
              id="edit-event-name"
              name="name"
              type="text"
              defaultValue={event.name}
              maxLength={160}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-event-date" className="type-body">
              Tanggal Acara (wajib)
            </Label>
            <Input
              id="edit-event-date"
              name="eventDate"
              type="date"
              defaultValue={dateValue}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-event-budget" className="type-body">
              Target Anggaran Total dalam IDR (wajib)
            </Label>
            <Input
              id="edit-event-budget"
              name="totalTargetBudget"
              type="number"
              min={0}
              step={1000}
              defaultValue={event.totalTargetBudget}
              className="type-body-numeric"
              required
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-event-location"
            className="type-body text-muted-foreground"
          >
            Lokasi (opsional)
          </Label>
          <Input
            id="edit-event-location"
            name="location"
            type="text"
            defaultValue={event.location ?? ""}
            maxLength={240}
          />
        </div>
      </ActionFormDialog>

      <ConfirmActionDialog
        triggerLabel="Delete Event"
        title="Hapus Acara"
        description={`Hapus acara "${event.name}"? Semua kategori anggaran, vendor, budget entry, dan checklist task milik acara ini akan ikut terhapus dan tidak dapat dikembalikan.`}
        action={deleteEventAction}
        submitLabel="Hapus Acara"
        actionId="ACT-04"
        hiddenFields={{ eventId: event.id }}
      >
        <p className="type-body text-muted-foreground">
          Konfirmasi ini menghapus data secara permanen (cascade). Tutup
          dialog untuk membatalkan tanpa perubahan.
        </p>
      </ConfirmActionDialog>
    </div>
  );
}
