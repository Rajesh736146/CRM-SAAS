import type { Contact, Company, Deal, Activity, User, Organization } from "@prisma/client";

export type ContactWithRelations = Contact & {
  company?: Company | null;
  deals?: Deal[];
  activities?: Activity[];
};

export type DealWithRelations = Deal & {
  contact?: Contact | null;
  company?: Company | null;
  activities?: Activity[];
};

export type ActivityWithRelations = Activity & {
  user?: User;
  contact?: Contact | null;
  company?: Company | null;
  deal?: Deal | null;
};

export type DashboardStats = {
  totalContacts: number;
  totalDeals: number;
  totalRevenue: number;
  openDeals: number;
};
