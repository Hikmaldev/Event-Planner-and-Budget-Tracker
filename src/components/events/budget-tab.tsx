"use client";

import {
  createBudgetEntryAction,
  createVendorCategoryAction,
  deleteVendorCategoryAction,
} from "@/app/actions/budget";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BudgetEntryView,
  CategoryView,
  EventWorkspace,
} from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import { ActionFormDialog } from "./action-form-dialog";
import { ConfirmActionDialog } from "./confirm-action-dialog";

const ADD_ENTRY_BLOCKED_REASON =
  "Tambahkan minimal satu kategori anggaran sebelum mencatat budget entry.";

function progressClass(status: CategoryView["status"]): string {
  switch (status) {
    case "over":
      return "bg-budget-over";
    case "near":
      return "bg-budget-near";
    default:
      return "bg-budget-under";
  }
}

export function BudgetTab({
  eventId,
  categories,
  budgetEntries,
  summary,
  totalTargetBudget,
}: {
  eventId: string;
  categories: CategoryView[];
  budgetEntries: BudgetEntryView[];
  summary: EventWorkspace["summary"];
  totalTargetBudget: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      {summary.hasOverBudgetCategory ? (
        <div
          role="alert"
          className="rounded-lg border border-border border-l-4 border-l-budget-over bg-red-50 p-4"
        >
          <p className="type-heading-sm text-budget-over">Over-Budget Alert</p>
          <p className="type-body text-foreground">
            Ada kategori yang actual spend-nya melebihi anggaran rencana.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-lg text-foreground">
            Budget Breakdown
          </h2>
          <p className="type-body text-muted-foreground">
            Perbandingan rencana vs aktual per kategori dan total acara.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionFormDialog
            triggerLabel="Add Category"
            title="Tambah Kategori Anggaran"
            description="Contoh: Catering, Dekorasi, Dokumentasi, Venue. Isi anggaran rencana dalam Rupiah."
            action={createVendorCategoryAction}
            submitLabel="Simpan Kategori"
            actionId="ACT-08"
            hiddenFields={{ eventId }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-category-name" className="type-body">
                  Nama Kategori (wajib)
                </Label>
                <Input
                  id="add-category-name"
                  name="name"
                  type="text"
                  placeholder="Nama kategori"
                  maxLength={120}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-category-budget" className="type-body">
                  Anggaran Rencana IDR (wajib)
                </Label>
                <Input
                  id="add-category-budget"
                  name="plannedBudget"
                  type="number"
                  min={0}
                  step={1000}
                  defaultValue={0}
                  className="type-body-numeric"
                  required
                />
              </div>
            </div>
          </ActionFormDialog>

          <ActionFormDialog
            triggerLabel="Add Budget Entry"
            triggerVariant="outline"
            title="Tambah Budget Entry"
            description="Catat pengeluaran yang tidak terkait vendor tertentu di bawah sebuah kategori."
            action={createBudgetEntryAction}
            submitLabel="Simpan Budget Entry"
            actionId="ACT-09"
            hiddenFields={{ eventId }}
            disabledReason={
              categories.length === 0 ? ADD_ENTRY_BLOCKED_REASON : undefined
            }
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-entry-category" className="type-body">
                  Kategori (wajib)
                </Label>
                <Select name="categoryId" defaultValue={categories[0]?.id}>
                  <SelectTrigger id="add-entry-category" className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-entry-description" className="type-body">
                  Deskripsi (wajib)
                </Label>
                <Input
                  id="add-entry-description"
                  name="description"
                  type="text"
                  placeholder="Contoh: Biaya cetak undangan"
                  maxLength={240}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-entry-amount" className="type-body">
                  Jumlah IDR (wajib)
                </Label>
                <Input
                  id="add-entry-amount"
                  name="amount"
                  type="number"
                  min={0}
                  step={1000}
                  defaultValue={0}
                  className="type-body-numeric"
                  required
                />
              </div>
            </div>
          </ActionFormDialog>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="type-heading-sm text-foreground">
            Overall Event Budget
          </span>
          <span className="type-body-numeric text-foreground">
            Target {formatRupiah(totalTargetBudget)} · Total Rencana{" "}
            {formatRupiah(summary.totalPlanned)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="type-body text-muted-foreground">
            Aktual <span className="type-body-numeric">{formatRupiah(summary.totalActual)}</span>{" "}
            dari target <span className="type-body-numeric">{formatRupiah(totalTargetBudget)}</span>
          </span>
          <span
            className={
              summary.remaining < 0
                ? "type-body-numeric font-semibold text-budget-over"
                : "type-body-numeric text-foreground"
            }
          >
            Sisa {formatRupiah(summary.remaining)}
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="type-heading-sm text-foreground">
            Belum ada kategori anggaran
          </h3>
          <p className="mt-1 type-body text-muted-foreground">
            Tambahkan kategori pertama untuk mulai membandingkan rencana vs
            aktual. Kategori tidak dapat dihapus selama masih memiliki vendor
            atau budget entry (dibatasi di level database).
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => {
            const pct =
              category.plannedBudget > 0
                ? Math.round(
                    (category.actual / category.plannedBudget) * 100
                  )
                : category.actual > 0
                  ? 100
                  : 0;
            const entries = budgetEntries.filter(
              (entry) => entry.categoryId === category.id
            );

            return (
              <li
                key={category.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={
                      category.status === "over"
                        ? "type-heading-sm font-semibold text-budget-over"
                        : "type-heading-sm text-foreground"
                    }
                  >
                    {category.name}
                  </span>
                  <span className="type-body-numeric text-foreground">
                    {formatRupiah(category.actual)} /{" "}
                    {formatRupiah(category.plannedBudget)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${progressClass(category.status)}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <span
                    className={
                      category.status === "over"
                        ? "type-body-numeric font-semibold text-budget-over"
                        : category.status === "near"
                          ? "type-body-numeric font-semibold text-budget-near"
                          : "type-body-numeric text-muted-foreground"
                    }
                  >
                    {category.actual > 0 || category.plannedBudget > 0
                      ? `${pct}%`
                      : "0%"}
                    {category.status === "over" ? " (over budget)" : ""}
                  </span>
                </div>

                {entries.length > 0 ? (
                  <ul className="flex flex-col gap-1 border-t border-border pt-2">
                    {entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="type-caption text-muted-foreground">
                          {entry.description} ·{" "}
                          {entry.createdAt.slice(0, 10)}
                        </span>
                        <span className="type-body-numeric text-foreground">
                          {formatRupiah(entry.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex justify-end">
                  <ConfirmActionDialog
                    triggerLabel="Hapus Kategori"
                    title={`Hapus Kategori — ${category.name}`}
                    description="Kategori hanya dapat dihapus jika tidak ada vendor atau budget entry yang tertaut."
                    action={deleteVendorCategoryAction}
                    submitLabel="Hapus Kategori"
                    actionId="ACT-20"
                    hiddenFields={{ categoryId: category.id, eventId }}
                  >
                    <p className="type-body text-muted-foreground">
                      Jika kategori masih dipakai, penghapusan akan ditolak dan
                      data tidak berubah.
                    </p>
                  </ConfirmActionDialog>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
