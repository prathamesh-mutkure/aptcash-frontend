import { DashboardConfig } from "@/../types";

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
      disabled: true,
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "post",
    },
    {
      title: "Transactions",
      href: "/dashboard/transactions",
      icon: "post",
    },
    {
      title: "API Keys",
      href: "/dashboard/keys",
      icon: "billing",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
      disabled: true,
    },
    {
      title: "Payments",
      href: "/dashboard/payment",
      icon: "settings",
    },
  ],
};
