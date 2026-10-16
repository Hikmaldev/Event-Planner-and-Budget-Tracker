"use client";

import { createEventAction } from "@/app/actions/events";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ActionFormDialog } from "./action-form-dialog";

export function NewEventDialog() {
  return (
    <ActionFormDialog
      triggerLabel="New Event"
      title="Buat Acara Baru"
      description="Field wajib di bagian atas; lokasi opsional di bawah pemisah."
      action={createEventAction}
      submitLabel="Create Event"
      actionId="ACT-02"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-event-name" className="type-body">
            Nama Acara (wajib)
          </Label>
          <Input
            id="new-event-name"
            name="name"
            type="text"
            placeholder="Contoh: Pernikahan Budi & Sari"
            maxLength={160}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-event-date" className="type-body">
            Tanggal Acara (wajib)
          </Label>
          <Input
            id="new-event-date"
            name="eventDate"
            type="date"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-event-budget" className="type-body">
            Target Anggaran Total dalam IDR (wajib)
          </Label>
          <Input
            id="new-event-budget"
            name="totalTargetBudget"
            type="number"
            min={0}
            step={1000}
            placeholder="0"
            className="type-body-numeric"
            required
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="new-event-location"
          className="type-body text-muted-foreground"
        >
          Lokasi (opsional)
        </Label>
        <Input
          id="new-event-location"
          name="location"
          type="text"
          placeholder="Venue atau kota"
          maxLength={240}
        />
      </div>
    </ActionFormDialog>
  );
}
