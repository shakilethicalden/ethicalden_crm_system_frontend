import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuth } from "@/libs/auth";
import { cn } from "@/libs/utils/cn";
import { getNavLabel, getVisibleNavSections, isNavPathActive, type NavNode } from "@/routes/navigation";
import { prefetchRoute } from "@/routes/prefetch";
import type { Role } from "@/libs/auth/roles";
import { Icon } from "@/components/ui";

type AppSidebarProps = {
  /** Mobile drawer open state. */
  open: boolean;
  /** Desktop icon-only mode. */
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export function AppSidebar({ open, collapsed, onClose, onToggleCollapse }: AppSidebarProps) {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const sections = getVisibleNavSections(role);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-hidden border-r border-white/10 bg-portal text-white shadow-2xl shadow-black/25 transition-[width,transform] duration-300 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[70px]" : "lg:w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex h-16 flex-none items-center border-b border-white/10 px-4",
            collapsed ? "justify-between lg:justify-center lg:px-2" : "justify-between",
          )}
        >
          <Link to="/dashboard" className="flex min-w-0 items-center" aria-label="Ethical Den" onClick={onClose}>
            <SidebarLogo collapsed={collapsed} role={role} />
          </Link>

          {!collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden size-9 flex-none items-center justify-center rounded-md text-white/55 hover:bg-white/10 hover:text-brand lg:inline-flex"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Icon icon="solar:hamburger-menu-linear" className="size-5" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/60 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <Icon icon="solar:close-circle-linear" className="size-4" />
          </button>
        </div>

        {collapsed ? (
          <div className="hidden justify-center py-2 lg:flex">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex size-9 items-center justify-center rounded-md text-white/55 hover:bg-white/10 hover:text-brand"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <Icon icon="solar:hamburger-menu-linear" className="size-5" />
            </button>
          </div>
        ) : null}

        <nav
          aria-label="Main navigation"
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto pb-8 [scrollbar-width:thin]",
            collapsed ? "mt-4 px-3 lg:mt-0 lg:px-2" : "mt-4 px-3",
          )}
        >
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-5">
              {collapsed && sectionIndex > 0 ? (
                <div className="mx-auto mb-3 hidden h-px w-8 bg-line lg:block" aria-hidden="true" />
              ) : null}
              <p
                className={cn(
                  "mb-2 px-3 text-[11px] font-bold tracking-[0.08em] text-white/45 uppercase",
                  collapsed && "lg:hidden",
                )}
              >
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.label}
                    node={item}
                    level={0}
                    path={`${section.title}/${item.label}`}
                    role={role}
                    pathname={pathname}
                    collapsed={collapsed}
                    openMenus={openMenus}
                    toggle={toggle}
                    onNavigate={onClose}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

const PANEL_LABELS: Record<Role, string> = {
  super_admin: "Super Admin CRM",
  team_leader: "Team Leader CRM",
  lead_generator: "Lead Generator CRM",
  calling_agent: "Calling Agent CRM",
  unknown: "CRM Portal",
};

function SidebarLogo({ collapsed, role }: { collapsed: boolean; role: Role }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 flex-none place-items-center rounded-lg border border-brand/35 bg-white p-1 shadow-sm">
        <img src="/edn_icon.png" alt="" className="size-full object-contain" />
      </span>
      <span className={cn("leading-tight transition-opacity duration-200", collapsed && "pointer-events-none lg:hidden")}>
        <span className="block text-base font-extrabold tracking-tight text-white">
          Ethical <span className="text-brand">Den</span>
        </span>
        <span className="block text-[10px] font-semibold tracking-wide text-white/50 uppercase">{PANEL_LABELS[role]}</span>
      </span>
    </div>
  );
}

type NavItemProps = {
  node: NavNode;
  level: number;
  /** Unique key for the open/closed state of this node. */
  path: string;
  role: Role;
  pathname: string;
  collapsed: boolean;
  openMenus: Record<string, boolean>;
  toggle: (key: string) => void;
  onNavigate: () => void;
};

function NavItem({ node, level, path, role, pathname, collapsed, openMenus, toggle, onNavigate }: NavItemProps) {
  const label = getNavLabel(node, role);
  const hasChildren = !!node.children?.length;
  const childActive = hasChildren && node.children!.some((child) => isNavPathActive(pathname, child.href));
  const expanded = openMenus[path] ?? childActive;
  const active = isNavPathActive(pathname, node.href) || childActive;

  const children =
    hasChildren && expanded && !collapsed ? (
      <ul className={cn("mt-1 space-y-0.5", level === 0 ? "pl-11" : "pl-5")}>
        {node.children!.map((child) => (
          <NavItem
            key={child.label}
            node={child}
            level={level + 1}
            path={`${path}/${child.label}`}
            role={role}
            pathname={pathname}
            collapsed={collapsed}
            openMenus={openMenus}
            toggle={toggle}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    ) : null;

  // Nested levels: compact text rows.
  if (level > 0) {
    const nestedClass = cn(
      "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
      active ? "font-bold text-brand" : "text-white/55 hover:text-white",
    );
    const nestedIcon = node.icon ? (
      <Icon icon={node.icon} className={cn("size-3.5 flex-none", active ? "text-brand" : "text-white/45")} />
    ) : null;

    return (
      <li>
        {hasChildren ? (
          <button type="button" onClick={() => toggle(path)} className={nestedClass} aria-expanded={expanded}>
            {nestedIcon}
            <span className="flex-1 truncate text-left">{label}</span>
            <Icon icon="solar:alt-arrow-right-linear" className={cn("size-3 text-white/35 transition-transform", expanded && "rotate-90")} />
          </button>
        ) : (
          <NavLink
            to={node.href ?? "#"}
            className={nestedClass}
            onClick={onNavigate}
            onMouseEnter={() => node.href && prefetchRoute(node.href)}
            onFocus={() => node.href && prefetchRoute(node.href)}
          >
            {nestedIcon}
            <span className="flex-1 truncate">{label}</span>
          </NavLink>
        )}
        {children}
      </li>
    );
  }

  // Top level: icon box + label + chevron.
  const rowClass = cn(
    "group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
    collapsed && "lg:justify-center lg:gap-0 lg:px-0 lg:py-1.5",
    active && !collapsed && "bg-white/12 font-bold text-white ring-1 ring-brand/25",
    active && collapsed && "font-bold text-white",
    !active && "font-semibold text-white/62 hover:bg-white/8 hover:text-white",
  );

  const iconBox = (
    <span
      className={cn(
        "flex size-8 flex-none items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-gradient-to-br from-brand-dark to-brand text-portal shadow-sm shadow-brand/30"
          : collapsed
            ? "bg-transparent text-brand"
            : "bg-white/8 text-brand group-hover:bg-white/12",
      )}
    >
      {node.icon ? <Icon icon={node.icon} className="size-[18px]" /> : null}
    </span>
  );

  const labelEl = <span className={cn("flex-1 text-left whitespace-nowrap", collapsed && "lg:hidden")}>{label}</span>;

  if (!hasChildren) {
    return (
      <li>
        <NavLink
          to={node.href ?? "#"}
          className={rowClass}
          title={collapsed ? label : undefined}
          aria-label={label}
          onClick={onNavigate}
          onMouseEnter={() => node.href && prefetchRoute(node.href)}
          onFocus={() => node.href && prefetchRoute(node.href)}
        >
          {iconBox}
          {labelEl}
          <Icon icon="solar:alt-arrow-right-linear" className={cn("size-3.5 text-white/35", collapsed && "lg:hidden")} />
        </NavLink>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => !collapsed && toggle(path)}
        className={rowClass}
        title={collapsed ? label : undefined}
        aria-expanded={expanded}
      >
        {iconBox}
        {labelEl}
        <Icon icon="solar:alt-arrow-right-linear"
          className={cn("size-3.5 text-white/35 transition-transform", expanded && "rotate-90", collapsed && "lg:hidden")}
        />
      </button>
      {children}
    </li>
  );
}
