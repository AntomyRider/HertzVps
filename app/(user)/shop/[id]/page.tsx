import CategoryProducts from "@/components/user/shop/category-products";

interface ShopCategoryPageProps {
  params: Promise<{ id: string }>;
}

const ShopCategoryPage = async ({ params }: ShopCategoryPageProps) => {
  const { id } = await params;

  return (
    <div className="w-full px-4 sm:px-6">
      <CategoryProducts categoryId={id} />
    </div>
  );
};

export default ShopCategoryPage;
