"use client";

import * as React from "react";
import {
  createVendorAction,
  deleteVendorAction,
  updateVendorAction,
  updateVendorPaymentAction,
} from "@/app/actions/vendors";
import { Badge } from "@/components/ui/badge";
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
import type {
  CategoryView,
  ContractStatus,
  VendorView,
} from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import { ActionFormDialog } from "./action-form-dialog";
import {
  CONTRACT_BADGE_CLASS,
  CONTRACT_STATUS_LABEL,
  PAYMENT_BADGE_CLASS,
  PAYMENT_STATUS_LABEL,
} from "./badges";
import { ConfirmActionDialog } from "./confirm-action-dialog";

const ADD_VENDOR_BLOCKED_REASON =
  "Tambahkan minimal satu kategori anggaran di Budget Tab sebelum menambahkan vendor.";

const CONTRACT_OPTIONS: ContractStatus[] = [
  "NEGOTIATING",
  "CONTRACTED",
  "CANCELLED",
];

export function VendorsTab({
  eventId,
  categories,
  vendors,
}: {
  eventId: string;
  categories: CategoryView[];
  vendors: VendorView[];
}) {
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const filtered = vendors.filter((vendor) => {
    const matchesCategory =
      categoryFilter === "ALL" || vendor.categoryId === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      vendor.contractStatus === statusFilter ||
      vendor.paymentStatus === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const hasActiveFilter =
    categoryFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h2 className="type-heading-lg text-foreground">Vendors</h2>
          <p className="type-body text-muted-foreground">
            Status kontrak dan status pembayaran ditampilkan sebagai dua badge
            terpisah.
          </p>
        </div>

        <ActionFormDialog
          triggerLabel="Add Vendor"
          title="Tambah Vendor"
          description="Field wajib di bagian atas; kontak dan catatan opsional di bawah pemisah."
          action={createVendorAction}
          submitLabel="Simpan Vendor"
          actionId="ACT-05"
          hiddenFields={{ eventId }}
          disabledReason={
            categories.length === 0 ? ADD_VENDOR_BLOCKED_REASON : undefined
          }
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-vendor-name" className="type-body">
                Nama Vendor (wajib)
              </Label>
              <Input
                id="add-vendor-name"
                name="name"
                type="text"
                placeholder="Nama vendor"
                maxLength={160}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-vendor-category" className="type-body">
                Kategori (wajib)
              </Label>
              <Select name="categoryId" defaultValue={categories[0]?.id}>
                <SelectTrigger id="add-vendor-category" className="w-full">
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
              <Label htmlFor="add-vendor-price" className="type-body">
                Harga Kesepakatan IDR (wajib)
              </Label>
              <Input
                id="add-vendor-price"
                name="agreedPrice"
                type="number"
                min={0}
                step={1000}
                defaultValue={0}
                className="type-body-numeric"
                required
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="add-vendor-contact"
                className="type-body text-muted-foreground"
              >
                Kontak (opsional)
              </Label>
              <Input
                id="add-vendor-contact"
                name="contactInfo"
                type="text"
                placeholder="Telepon, WhatsApp, atau email"
                maxLength={240}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="add-vendor-notes"
                className="type-body text-muted-foreground"
              >
                Catatan (opsional)
              </Label>
              <Textarea
                id="add-vendor-notes"
                name="notes"
                placeholder="Detail kontrak atau paket"
                maxLength={2000}
              />
            </div>
          </div>
        </ActionFormDialog>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
        data-action-id="ACT-16"
      >
        <div className="flex items-center gap-2">
          <Label htmlFor="vendor-category-filter" className="type-caption">
            Kategori:
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="vendor-category-filter" className="w-44">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="vendor-status-filter" className="type-caption">
            Status:
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="vendor-status-filter" className="w-52">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              {CONTRACT_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  Kontrak: {CONTRACT_STATUS_LABEL[status]}
                </SelectItem>
              ))}
              <SelectItem value="UNPAID">
                Pembayaran: {PAYMENT_STATUS_LABEL.UNPAID}
              </SelectItem>
              <SelectItem value="DOWN_PAYMENT">
                Pembayaran: {PAYMENT_STATUS_LABEL.DOWN_PAYMENT}
              </SelectItem>
              <SelectItem value="PAID_IN_FULL">
                Pembayaran: {PAYMENT_STATUS_LABEL.PAID_IN_FULL}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilter ? (
          <button
            type="button"
            className="type-caption text-primary hover:underline"
            onClick={() => {
              setCategoryFilter("ALL");
              setStatusFilter("ALL");
            }}
          >
            Bersihkan filter
          </button>
        ) : null}
      </div>

      {vendors.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="type-heading-sm text-foreground">
            No vendors added yet
          </h3>
          <p className="mt-1 type-body text-muted-foreground">
            Belum ada vendor. Tambahkan vendor pertama untuk mulai mencatat
            kontrak dan pembayaran.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="type-body text-muted-foreground">
            Tidak ada vendor yang cocok dengan filter ini.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((vendor) => (
            <li
              key={vendor.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="flex flex-col gap-1">
                <span className="type-heading-sm text-foreground">
                  {vendor.name}
                </span>
                <span className="type-caption text-muted-foreground">
                  {vendor.categoryName}
                  {vendor.contactInfo ? ` · ${vendor.contactInfo}` : ""}
                </span>
                <span className="type-body-numeric text-foreground">
                  {formatRupiah(vendor.amountPaid)} dibayar /{" "}
                  {formatRupiah(vendor.agreedPrice)} kesepakatan
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={CONTRACT_BADGE_CLASS[vendor.contractStatus]}
                >
                  {CONTRACT_STATUS_LABEL[vendor.contractStatus]}
                </Badge>
                <Badge
                  variant="outline"
                  className={PAYMENT_BADGE_CLASS[vendor.paymentStatus]}
                >
                  {PAYMENT_STATUS_LABEL[vendor.paymentStatus]}
                </Badge>

                <ActionFormDialog
                  triggerLabel="Pembayaran"
                  triggerVariant="outline"
                  triggerSize="sm"
                  title={`Perbarui Pembayaran — ${vendor.name}`}
                  description="Jumlah dibayar dan status pembayaran harus konsisten dengan harga kesepakatan."
                  action={updateVendorPaymentAction}
                  submitLabel="Simpan Pembayaran"
                  actionId="ACT-06"
                  hiddenFields={{ vendorId: vendor.id, eventId }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`payment-amount-${vendor.id}`}
                        className="type-body"
                      >
                        Jumlah Dibayar IDR (wajib)
                      </Label>
                      <Input
                        id={`payment-amount-${vendor.id}`}
                        name="amountPaid"
                        type="number"
                        min={0}
                        step={1000}
                        defaultValue={vendor.amountPaid}
                        className="type-body-numeric"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`payment-status-${vendor.id}`}
                        className="type-body"
                      >
                        Status Pembayaran (wajib)
                      </Label>
                      <Select
                        name="paymentStatus"
                        defaultValue={vendor.paymentStatus}
                      >
                        <SelectTrigger
                          id={`payment-status-${vendor.id}`}
                          className="w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNPAID">Unpaid</SelectItem>
                          <SelectItem value="DOWN_PAYMENT">
                            Down Payment
                          </SelectItem>
                          <SelectItem value="PAID_IN_FULL">
                            Paid in Full
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="type-caption text-muted-foreground">
                      Aturan: 0 = Unpaid · kurang dari{" "}
                      {formatRupiah(vendor.agreedPrice)} = Down Payment · ≥
                      harga kesepakatan = Paid in Full.
                    </p>
                  </div>
                </ActionFormDialog>

                <ActionFormDialog
                  triggerLabel="Edit"
                  triggerVariant="outline"
                  triggerSize="sm"
                  title={`Edit Vendor — ${vendor.name}`}
                  description="Perbarui detail vendor. Perubahan harga harus konsisten dengan pembayaran tercatat."
                  action={updateVendorAction}
                  submitLabel="Simpan Detail"
                  actionId="ACT-15"
                  hiddenFields={{ vendorId: vendor.id, eventId }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-vendor-name-${vendor.id}`}
                        className="type-body"
                      >
                        Nama Vendor (wajib)
                      </Label>
                      <Input
                        id={`edit-vendor-name-${vendor.id}`}
                        name="name"
                        type="text"
                        defaultValue={vendor.name}
                        maxLength={160}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-vendor-category-${vendor.id}`}
                        className="type-body"
                      >
                        Kategori (wajib)
                      </Label>
                      <Select
                        name="categoryId"
                        defaultValue={vendor.categoryId}
                      >
                        <SelectTrigger
                          id={`edit-vendor-category-${vendor.id}`}
                          className="w-full"
                        >
                          <SelectValue />
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
                      <Label
                        htmlFor={`edit-vendor-price-${vendor.id}`}
                        className="type-body"
                      >
                        Harga Kesepakatan IDR (wajib)
                      </Label>
                      <Input
                        id={`edit-vendor-price-${vendor.id}`}
                        name="agreedPrice"
                        type="number"
                        min={0}
                        step={1000}
                        defaultValue={vendor.agreedPrice}
                        className="type-body-numeric"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-vendor-contract-${vendor.id}`}
                        className="type-body"
                      >
                        Status Kontrak (wajib)
                      </Label>
                      <Select
                        name="contractStatus"
                        defaultValue={vendor.contractStatus}
                      >
                        <SelectTrigger
                          id={`edit-vendor-contract-${vendor.id}`}
                          className="w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTRACT_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {CONTRACT_STATUS_LABEL[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-vendor-contact-${vendor.id}`}
                        className="type-body text-muted-foreground"
                      >
                        Kontak (opsional)
                      </Label>
                      <Input
                        id={`edit-vendor-contact-${vendor.id}`}
                        name="contactInfo"
                        type="text"
                        defaultValue={vendor.contactInfo ?? ""}
                        maxLength={240}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`edit-vendor-notes-${vendor.id}`}
                        className="type-body text-muted-foreground"
                      >
                        Catatan (opsional)
                      </Label>
                      <Textarea
                        id={`edit-vendor-notes-${vendor.id}`}
                        name="notes"
                        defaultValue={vendor.notes ?? ""}
                        maxLength={2000}
                      />
                    </div>
                  </div>
                </ActionFormDialog>

                <ConfirmActionDialog
                  triggerLabel="Hapus"
                  title={`Hapus Vendor — ${vendor.name}`}
                  description="Vendor akan dihapus dari acara ini."
                  action={deleteVendorAction}
                  submitLabel="Hapus Vendor"
                  actionId="ACT-07"
                  hiddenFields={{ vendorId: vendor.id, eventId }}
                >
                  {vendor.amountPaid > 0 ? (
                    <p className="type-body text-destructive">
                      Perhatian: vendor sudah dibayar{" "}
                      {formatRupiah(vendor.amountPaid)}. Menghapus vendor akan
                      mengurangi actual spend kategori ini.
                    </p>
                  ) : (
                    <p className="type-body text-muted-foreground">
                      Tugas checklist yang tertaut akan tetap ada tanpa vendor.
                    </p>
                  )}
                </ConfirmActionDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
