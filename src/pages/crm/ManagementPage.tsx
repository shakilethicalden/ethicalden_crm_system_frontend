import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Badge, Button, Checkbox, DataTable, Field, FormGrid, Icon, IconButton, Input, Select, Textarea } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import type { ApiRequestOptions } from "@/libs/api/client";
import type {
  AuditLog,
  AuditLogPayload,
  Campaign,
  CampaignPayload,
  Country,
  CountryBulkPayload,
  CountryPayload,
  LoginUser,
  Member,
  MemberPayload,
  Region,
  RegionPayload,
  Service,
  ServicePayload,
  Team,
  TeamPayload,
  UserType,
} from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import {
  auditLogService,
  campaignService,
  countryService,
  memberService,
  regionService,
  serviceService,
  teamService,
  userService,
} from "@/libs/services";
import type { ListParams } from "@/libs/services";
import { formatDate, formatDateTime, formatStatus } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, DetailGrid, DetailItem, DetailModal, FormModal, PageTitle, RowButtons } from "./crmPageUtils";

export type ResourceKey = "users" | "members" | "teams" | "countries" | "regions" | "services" | "campaigns" | "audit";
type Option = { value: string; label: string; parent?: string };
type FieldKind = "text" | "email" | "number" | "date" | "textarea" | "select" | "multi" | "checkbox" | "json";
type FormField = {
  name: string;
  label: string;
  kind?: FieldKind;
  options?: Option[];
  filterBy?: string;
  clears?: string[];
  required?: boolean;
  full?: boolean;
};

type ResourceConfig<Row, Payload> = {
  key: ResourceKey;
  label: string;
  icon: Parameters<typeof PageTitle>[0]["icon"];
  description: string;
  service?: {
    list: (params?: ListParams, options?: ApiRequestOptions) => Promise<{ data: Row[]; count: number }>;
    create: (payload: Payload) => Promise<unknown>;
    patch: (id: string, payload: Partial<Payload>) => Promise<unknown>;
    delete: (id: string) => Promise<unknown>;
  };
  readonly?: boolean;
  fields: FormField[];
  empty: Payload;
  toPayload: (value: Payload, editing?: Row | null) => Payload;
  toInitial: (row: Row) => Payload;
  columns: Parameters<typeof DataTable<Row>>[0]["columns"];
  searchText: (row: Row) => string;
  titleOf: (row: Row) => string;
  details: (row: Row) => Array<{ label: string; value: ReactNode; full?: boolean }>;
};
type LooseResourceConfig = ResourceConfig<{ id: string | number } & Record<string, unknown>, Record<string, unknown>>;

const roles: UserType[] = ["super_admin", "team_leader", "lead_generator", "calling_agent"];
const campaignStatuses = ["draft", "active", "paused", "completed", "cancelled"];

function memberName(member?: Member | null) {
  return member?.name ?? member?.user_detail?.email ?? member?.user?.email ?? "N/A";
}

function optionLabel(id: string, options: Option[]) {
  return options.find((item) => item.value === id)?.label ?? id;
}

function toJson(value: unknown) {
  if (!value) return "";
  return JSON.stringify(value, null, 2);
}

function parseJson(text: string) {
  if (!text.trim()) return null;
  return JSON.parse(text);
}

function booleanTone(value: boolean): BadgeTone {
  return value ? "success" : "muted";
}

export default function ManagementPage({ resource }: { resource?: ResourceKey }) {
  const [activeResource, setActiveResource] = useState<ResourceKey>("members");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [createSignal, setCreateSignal] = useState(0);
  const [bulkValue, setBulkValue] = useState<CountryBulkPayload>({
    countries: [{ name: "Bangladesh", regions: ["Dhaka", "Chittagong"] }],
  });

  const commonOptions = { page: 1, page_size: 100, ordering: "name" };
  const members = useAsyncData((_fresh, signal) => memberService.list(commonOptions, { signal }), [], { key: "mgmt-members" });
  const teams = useAsyncData((_fresh, signal) => teamService.list(commonOptions, { signal }), [], { key: "mgmt-teams" });
  const countries = useAsyncData((_fresh, signal) => countryService.list(commonOptions, { signal }), [], { key: "mgmt-countries" });
  const regions = useAsyncData((_fresh, signal) => regionService.list(commonOptions, { signal }), [], { key: "mgmt-regions" });
  const services = useAsyncData((_fresh, signal) => serviceService.list(commonOptions, { signal }), [], { key: "mgmt-services" });

  const memberOptions = (members.data?.data ?? []).map((member) => ({ value: member.id, label: memberName(member) }));
  const teamOptions = (teams.data?.data ?? []).map((team) => ({ value: team.id, label: team.name }));
  const countryOptions = (countries.data?.data ?? []).map((country) => ({ value: country.id, label: country.name }));
  const regionOptions = (regions.data?.data ?? []).map((region) => ({
    value: region.id,
    label: `${region.name} (${region.country_detail?.name ?? region.country})`,
    parent: region.country,
  }));
  const serviceOptions = (services.data?.data ?? []).map((service) => ({ value: service.id, label: service.name }));

  const configs = useMemo<LooseResourceConfig[]>(
    () => ([
      usersConfig(),
      membersConfig(),
      teamsConfig(memberOptions),
      countriesConfig(),
      regionsConfig(countryOptions),
      servicesConfig(),
      campaignsConfig(serviceOptions, countryOptions, regionOptions, teamOptions),
      auditConfig(),
    ] as unknown as LooseResourceConfig[]),
    [memberOptions, teamOptions, countryOptions, regionOptions, serviceOptions],
  );
  const active = resource ?? activeResource;
  const config = configs.find((item) => item.key === active) ?? configs[0];
  const showResourceTabs = !resource;
  const showBulkAction = active === "countries";

  async function submitBulk(value: CountryBulkPayload) {
    await countryService.bulkCreate(normalizeBulkPayload(value));
    setBulkOpen(false);
    void countries.reload();
    void regions.reload();
  }

  return (
    <CrmPage>
      <PageTitle
        icon={config.icon}
        title={config.label}
        description={config.description}
        onRefresh={() => {
          void members.reload();
          void teams.reload();
          void countries.reload();
          void regions.reload();
          void services.reload();
        }}
        isRefreshing={members.isRefreshing || teams.isRefreshing || countries.isRefreshing || regions.isRefreshing || services.isRefreshing}
        onCreate={config.readonly ? undefined : () => setCreateSignal((value) => value + 1)}
        createLabel={`New ${config.label}`}
      />
      {showResourceTabs || showBulkAction ? (
        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
          {showResourceTabs
            ? configs.map((item) => (
                <Button key={item.key} variant={item.key === active ? "primary" : "ghost"} onClick={() => setActiveResource(item.key)}>
                  <Icon icon={item.icon as NonNullable<typeof item.icon>} className="size-4" />
                  {item.label}
                </Button>
              ))
            : null}
          {showBulkAction ? (
            <Button variant="ghost" onClick={() => setBulkOpen(true)}>
              <Icon icon="solar:database-bold-duotone" className="size-4" />
              Bulk Countries
            </Button>
          ) : null}
        </div>
      ) : null}
      <ResourceTable key={config.key} config={config} createSignal={createSignal} />
      {bulkOpen ? (
        <FormModal
          title="Bulk create countries"
          description="Create countries and their regions in one request."
          icon="solar:database-bold-duotone"
          isOpen
          initial={bulkValue}
          onClose={() => setBulkOpen(false)}
          onSubmit={async (value) => {
            setBulkValue(normalizeBulkPayload(value));
            await submitBulk(value);
          }}
        >
          {(value, setValue) => (
            <BulkCountryFields value={value} setValue={setValue} />
          )}
        </FormModal>
      ) : null}
    </CrmPage>
  );
}

function normalizeBulkPayload(value: CountryBulkPayload): CountryBulkPayload {
  return {
    countries: value.countries
      .map((country) => ({
        name: country.name.trim(),
        regions: country.regions.map((region) => region.trim()).filter(Boolean),
      }))
      .filter((country) => country.name),
  };
}

function BulkCountryFields({
  value,
  setValue,
}: {
  value: CountryBulkPayload;
  setValue: (next: Partial<CountryBulkPayload>) => void;
}) {
  const [mode, setMode] = useState<"fields" | "json">("fields");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (mode === "fields") {
      setJsonText(JSON.stringify(value, null, 2));
      setJsonError("");
    }
  }, [mode, value]);

  function updateCountry(index: number, name: string) {
    setValue({
      countries: value.countries.map((country, countryIndex) => (countryIndex === index ? { ...country, name } : country)),
    });
  }

  function addCountry() {
    setValue({ countries: [...value.countries, { name: "", regions: [""] }] });
  }

  function removeCountry(index: number) {
    const countries = value.countries.filter((_, countryIndex) => countryIndex !== index);
    setValue({ countries: countries.length ? countries : [{ name: "", regions: [""] }] });
  }

  function updateRegion(countryIndex: number, regionIndex: number, name: string) {
    setValue({
      countries: value.countries.map((country, currentCountryIndex) =>
        currentCountryIndex === countryIndex
          ? {
              ...country,
              regions: country.regions.map((region, currentRegionIndex) => (currentRegionIndex === regionIndex ? name : region)),
            }
          : country,
      ),
    });
  }

  function addRegion(countryIndex: number) {
    setValue({
      countries: value.countries.map((country, currentCountryIndex) =>
        currentCountryIndex === countryIndex ? { ...country, regions: [...country.regions, ""] } : country,
      ),
    });
  }

  function removeRegion(countryIndex: number, regionIndex: number) {
    setValue({
      countries: value.countries.map((country, currentCountryIndex) => {
        if (currentCountryIndex !== countryIndex) return country;
        const regions = country.regions.filter((_, currentRegionIndex) => currentRegionIndex !== regionIndex);
        return { ...country, regions: regions.length ? regions : [""] };
      }),
    });
  }

  function updateJson(text: string) {
    setJsonText(text);

    try {
      const parsed = JSON.parse(text) as CountryBulkPayload;
      if (!Array.isArray(parsed.countries)) {
        throw new Error("countries must be an array");
      }
      setJsonError("");
      setValue(parsed);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={mode === "fields" ? "primary" : "ghost"} onClick={() => setMode("fields")}>
          <Icon icon="solar:pen-linear" className="size-4" />
          Input Fields
        </Button>
        <Button variant={mode === "json" ? "primary" : "ghost"} onClick={() => setMode("json")}>
          <Icon icon="solar:database-bold-duotone" className="size-4" />
          JSON
        </Button>
      </div>

      {mode === "fields" ? (
        <div className="grid gap-4">
          {value.countries.map((country, countryIndex) => (
            <div key={countryIndex} className="grid gap-3 rounded-md border border-line bg-soft p-3">
              <div className="flex items-end gap-2">
                <Field label={`Country ${countryIndex + 1}`} className="flex-1">
                  <Input value={country.name} onChange={(event) => updateCountry(countryIndex, event.target.value)} placeholder="Bangladesh" required />
                </Field>
                <Button variant="danger" onClick={() => removeCountry(countryIndex)}>
                  <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-2">
                <p className="text-xs font-bold text-muted uppercase">Regions</p>
                {country.regions.map((region, regionIndex) => (
                  <div key={regionIndex} className="flex gap-2">
                    <Input
                      value={region}
                      onChange={(event) => updateRegion(countryIndex, regionIndex, event.target.value)}
                      placeholder="Dhaka"
                      required
                    />
                    <IconButton label="Remove region" variant="danger" onClick={() => removeRegion(countryIndex, regionIndex)}>
                      <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
                    </IconButton>
                  </div>
                ))}
                <Button variant="ghost" onClick={() => addRegion(countryIndex)}>
                  <Icon icon="solar:add-circle-linear" className="size-4" />
                  Add Region
                </Button>
              </div>
            </div>
          ))}

          <Button variant="soft" onClick={addCountry}>
            <Icon icon="solar:add-circle-linear" className="size-4" />
            Add Country
          </Button>
        </div>
      ) : (
        <Field label="JSON payload" full>
          <Textarea value={jsonText} onChange={(event) => updateJson(event.target.value)} className="min-h-56 font-mono text-xs" />
          {jsonError ? <span className="text-xs font-semibold text-danger">{jsonError}</span> : null}
        </Field>
      )}
    </div>
  );
}

function ResourceTable<Row extends { id: string | number }, Payload extends Record<string, unknown>>({
  config,
  createSignal,
}: {
  config: ResourceConfig<Row, Payload>;
  createSignal: number;
}) {
  const [editing, setEditing] = useState<Row | null>(null);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) =>
      config.service?.list({ page: 1, page_size: 100, ordering: "-created_at" }, { cache: fresh ? "no-store" : "default", signal }) ??
      Promise.resolve({ data: [], count: 0 }),
    [config.key],
    { key: `resource:${config.key}` },
  );

  useEffect(() => {
    if (createSignal > 0 && !config.readonly) {
      setEditing({ id: "" } as Row);
    }
  }, [config.readonly, createSignal]);

  async function removeRow() {
    if (!deleting || !config.service) return;
    setIsDeleting(true);
    await config.service.delete(String(deleting.id)).finally(() => setIsDeleting(false));
    setDeleting(null);
    void reload();
  }

  return (
    <>
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading || isRefreshing}
        columns={config.columns}
        getRowId={(row) => String(row.id)}
        renderActions={(row) => (
          <div className="flex items-center gap-1.5">
            <IconButton label={`View ${config.label}`} onClick={() => setViewing(row)}>
              <Icon icon="solar:eye-linear" className="size-4" />
            </IconButton>
            {config.readonly ? null : <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />}
          </div>
        )}
        searchPlaceholder={`Search ${config.label.toLowerCase()}`}
        searchText={config.searchText}
        noun={config.label.toLowerCase()}
        minWidth={1120}
        emptyText={error || `No ${config.label.toLowerCase()} found.`}
      />
      {!config.readonly && editing ? (
        <FormModal
          key={editing.id || "new"}
          title={editing.id ? `Edit ${config.label}` : `Create ${config.label}`}
          description={config.description}
          icon={config.icon}
          isOpen
          initial={editing.id ? config.toInitial(editing) : config.empty}
          onClose={() => setEditing(null)}
          onSubmit={async (value) => {
            const payload = config.toPayload(value, editing);
            if (editing.id) await config.service?.patch(String(editing.id), payload);
            else await config.service?.create(payload);
            void reload();
          }}
        >
          {(value, setValue) => <DynamicFields fields={config.fields} value={value} setValue={setValue} />}
        </FormModal>
      ) : null}
      {viewing ? (
        <DetailModal title={config.titleOf(viewing)} description={config.description} icon={config.icon} isOpen onClose={() => setViewing(null)}>
          <DetailGrid>
            {config.details(viewing).map((item) => (
              <DetailItem key={item.label} label={item.label} value={item.value} full={item.full} />
            ))}
          </DetailGrid>
        </DetailModal>
      ) : null}
      <DeleteDialog
        label={deleting ? config.titleOf(deleting) : config.label.toLowerCase()}
        isOpen={!!deleting}
        isDeleting={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void removeRow()}
      />
    </>
  );
}

function DynamicFields<T extends Record<string, unknown>>({
  fields,
  value,
  setValue,
}: {
  fields: FormField[];
  value: T;
  setValue: (next: Partial<T>) => void;
}) {
  return (
    <FormGrid>
      {fields.map((field) => {
        const current = value[field.name];
        const patch = (next: unknown) => {
          const cleared = Object.fromEntries((field.clears ?? []).map((name) => [name, ""]));
          setValue({ ...cleared, [field.name]: next } as Partial<T>);
        };
        const parentValue = field.filterBy ? String(value[field.filterBy] ?? "") : "";
        const options = field.filterBy && parentValue ? (field.options ?? []).filter((option) => option.parent === parentValue) : (field.options ?? []);

        if (field.kind === "textarea") {
          return (
            <Field key={field.name} label={field.label} full={field.full}>
              <Textarea value={String(current ?? "")} onChange={(event) => patch(event.target.value)} required={field.required} />
            </Field>
          );
        }

        if (field.kind === "select") {
          return (
            <Field key={field.name} label={field.label} full={field.full}>
              <Select value={String(current ?? "")} onChange={(event) => patch(event.target.value)} required={field.required}>
                <option value="">Select {field.label.toLowerCase()}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          );
        }

        if (field.kind === "multi") {
          const selected = Array.isArray(current) ? current.map(String) : [];
          return (
            <Field key={field.name} label={field.label} full={field.full}>
              <Select
                multiple
                value={selected}
                onChange={(event) => patch(Array.from(event.target.selectedOptions).map((option) => option.value))}
                className="min-h-32"
                required={field.required}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          );
        }

        if (field.kind === "checkbox") {
          return (
            <Field key={field.name} label={field.label} full={field.full}>
              <Checkbox label={field.label} checked={Boolean(current)} onChange={(event) => patch(event.target.checked)} />
            </Field>
          );
        }

        if (field.kind === "json") {
          return (
            <Field key={field.name} label={field.label} full>
              <Textarea value={String(current ?? "")} onChange={(event) => patch(event.target.value)} className="font-mono text-xs" />
            </Field>
          );
        }

        return (
          <Field key={field.name} label={field.label} full={field.full}>
            <Input
              type={field.kind ?? "text"}
              value={String(current ?? "")}
              onChange={(event) => patch(field.kind === "number" ? Number(event.target.value) : event.target.value)}
              required={field.required}
            />
          </Field>
        );
      })}
    </FormGrid>
  );
}

function usersConfig(): ResourceConfig<LoginUser, Record<string, never>> {
  return {
    key: "users",
    label: "Users",
    icon: "solar:user-id-bold-duotone",
    description: "Read-only API user directory.",
    service: userService as unknown as ResourceConfig<LoginUser, Record<string, never>>["service"],
    readonly: true,
    fields: [],
    empty: {},
    toPayload: (value) => value,
    toInitial: () => ({}),
    columns: [
      { key: "username", label: "Username", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", render: (row) => <Badge>{formatStatus(row.role)}</Badge> },
      { key: "is_active", label: "Active", render: (row) => <Badge tone={booleanTone(row.is_active)}>{row.is_active ? "Active" : "Inactive"}</Badge> },
    ],
    searchText: (row) => `${row.username} ${row.email} ${row.role}`,
    titleOf: (row) => row.email,
    details: (row) => [
      { label: "ID", value: row.id },
      { label: "Username", value: row.username },
      { label: "Email", value: row.email },
      { label: "Role", value: formatStatus(row.role) },
      { label: "Active", value: row.is_active ? "Yes" : "No" },
    ],
  };
}

function membersConfig(): ResourceConfig<Member, MemberPayload> {
  return {
    key: "members",
    label: "Members",
    icon: "solar:users-group-rounded-bold-duotone",
    description: "Create and manage CRM member profiles with linked users.",
    service: memberService,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", kind: "email", required: true },
      { name: "role", label: "Role", kind: "select", options: roles.map((role) => ({ value: role, label: formatStatus(role) })), required: true },
      { name: "contact_number", label: "Contact number", required: true },
      { name: "whatsapp_number", label: "WhatsApp number" },
      { name: "address", label: "Address", full: true, required: true },
    ],
    empty: { user: { email: "", role: "calling_agent" }, email: "", name: "", contact_number: "", whatsapp_number: "", address: "" },
    toPayload: (value) => ({
      user: value.email ? { email: value.email, role: (value as MemberPayload & { role?: UserType }).role ?? "calling_agent" } : value.user,
      name: value.name.trim(),
      contact_number: value.contact_number.trim(),
      whatsapp_number: value.whatsapp_number.trim(),
      address: value.address.trim(),
      email: value.email,
    }),
    toInitial: (row) => ({
      user: { email: row.user_detail?.email ?? row.user?.email ?? "", role: (row.user_detail?.role ?? row.user?.role ?? "calling_agent") as UserType },
      email: row.user_detail?.email ?? row.user?.email ?? "",
      name: row.name,
      contact_number: row.contact_number,
      whatsapp_number: row.whatsapp_number,
      address: row.address,
      role: (row.user_detail?.role ?? row.user?.role ?? "calling_agent") as UserType,
    } as MemberPayload),
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", render: (row) => row.user_detail?.email ?? row.user?.email },
      { key: "role", label: "Role", render: (row) => <Badge>{formatStatus(row.user_detail?.role ?? row.user?.role)}</Badge> },
      { key: "contact_number", label: "Contact" },
      { key: "whatsapp_number", label: "WhatsApp" },
      { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
    ],
    searchText: (row) => `${row.name} ${row.user_detail?.email ?? row.user?.email ?? ""} ${row.contact_number} ${row.whatsapp_number}`,
    titleOf: memberName,
    details: (row) => [
      { label: "Email", value: row.user_detail?.email ?? row.user?.email },
      { label: "Role", value: formatStatus(row.user_detail?.role ?? row.user?.role) },
      { label: "Contact", value: row.contact_number },
      { label: "WhatsApp", value: row.whatsapp_number },
      { label: "Address", value: row.address, full: true },
      { label: "Created", value: formatDateTime(row.created_at) },
      { label: "Updated", value: formatDateTime(row.updated_at) },
    ],
  };
}

function teamsConfig(memberOptions: Option[]): ResourceConfig<Team, TeamPayload> {
  return {
    key: "teams",
    label: "Teams",
    icon: "solar:users-group-two-rounded-bold-duotone",
    description: "Create teams, leaders, and member membership.",
    service: teamService,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "leader", label: "Leader", kind: "select", options: memberOptions, required: true },
      { name: "members", label: "Members", kind: "multi", options: memberOptions, full: true },
    ],
    empty: { name: "", leader: "", members: [] },
    toPayload: (value) => value,
    toInitial: (row) => ({ name: row.name, leader: row.leader, members: row.members ?? [] }),
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "leader", label: "Leader", render: (row) => row.leader_detail?.name ?? optionLabel(row.leader, memberOptions) },
      { key: "members", label: "Members", render: (row) => row.member_details?.length ?? row.members.length },
      { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
    ],
    searchText: (row) => `${row.name} ${row.leader_detail?.name ?? ""} ${(row.member_details ?? []).map(memberName).join(" ")}`,
    titleOf: (row) => row.name,
    details: (row) => [
      { label: "Leader", value: row.leader_detail?.name ?? optionLabel(row.leader, memberOptions) },
      { label: "Members", value: (row.member_details ?? []).map(memberName).join(", ") || row.members.join(", "), full: true },
      { label: "Created", value: formatDateTime(row.created_at) },
      { label: "Updated", value: formatDateTime(row.updated_at) },
    ],
  };
}

function countriesConfig(): ResourceConfig<Country, CountryPayload> {
  return {
    key: "countries",
    label: "Countries",
    icon: "solar:global-bold-duotone",
    description: "Manage lead and campaign countries.",
    service: countryService,
    fields: [{ name: "name", label: "Name", required: true }],
    empty: { name: "" },
    toPayload: (value) => ({ name: value.name.trim() }),
    toInitial: (row) => ({ name: row.name }),
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "regions", label: "Regions", render: (row) => row.regions?.length ?? 0 },
    ],
    searchText: (row) => `${row.name} ${(row.regions ?? []).map((region) => region.name).join(" ")}`,
    titleOf: (row) => row.name,
    details: (row) => [
      { label: "Name", value: row.name },
      { label: "Regions", value: (row.regions ?? []).map((region) => region.name).join(", "), full: true },
    ],
  };
}

function regionsConfig(countryOptions: Option[]): ResourceConfig<Region, RegionPayload> {
  return {
    key: "regions",
    label: "Regions",
    icon: "solar:map-point-bold-duotone",
    description: "Manage regions under each country.",
    service: regionService,
    fields: [
      { name: "country", label: "Country", kind: "select", options: countryOptions, required: true },
      { name: "name", label: "Name", required: true },
    ],
    empty: { country: "", name: "" },
    toPayload: (value) => ({ country: value.country, name: value.name.trim() }),
    toInitial: (row) => ({ country: row.country, name: row.name }),
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "country", label: "Country", render: (row) => row.country_detail?.name ?? optionLabel(row.country, countryOptions) },
    ],
    searchText: (row) => `${row.name} ${row.country_detail?.name ?? ""}`,
    titleOf: (row) => row.name,
    details: (row) => [
      { label: "Name", value: row.name },
      { label: "Country", value: row.country_detail?.name ?? optionLabel(row.country, countryOptions) },
    ],
  };
}

function servicesConfig(): ResourceConfig<Service, ServicePayload> {
  return {
    key: "services",
    label: "Services",
    icon: "solar:case-minimalistic-bold-duotone",
    description: "Manage campaign services.",
    service: serviceService,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "active", label: "Active", kind: "checkbox" },
    ],
    empty: { name: "", active: true },
    toPayload: (value) => ({ name: value.name.trim(), active: value.active }),
    toInitial: (row) => ({ name: row.name, active: row.active }),
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "active", label: "Status", render: (row) => <Badge tone={booleanTone(row.active)}>{row.active ? "Active" : "Inactive"}</Badge> },
    ],
    searchText: (row) => `${row.name} ${row.active ? "active" : "inactive"}`,
    titleOf: (row) => row.name,
    details: (row) => [
      { label: "Name", value: row.name },
      { label: "Active", value: row.active ? "Yes" : "No" },
    ],
  };
}

function campaignsConfig(serviceOptions: Option[], countryOptions: Option[], regionOptions: Option[], teamOptions: Option[]): ResourceConfig<Campaign, CampaignPayload> {
  return {
    key: "campaigns",
    label: "Campaigns",
    icon: "solar:flag-bold-duotone",
    description: "Manage outreach campaigns, targets, dates, team assignment, and geography.",
    service: campaignService,
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "service", label: "Service", kind: "select", options: serviceOptions, required: true },
      { name: "country", label: "Country", kind: "select", options: countryOptions, clears: ["region"], required: true },
      { name: "region", label: "Region", kind: "select", options: regionOptions, filterBy: "country", required: true },
      { name: "industry", label: "Industry", required: true },
      { name: "status", label: "Status", kind: "select", options: campaignStatuses.map((status) => ({ value: status, label: formatStatus(status) })), required: true },
      { name: "assigned_team", label: "Assigned team", kind: "select", options: teamOptions, required: true },
      { name: "start_date", label: "Start date", kind: "date", required: true },
      { name: "end_date", label: "End date", kind: "date", required: true },
      { name: "target_leads", label: "Target leads", kind: "number", required: true },
      { name: "daily_calling_target", label: "Daily calling target", kind: "number", required: true },
      { name: "description", label: "Description", kind: "textarea", full: true },
    ],
    empty: {
      name: "",
      service: "",
      description: "",
      country: "",
      region: "",
      industry: "",
      start_date: "",
      end_date: "",
      status: "draft",
      assigned_team: "",
      target_leads: 0,
      daily_calling_target: 0,
    },
    toPayload: (value) => value,
    toInitial: (row) => ({ ...row }),
    columns: [
      { key: "name", label: "Campaign", sortable: true },
      { key: "service", label: "Service", render: (row) => row.service_detail?.name ?? optionLabel(row.service, serviceOptions) },
      { key: "status", label: "Status", render: (row) => <Badge>{formatStatus(row.status)}</Badge> },
      { key: "country", label: "Country", render: (row) => row.country_name ?? optionLabel(row.country, countryOptions) },
      { key: "region", label: "Region", render: (row) => row.region_name ?? optionLabel(row.region, regionOptions) },
      { key: "assigned_team", label: "Team", render: (row) => row.assigned_team_detail?.name ?? optionLabel(row.assigned_team, teamOptions) },
      { key: "start_date", label: "Start", render: (row) => formatDate(row.start_date), sortable: true },
      { key: "end_date", label: "End", render: (row) => formatDate(row.end_date), sortable: true },
    ],
    searchText: (row) => `${row.name} ${row.industry} ${row.status} ${row.country_name ?? ""} ${row.region_name ?? ""} ${row.service_detail?.name ?? ""}`,
    titleOf: (row) => row.name,
    details: (row) => [
      { label: "Service", value: row.service_detail?.name ?? optionLabel(row.service, serviceOptions) },
      { label: "Status", value: formatStatus(row.status) },
      { label: "Country", value: row.country_name ?? optionLabel(row.country, countryOptions) },
      { label: "Region", value: row.region_name ?? optionLabel(row.region, regionOptions) },
      { label: "Industry", value: row.industry },
      { label: "Assigned team", value: row.assigned_team_detail?.name ?? optionLabel(row.assigned_team, teamOptions) },
      { label: "Start date", value: formatDate(row.start_date) },
      { label: "End date", value: formatDate(row.end_date) },
      { label: "Target leads", value: row.target_leads },
      { label: "Daily calling target", value: row.daily_calling_target },
      { label: "Description", value: row.description, full: true },
    ],
  };
}

function auditConfig(): ResourceConfig<AuditLog, AuditLogPayload> {
  return {
    key: "audit",
    label: "Audit Logs",
    icon: "solar:shield-check-bold-duotone",
    description: "Create and inspect audit log records.",
    service: auditLogService,
    fields: [
      { name: "user", label: "User ID", kind: "number", required: true },
      { name: "action", label: "Action", required: true },
      { name: "object_type", label: "Object type", required: true },
      { name: "object_id", label: "Object ID", required: true },
      { name: "previous_value", label: "Previous value JSON", kind: "json" },
      { name: "new_value", label: "New value JSON", kind: "json" },
    ],
    empty: { user: 0, action: "manual_note", object_type: "Lead", object_id: "", previous_value: null, new_value: { note: "" } },
    toPayload: (value) => ({
      ...value,
      previous_value: typeof value.previous_value === "string" ? parseJson(value.previous_value) : value.previous_value,
      new_value: typeof value.new_value === "string" ? parseJson(value.new_value) : value.new_value,
    }),
    toInitial: (row) => ({
      user: row.user,
      action: row.action,
      object_type: row.object_type,
      object_id: row.object_id,
      previous_value: toJson(row.previous_value) as unknown as Record<string, unknown>,
      new_value: toJson(row.new_value) as unknown as Record<string, unknown>,
    }),
    columns: [
      { key: "user", label: "User", render: (row) => row.user_detail?.email ?? row.user },
      { key: "action", label: "Action", render: (row) => formatStatus(row.action), sortable: true },
      { key: "object_type", label: "Object", sortable: true },
      { key: "object_id", label: "Object ID", className: "font-mono text-xs" },
      { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
    ],
    searchText: (row) => `${row.user_detail?.email ?? ""} ${row.action} ${row.object_type} ${row.object_id} ${toJson(row.new_value)}`,
    titleOf: (row) => `${formatStatus(row.action)} ${row.object_type}`,
    details: (row) => [
      { label: "User", value: row.user_detail?.email ?? row.user },
      { label: "Action", value: row.action },
      { label: "Object type", value: row.object_type },
      { label: "Object ID", value: row.object_id },
      { label: "Created", value: formatDateTime(row.created_at) },
      { label: "Previous value", value: <pre className="whitespace-pre-wrap text-xs">{toJson(row.previous_value)}</pre>, full: true },
      { label: "New value", value: <pre className="whitespace-pre-wrap text-xs">{toJson(row.new_value)}</pre>, full: true },
    ],
  };
}
