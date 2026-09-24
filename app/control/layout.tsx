import ControlLayoutShell from "@/components/user/control/utils/layout-shell";

const LayoutControl = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <ControlLayoutShell>{children}</ControlLayoutShell>;
};

export default LayoutControl;
