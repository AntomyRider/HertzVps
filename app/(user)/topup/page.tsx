import TopupContainer from "@/components/user/topup/container";
import HeaderTopUP from "@/components/user/topup/header";

export const metadata = {
  title: "เติมเงินเข้ากระเป๋า | Hertz Manager",
  description: "เติมเงินเข้าสู่กระเป๋าผ่าน TrueMoney และธนาคาร",
};

const UserTopupPage = () => {
  return (
    <div>
      <HeaderTopUP />
      <TopupContainer />
    </div>
  );
};

export default UserTopupPage;
