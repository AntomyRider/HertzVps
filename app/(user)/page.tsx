import HeroHome from "@/components/user/home/hero";
import DescriptionHome from "@/components/user/home/description";
import FunctionHome from "@/components/user/home/function";
import PlanHome from "@/components/user/home/plan";
import ReviewHome from "@/components/user/home/review";
import FAQHome from "@/components/user/home/faq";
import ShowOrderHome from "@/components/user/home/order";

const HomePageUser = () => {
  return (
    <div>
      <HeroHome />
      <div className="space-y-20">
        <DescriptionHome />
        <FunctionHome />
        <PlanHome />
        <ReviewHome />
        <FAQHome />
      </div>
      <ShowOrderHome />
    </div>
  );
};

export default HomePageUser;
