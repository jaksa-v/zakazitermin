import { CreateOrganization } from "@clerk/nextjs";

export default function Page() {
  return (
    <CreateOrganization
      hideSlug={true}
      afterCreateOrganizationUrl={"/dashboard"}
    />
  );
}
