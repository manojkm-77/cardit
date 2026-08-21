'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Menu, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCarditStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { ROLE_LABELS, USER_ROLES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

const NAV_ITEMS = [
  { href: '/', label: 'Verification' },
  { href: '/editor', label: 'ID Studio' },
  { href: '/designer', label: 'Template' },
  { href: '/print', label: 'Print' },
  { href: '/schema', label: 'Schema' },
  { href: '/jobs', label: 'Queue' },
  { href: '/audit', label: 'Audit' },
  { href: '/team', label: 'Team' }
];

const navLinkClass = (isActive: boolean) =>
  cn(
    'rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-secondary text-secondary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
  );

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const {
    state,
    currentDataset,
    setCurrentSchool,
    setCurrentAcademicYear,
    setCurrentUserRole,
    resetToDefaults
  } = useCarditStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + School / Year selectors + Dataset pill */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Nav trigger for viewports too narrow for the inline menu */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="xl:hidden hover:bg-secondary/80" aria-label="Open navigation" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 gap-0">
              <SheetHeader className="border-b pb-4">
                <SheetTitle className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <CreditCard className="size-4" />
                  </span>
                  <span className="text-base font-bold">CardIT<span className="text-primary">.io</span></span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1.5 p-4">
                {NAV_ITEMS.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link href={item.href} className={navLinkClass(pathname === item.href)} />
                    }
                  >
                    {item.label}
                  </SheetClose>
                ))}
              </nav>
              {/* Scope selectors live here too, since the header hides them on
                  narrow viewports. */}
              <div className="space-y-4 border-t p-4 md:hidden">
                <div className="space-y-2">
                  <p className="typo-meta-label">School</p>
                  <Select value={state.currentSchoolId} onValueChange={(v) => { if (v !== null) setCurrentSchool(v); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="typo-meta-label">Academic Year</p>
                  <Select value={state.currentAcademicYearId} onValueChange={(v) => { if (v !== null) setCurrentAcademicYear(v); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.academicYears
                        .filter((ay) => ay.schoolId === state.currentSchoolId)
                        .map((ay) => (
                          <SelectItem key={ay.id} value={ay.id}>
                            {ay.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="typo-meta-label">Dataset</p>
                  <Badge variant="secondary" className="px-3 py-1 font-medium shadow-sm">{currentDataset?.name}</Badge>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <CreditCard className="size-4.5" />
            </span>
            <span className="text-base font-bold tracking-tight text-foreground">
              CardIT<span className="text-primary">.io</span>
            </span>
          </Link>

          <div className="mx-2 hidden h-6 w-px shrink-0 bg-border md:block" />

          <Select value={state.currentSchoolId} onValueChange={(v) => { if (v !== null) setCurrentSchool(v); }}>
            <SelectTrigger className="hidden w-[200px] shrink-0 md:flex border-border/60 hover:border-border transition-colors">
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              {state.schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={state.currentAcademicYearId} onValueChange={(v) => { if (v !== null) setCurrentAcademicYear(v); }}>
            <SelectTrigger className="hidden w-[160px] shrink-0 lg:flex border-border/60 hover:border-border transition-colors">
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              {state.academicYears
                .filter((ay) => ay.schoolId === state.currentSchoolId)
                .map((ay) => (
                  <SelectItem key={ay.id} value={ay.id}>
                    {ay.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="hidden shrink-0 lg:inline-flex px-3 py-1 font-medium shadow-sm">
            {currentDataset?.name}
          </Badge>
        </div>

        {/* Center: Nav */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  render={<Link href={item.href} className={navLinkClass(pathname === item.href)} />}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: Role selector + Reset */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Select
            value={state.currentUserRole}
            onValueChange={(value) => setCurrentUserRole(value as UserRole)}
          >
            <SelectTrigger className="w-[140px] sm:w-[190px] border-border/60 hover:border-border transition-colors">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset platform data"
            onClick={() => setResetOpen(true)}
            className="hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset platform data?"
        description="Every dataset, student edit, template change and audit entry made in this browser is discarded and the demo data is restored. This cannot be undone."
        confirmLabel="Reset data"
        destructive
        onConfirm={resetToDefaults}
      />
    </header>
  );
};
