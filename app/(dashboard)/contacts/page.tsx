import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ContactsTable from "@/components/contacts/contacts-table";
import NewContactButton from "@/components/contacts/new-contact-button";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const contacts = await prisma.contact.findMany({
    where: { organizationId: orgId },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">{contacts.length} contacts</p>
        </div>
        <NewContactButton />
      </div>
      <ContactsTable contacts={contacts} />
    </div>
  );
}
