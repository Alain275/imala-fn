import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Bug, Pill } from "lucide-react";
import {
  agroDealerMarketplaceService,
  type AgroDealerProduct,
  type DiseaseTreatment,
  type CreateDiseaseTreatmentInput,
} from "@/services/agroDealerMarketplace.service";
import { authService } from "@/services/auth";

const initialForm: CreateDiseaseTreatmentInput = {
  diseaseName: "",
  productId: "",
  dosage: "",
  applicationNotes: "",
};

export default function DealerDiseaseTreatmentsPage() {
  const currentUser = authService.getCurrentUser();
  const [treatments, setTreatments] = useState<DiseaseTreatment[]>([]);
  const [products, setProducts] = useState<AgroDealerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<DiseaseTreatment | null>(null);
  const [form, setForm] = useState<CreateDiseaseTreatmentInput>(initialForm);
  const [saving, setSaving] = useState(false);

  const [treatmentToDelete, setTreatmentToDelete] = useState<DiseaseTreatment | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    setStatus(null);

    const [treatmentsResult, productsResult] = await Promise.allSettled([
      agroDealerMarketplaceService.getMyDiseaseTreatments(),
      agroDealerMarketplaceService.getMyProducts(),
    ]);

    if (treatmentsResult.status === "fulfilled") {
      setTreatments(treatmentsResult.value);
    } else {
      setStatus(
        treatmentsResult.reason instanceof Error ? treatmentsResult.reason.message : "Failed to load disease treatments"
      );
    }

    if (productsResult.status === "fulfilled") {
      setProducts(productsResult.value);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddForm() {
    setEditingTreatment(null);
    setForm({ ...initialForm, productId: products[0]?.id || "" });
    setFormOpen(true);
  }

  function openEditForm(treatment: DiseaseTreatment) {
    setEditingTreatment(treatment);
    setForm({
      diseaseName: treatment.diseaseName,
      productId: treatment.productId,
      dosage: treatment.dosage || "",
      applicationNotes: treatment.applicationNotes || "",
    });
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!form.diseaseName.trim()) {
      setStatus("Disease name is required");
      return;
    }
    if (!editingTreatment && !form.productId) {
      setStatus("Please select a product");
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      if (editingTreatment) {
        const updated = await agroDealerMarketplaceService.updateDiseaseTreatment(editingTreatment.id, {
          diseaseName: form.diseaseName,
          dosage: form.dosage,
          applicationNotes: form.applicationNotes,
        });
        setTreatments((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
        setStatus("Disease treatment updated successfully");
      } else {
        const created = await agroDealerMarketplaceService.createDiseaseTreatment(form);
        setTreatments((prev) => [created, ...prev]);
        setStatus("Disease treatment linked successfully");
      }
      setFormOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save disease treatment");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!treatmentToDelete) return;
    setDeleting(true);
    try {
      await agroDealerMarketplaceService.deleteDiseaseTreatment(treatmentToDelete.id);
      setTreatments((prev) => prev.filter((item) => item.id !== treatmentToDelete.id));
      setStatus("Disease treatment deleted successfully");
      setTreatmentToDelete(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete disease treatment");
    } finally {
      setDeleting(false);
    }
  }

  function productName(treatment: DiseaseTreatment) {
    return treatment.product?.name || products.find((p) => p.id === treatment.productId)?.name || "Unknown product";
  }

  if (currentUser?.role !== "agro-dealer") {
    return <div className="p-6">Only agro-dealers can manage disease treatments.</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Disease Treatments"
        subtitle="Link your products to the diseases they treat, so farmers see them right after a disease scan."
      />

      <div className="p-3 sm:p-6 space-y-6">
        {status && (
          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-4 text-sm text-muted-foreground">{status}</CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {treatments.length} treatment{treatments.length === 1 ? "" : "s"} linked
          </p>
          <Button onClick={openAddForm} disabled={products.length === 0} className="gap-2">
            <Plus className="h-4 w-4" />
            Link a Treatment
          </Button>
        </div>

        {!loading && products.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-sm text-muted-foreground">
              You need at least one product in your catalog before you can link a disease treatment.
              Add a product first from the Products page.
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="border-0 shadow-sm h-20 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : treatments.length === 0 ? (
          products.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                No disease treatments linked yet. Click "Link a Treatment" to connect a product to a disease it treats.
              </CardContent>
            </Card>
          )
        ) : (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <Card key={treatment.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                      <Bug className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold capitalize truncate">{treatment.diseaseName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                        <Pill className="h-3 w-3 flex-shrink-0" /> Treated with {productName(treatment)}
                      </p>
                      {treatment.dosage && (
                        <p className="text-xs text-muted-foreground mt-1">Dosage: {treatment.dosage}</p>
                      )}
                      {treatment.applicationNotes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{treatment.applicationNotes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEditForm(treatment)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setTreatmentToDelete(treatment)}
                      aria-label="Delete disease treatment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTreatment ? "Edit disease treatment" : "Link a disease treatment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Disease name</label>
              <Input
                placeholder="e.g. late blight"
                value={form.diseaseName}
                onChange={(e) => setForm((prev) => ({ ...prev, diseaseName: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Use the exact name shown in disease scan results for the best match.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Product</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
                value={form.productId}
                disabled={!!editingTreatment}
                onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              {editingTreatment && (
                <p className="text-xs text-muted-foreground">
                  To change the linked product, delete this treatment and create a new one.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Dosage (optional)</label>
              <Input
                placeholder="e.g. 2g per litre of water"
                value={form.dosage}
                onChange={(e) => setForm((prev) => ({ ...prev, dosage: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Application notes (optional)</label>
              <Textarea
                placeholder="e.g. Spray in the early morning, repeat every 7 days"
                value={form.applicationNotes}
                onChange={(e) => setForm((prev) => ({ ...prev, applicationNotes: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingTreatment ? "Save changes" : "Link treatment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!treatmentToDelete} onOpenChange={(open) => !open && setTreatmentToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove this treatment link?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Farmers searching for <span className="font-semibold text-foreground capitalize">{treatmentToDelete?.diseaseName}</span> will
            no longer see this product recommended. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setTreatmentToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}