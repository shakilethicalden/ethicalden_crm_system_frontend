import { type IconName } from "@/components/ui";
import { hasRole, STAFF, type Role } from "@/libs/auth/roles";

export type NavNode = {
  label: string;
  /** Leaf items link somewhere; parents with `children` only expand. */
  href?: string;
  icon?: IconName;
  /** Roles that see this item; omit for everyone. Must match the route guards in routes.tsx. */
  roles?: readonly Role[];
  children?: NavNode[];
};

export type NavSection = {
  title: string;
  items: NavNode[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "solar:widget-2-bold-duotone" }],
  },
  {
    title: "CRM",
    items: [
      { label: "Employees", href: "/employees", icon: "solar:users-group-rounded-bold-duotone", roles: STAFF },
      { label: "Lead Management", href: "/leads", icon: "solar:case-round-minimalistic-bold-duotone", roles: STAFF },
      { label: "Follow Ups", href: "/follow-ups", icon: "solar:calendar-mark-bold-duotone", roles: STAFF },
    ],
  },
];

/** Sections filtered to what `role` may see; parents without visible children and empty sections are dropped. */
export function getVisibleNavSections(role: Role): NavSection[] {
  const filterNodes = (nodes: NavNode[]): NavNode[] =>
    nodes.flatMap((node) => {
      if (node.roles && !hasRole(role, node.roles)) {
        return [];
      }

      if (!node.children) {
        return [node];
      }

      const children = filterNodes(node.children);
      return children.length ? [{ ...node, children }] : [];
    });

  return NAV_SECTIONS.map((section) => ({ ...section, items: filterNodes(section.items) })).filter(
    (section) => section.items.length > 0,
  );
}

/** Every visible leaf link, flattened (used by the header's page search). */
export function getVisibleNavLinks(role: Role): Array<NavNode & { href: string; section: string }> {
  const collect = (nodes: NavNode[], section: string): Array<NavNode & { href: string; section: string }> =>
    nodes.flatMap((node) =>
      node.children ? collect(node.children, section) : node.href ? [{ ...node, href: node.href, section }] : [],
    );

  return getVisibleNavSections(role).flatMap((section) => collect(section.items, section.title));
}

export function getNavLabel(item: NavNode, _role: Role) {
  return item.label;
}

export function isNavPathActive(pathname: string, href?: string) {
  return !!href && (pathname === href || pathname.startsWith(`${href}/`));
}

/** Title for the header, derived from the nav item that owns the current path. */
export function getPageTitle(pathname: string, role: Role) {
  const match = getVisibleNavLinks(role).find((item) => isNavPathActive(pathname, item.href));
  return match ? getNavLabel(match, role) : "Ethical Den CRM";
}
