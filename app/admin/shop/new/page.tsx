import Link from "next/link";
import { prisma } from "@/lib/db";
import { createShopDesign } from "../actions";
import { SHOP_CATEGORIES } from "../categories";
import { ShopDesignForm } from "../ShopDesignForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconTag } from "@/components/admin/ui/icons";

export const metadata = { title: "New Shop Design", robots: { index: false, follow: false } };

export default async function NewShopDesignPage() {
  const categoryRows = await prisma.shopDesign.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = Array.from(
    new Set([...SHOP_CATEGORIES, ...categoryRows.map((c) => c.category as string).filter(Boolean)]),
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Shop Designs", href: "/admin/shop" }, { label: "New" }]}
        title="Add shop design"
        description="Upload a clothing, outfit, or accessory design to the upcoming shop showcase."
      />
      <Card>
        <CardHeader title="Design details" subtitle="Images are uploaded to secure storage" icon={<IconTag size={18} />} />
        <CardBody>
          <ShopDesignForm action={createShopDesign} categories={categories} />
        </CardBody>
      </Card>
    </div>
  );
}
