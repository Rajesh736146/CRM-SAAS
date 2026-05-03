import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompaniesTable from "@/components/companies/companies-table";
import NewCompanyButton from "@/components/companies/new-company-button";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const companies = await prisma.company.findMany({
    where: { organizationId: orgId },
    include: { _count: { select: { contacts: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm mt-1">{companies.length} companies</p>
        </div>
        <NewCompanyButton />
      </div>
      <CompaniesTable companies={companies} />
    </div>
  );
}
