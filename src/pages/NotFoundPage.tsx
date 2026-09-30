import { ButtonLink, CardBody, CardHeader, EmptyState, Icon, PageCard } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <PageCard>
      <CardHeader showBack icon="solar:map-point-wave-bold-duotone" title="Page not found" description="Error 404" />
      <CardBody>
        <EmptyState
          title="Page not found"
          description="The page you are looking for does not exist or has moved."
          action={
            <ButtonLink to="/dashboard">
              <Icon icon="solar:home-2-linear" className="size-4" />
              Back to Dashboard
            </ButtonLink>
          }
        />
      </CardBody>
    </PageCard>
  );
}
