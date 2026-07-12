import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateShopDesign } from "../actions";
import { SHOP_CATEGORIES } from "../categories";
import { ShopDesignForm, type ShopDesignFormValues } from "../ShopDesignForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconTag } from "@/components/admin/ui/icons";

export const metadata = { title: "Edit Shop Design", robots: { index: false, follow: false } };

export default async function EditShopDesignPage({ params }: { params: { id: string } }) {
  const d = await prisma.shopDesign.findUnique({ where: { id: params.id } });
  if (!d) notFound();

  const categoryRows = await prisma.shopDesign.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = Array.from(
    new Set([...SHOP_CATEGORIES, ...categoryRows.map((c) => c.category as string).filter(Boolean)]),
  );

  const initial: ShopDesignFormValues = {
    name: d.name,
    description: d.description ?? "",
    category: d.category ?? "",
    imageUrl: d.imageUrl,
    imageAlt: d.imageAlt ?? "",
    galleryUrls: d.galleryUrls ?? [],
    featured: d.featured,
    published: d.published,
    sortOrder: d.sortOrder,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Shop Designs", href: "/admin/shop" }, { label: "Edit" }]}
        title={`Edit: ${d.name}`}
        description="Update this shop design."
      />
      <Card>
        <CardHeader title="Design details" icon={<IconTag size={18} />} />
        <CardBody>
          <ShopDesignForm action={updateShopDesign.bind(null, d.id)} initial={initial} categories={categories} />
        </CardBody>
      </Card>
    </div>
  );
}
