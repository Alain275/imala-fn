import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ImageOff, MapPin, MessageSquare, PackageSearch, Search, ShoppingCart, Store } from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { agroDealerMarketplaceService, type AgroDealerProduct } from "@/services/agroDealerMarketplace.service"
import { authService } from "@/services/auth"

export default function DealerMarketplacePage() {
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  const [products, setProducts] = useState<AgroDealerProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<AgroDealerProduct | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await agroDealerMarketplaceService.getMarketplaceProducts())
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load marketplace")
      }
    }
   
    void loadProducts()
  }, [])

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      [product.name, product.category, product.description, product.location, product.agroDealer?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [products, query])

  async function startChat(product: AgroDealerProduct) {
    try {
      const conversation = await agroDealerMarketplaceService.startConversation({
        agroDealerId: product.agroDealerId,
        productId: product.id,
        initialMessage: `Hello, I am interested in ${product.name}. Is it available?`,
      })
      navigate(`/dashboard/dealer-messages?conversation=${conversation.id}`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to start chat")
    }
  }

  // Placeholder — ordering isn't wired to the backend yet. Once the farmer-side
  // create-order endpoint exists, replace this with an actual order flow
  // (e.g. a quantity picker + call to an orders service, then navigate to
  // an order confirmation or /dashboard/orders).
  function placeOrder(product: AgroDealerProduct) {
    toast.info(`Ordering isn't available yet — message ${product.agroDealer?.name || "the dealer"} directly to arrange your purchase.`)
  }

  if (currentUser?.role !== "farmer") {
    return <div className="p-6">This marketplace is available to farmer accounts.</div>
  }

  return (
    <div className="farmer-workspace-page">
      <Header
        title="Dealer Marketplace"
        subtitle="Find farm inputs, compare availability, and contact verified agro-dealers."
      />

      <main className="mx-auto max-w-7xl space-y-5 p-3 pb-28 sm:p-6 lg:p-8 lg:pb-8">
        <section className="grid gap-4 border border-[#d7e5da] bg-white p-4 shadow-[0_8px_30px_rgba(35,72,50,.04)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-5 dark:border-[#2b4235] dark:bg-[#17271e]">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#477326]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8fe82e]" />
              Local supply network
            </p>
            <h2 className="mt-2 text-lg font-black text-[#21392b] dark:text-[#edf5ef]">
              {products.length} input{products.length === 1 ? "" : "s"} available
            </h2>
            <p className="mt-1 text-xs text-[#6a7e70]">Search by product, category, dealer, or location.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7e70]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search farm inputs…" className="pl-10" />
          </div>
        </section>

        {status && (
          <div role="alert" className="border-l-2 border-[#d51f2c] bg-[#fff3f3] px-4 py-3 text-xs text-[#a81722]">
            {status}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => {
            const image = agroDealerMarketplaceService.getImageUrl(product.imageUrls?.[0])
            const dealerName =
              product.agroDealer?.agroDealerProfile?.businessName ||
              product.agroDealer?.name ||
              "Agro-dealer"
            const location = product.location || product.agroDealer?.location || "Location on request"

            return (
              <article key={product.id} className="group overflow-hidden border border-[#d7e5da] bg-white shadow-[0_7px_24px_rgba(35,72,50,.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(35,72,50,.09)] dark:border-[#2b4235] dark:bg-[#17271e]">
                <button type="button" className="relative block aspect-[16/10] w-full overflow-hidden bg-[#e3eee5]" onClick={() => setSelectedProduct(product)}>
                  {image ? (
                    <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <span className="flex h-full flex-col items-center justify-center gap-2 text-xs text-[#6a7e70]">
                      <ImageOff className="h-6 w-6" /> No image available
                    </span>
                  )}
                  <Badge className="absolute left-3 top-3 rounded-[3px] bg-[#153923]/90 text-[9px] uppercase tracking-wide text-[#b5ff62]">
                    {product.category}
                  </Badge>
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-[#21392b] dark:text-[#edf5ef]">{product.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#6a7e70]"><Store className="h-3 w-3" /> {dealerName}</p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-black text-[#315900] dark:text-[#b5ff62]">
                      {Number(product.price).toLocaleString()}<span className="ml-1 text-[9px] font-semibold">{product.currency}</span>
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-[#647b6b]">{product.description || "Contact the dealer for product information."}</p>
                  <div className="mt-3 flex items-center justify-between border-y border-[#e3ece5] py-2 text-[10px] text-[#647b6b] dark:border-[#2b4235]">
                    <span>{product.quantity ? `${product.quantity} ${product.unit || "units"}` : "Quantity on request"}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="border-[#315900] text-[#315900] hover:bg-[#315900]/5 dark:border-[#b5ff62] dark:text-[#b5ff62]" onClick={() => placeOrder(product)}>
                      <ShoppingCart className="h-4 w-4" /> Order
                    </Button>
                    <Button className="bg-[#315900] text-[#b5ff62] hover:bg-[#254500]" onClick={() => startChat(product)}>
                      <MessageSquare className="h-4 w-4" /> Contact
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {visibleProducts.length === 0 && (
          <section className="grid min-h-64 place-items-center border border-dashed border-[#b9ccbd] bg-white/60 p-8 text-center dark:bg-[#17271e]/60">
            <div>
              <PackageSearch className="mx-auto h-9 w-9 text-[#64806e]" />
              <h3 className="mt-4 font-black">No matching inputs</h3>
              <p className="mt-1 text-xs text-[#6a7e70]">Try a different product name, category, or location.</p>
            </div>
          </section>
        )}
      </main>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[6px]">
          <DialogHeader><DialogTitle>{selectedProduct?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedProduct?.imageUrls?.[0] && (
              <img src={agroDealerMarketplaceService.getImageUrl(selectedProduct.imageUrls[0])} alt={selectedProduct.name} className="max-h-[420px] w-full object-cover" />
            )}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {selectedProduct?.imageUrls?.map((image, index) => (
                <img key={`${image}-${index}`} src={agroDealerMarketplaceService.getImageUrl(image)} alt={`${selectedProduct.name} ${index + 1}`} className="h-24 w-full object-cover sm:h-28" />
              ))}
            </div>
            {selectedProduct && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="border-[#315900] text-[#315900] hover:bg-[#315900]/5 dark:border-[#b5ff62] dark:text-[#b5ff62]" onClick={() => placeOrder(selectedProduct)}>
                  <ShoppingCart className="h-4 w-4" /> Order
                </Button>
                <Button className="bg-[#315900] text-[#b5ff62] hover:bg-[#254500]" onClick={() => startChat(selectedProduct)}>
                  <MessageSquare className="h-4 w-4" /> Contact dealer
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}