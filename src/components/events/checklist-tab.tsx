"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createChecklistTaskAction,
  deleteChecklistTaskAction,
  toggleTaskCompleteAction,
  updateChecklistTaskAction,
} from "@/app/actions/tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { TaskView, VendorView } from "@/lib/data/types";
import { ActionFormDialog } from "./action-form-dialog";
import { ConfirmActionDialog } from "./confirm-action-dialog";

const NO_VENDOR = "__none__";

function OptionalVendorField({
  vendors,
  defaultVendorId,
  fieldId,
}: {
  vendors: VendorView[];
  defaultVendorId?: string | null;
  fieldId: string;
}) {
  const [value, setValue] = React.useState(defaultVendorId ?? NO_VENDOR);

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="hidden"
        name="vendorId"
        value={value === NO_VENDOR ? "" : value}
      />
      <Label htmlFor={fieldId} className="type-body text-muted-foreground">
        Vendor Tertaut (opsional)
      </Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={fieldId} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_VENDOR}>Tanpa vendor</SelectItem>
          {vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TaskToggle({ eventId, task }: { eventId: string; task: TaskView }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-1">
      <Checkbox
        id={`task-toggle-${task.id}`}
        checked={task.isComplete}
        disabled={pending}
        aria-label={`Ubah status selesai: ${task.title}`}
        onCheckedChange={(checked) => {
          setError(null);
          startTransition(async () => {
            const result = await toggleTaskCompleteAction({
              eventId,
              taskId: task.id,
              isComplete: checked === true,
            });
            if (result.status !== "success") {
              setError(result.message ?? "Gagal memperbarui tugas.");
              return;
            }
            router.refresh();
          });
        }}
      />
      {error ? (
        <span role="alert" className="type-caption text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function ChecklistTab({
  eventId,
  tasks,
  vendors,
}: {
  eventId: string;
  tasks: TaskView[];
  vendors: VendorView[];
}) {
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortOrder, setSortOrder] = React.useState("DEADLINE_ASC");

  const filtered = tasks
    .filter((task) => {
      if (statusFilter === "COMPLETE") return task.isComplete;
      if (statusFilter === "INCOMPLETE") return !task.isComplete;
      return true;
    })
    .sort((a, b) => {
      if (a.isComplete !== b.isComplete) {
        return a.isComplete ? 1 : -1;
      }
      const diff =
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return sortOrder === "DEADLINE_DESC" ? -diff : diff;
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-lg text-foreground">
            Pre-Event Checklist
          </h2>
          <p className="type-body text-muted-foreground">
            Tugas terlambat ditandai merah; tugas selesai tetap terlihat dan
            dipindahkan ke bawah.
          </p>
        </div>

        <ActionFormDialog
          triggerLabel="Add Task"
          title="Tambah Checklist Task"
          description="Field wajib (judul, tenggat) di bagian atas; deskripsi dan vendor opsional di bawah pemisah."
          action={createChecklistTaskAction}
          submitLabel="Simpan Tugas"
          actionId="ACT-10"
          hiddenFields={{ eventId }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-task-title" className="type-body">
                Judul Tugas (wajib)
              </Label>
              <Input
                id="add-task-title"
                name="title"
                type="text"
                placeholder="Contoh: Konfirmasi jumlah porsi katering"
                maxLength={200}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-task-deadline" className="type-body">
                Tenggat (wajib)
              </Label>
              <Input
                id="add-task-deadline"
                name="deadline"
                type="date"
                required
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <OptionalVendorField
              vendors={vendors}
              fieldId="add-task-vendor"
            />
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="add-task-description"
                className="type-body text-muted-foreground"
              >
                Deskripsi (opsional)
              </Label>
              <Textarea
                id="add-task-description"
                name="description"
                placeholder="Detail tugas"
                maxLength={2000}
              />
            </div>
          </div>
        </ActionFormDialog>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
        data-action-id="ACT-19"
      >
        <div className="flex items-center gap-2">
          <Label htmlFor="task-status-filter" className="type-caption">
            Penyelesaian:
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="task-status-filter" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tugas</SelectItem>
              <SelectItem value="INCOMPLETE">Belum Selesai</SelectItem>
              <SelectItem value="COMPLETE">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="task-sort-order" className="type-caption">
            Urutkan Tenggat:
          </Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger id="task-sort-order" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEADLINE_ASC">Terdekat Dulu</SelectItem>
              <SelectItem value="DEADLINE_DESC">Terjauh Dulu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="type-heading-sm text-foreground">
            No tasks yet. Add your first task to start planning.
          </h3>
          <p className="mt-1 type-body text-muted-foreground">
            Belum ada tugas. Tambahkan tugas pertama untuk mulai melacak
            persiapan menuju hari-H.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="type-body text-muted-foreground">
            Tidak ada tugas yang cocok dengan filter ini.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <TaskToggle eventId={eventId} task={task} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span
                    className={
                      task.isComplete
                        ? "type-body text-task-complete line-through"
                        : task.isOverdue
                          ? "type-heading-sm text-task-overdue"
                          : "type-body text-foreground"
                    }
                  >
                    {task.title}
                  </span>
                  {task.vendorName ? (
                    <span className="type-caption text-muted-foreground">
                      Terkait: {task.vendorName}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span
                  className={
                    task.isOverdue
                      ? "type-caption font-semibold text-task-overdue"
                      : "type-caption text-task-upcoming"
                  }
                >
                  Tenggat {task.deadline.slice(0, 10)}
                  {task.isOverdue ? " (overdue)" : ""}
                </span>

                <ActionFormDialog
                  triggerLabel="Edit"
                  triggerVariant="outline"
                  triggerSize="sm"
                  title={`Edit Tugas — ${task.title}`}
                  description="Perbarui judul, tenggat, deskripsi, atau vendor yang tertaut."
                  action={updateChecklistTaskAction}
                  submitLabel="Simpan Tugas"
                  actionId="ACT-17"
                  hiddenFields={{ taskId: task.id, eventId }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-task-title-${task.id}`}
                        className="type-body"
                      >
                        Judul Tugas (wajib)
                      </Label>
                      <Input
                        id={`edit-task-title-${task.id}`}
                        name="title"
                        type="text"
                        defaultValue={task.title}
                        maxLength={200}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-task-deadline-${task.id}`}
                        className="type-body"
                      >
                        Tenggat (wajib)
                      </Label>
                      <Input
                        id={`edit-task-deadline-${task.id}`}
                        name="deadline"
                        type="date"
                        defaultValue={task.deadline.slice(0, 10)}
                        required
                      />
                    </div>
                    <OptionalVendorField
                      vendors={vendors}
                      defaultVendorId={task.vendorId}
                      fieldId={`edit-task-vendor-${task.id}`}
                    />
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-task-description-${task.id}`}
                        className="type-body text-muted-foreground"
                      >
                        Deskripsi (opsional)
                      </Label>
                      <Textarea
                        id={`edit-task-description-${task.id}`}
                        name="description"
                        defaultValue={task.description ?? ""}
                        maxLength={2000}
                      />
                    </div>
                  </div>
                </ActionFormDialog>

                <ConfirmActionDialog
                  triggerLabel="Hapus"
                  title={`Hapus Tugas — ${task.title}`}
                  description="Tugas akan dihapus dari checklist dan timeline."
                  action={deleteChecklistTaskAction}
                  submitLabel="Hapus Tugas"
                  actionId="ACT-18"
                  hiddenFields={{ taskId: task.id, eventId }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
