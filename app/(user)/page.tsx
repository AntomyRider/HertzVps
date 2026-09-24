import HeroHome from "@/components/user/home/hero";
import DescriptionHome from "@/components/user/home/description";
import FunctionHome from "@/components/user/home/function";
import FAQHome from "@/components/user/home/faq";

const HomePageUser = () => {
  return (
    <div>
      <HeroHome />
      <DescriptionHome />
      <FunctionHome />
      <FAQHome />
    </div>
  );
};

export default HomePageUser;