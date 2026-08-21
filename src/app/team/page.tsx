"use client";

import * as React from "react";
import {
  Plus,
  MoreHorizontal,
  Mail,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  Crown,
  UserCog,
  Eye,
  Printer,
  KeyRound,
} from "lucide-react";

import { Header } from "@/components/Header";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role =
  | "Super Admin"
  | "School Admin"
  | "Verifier"
  | "Data Entry"
  | "Print Operator";

type Status = "active" | "pending";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastActive: string;
}

const ROLES: Role[] = [
  "Super Admin",
  "School Admin",
  "Verifier",
  "Data Entry",
  "Print Operator",
];

const ROLE_ICON: Record<Role, React.ReactNode> = {
  "Super Admin": <Crown className="size-3.5" />,
  "School Admin": <UserCog className="size-3.5" />,
  Verifier: <ShieldCheck className="size-3.5" />,
  "Data Entry": <Eye className="size-3.5" />,
  "Print Operator": <Printer className="size-3.5" />,
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Aarav Sharma",
    email: "aarav@cardit.io",
    role: "Super Admin",
    status: "active",
    lastActive: "2 min ago",
  },
  {
    id: "m2",
    name: "Priya Nair",
    email: "priya@cardit.io",
    role: "School Admin",
    status: "active",
    lastActive: "1 hr ago",
  },
  {
    id: "m3",
    name: "Rohan Verma",
    email: "rohan@cardit.io",
    role: "Verifier",
    status: "pending",
    lastActive: "—",
  },
  {
    id: "m4",
    name: "Sneha Iyer",
    email: "sneha@cardit.io",
    role: "Data Entry",
    status: "active",
    lastActive: "Yesterday",
  },
  {
    id: "m5",
    name: "Karthik Reddy",
    email: "karthik@cardit.io",
    role: "Print Operator",
    status: "active",
    lastActive: "3 days ago",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamPage() {
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    role: "Verifier" as Role,
    sendEmail: true,
  });

  const activeCount = members.filter((m) => m.status === "active").length;

  function openAdd() {
    setEditingId(null);
    setForm({ name: "", email: "", role: "Verifier", sendEmail: true });
    setOpen(true);
  }

  function openEdit(m: Member) {
    setEditingId(m.id);
    setForm({
      name: m.name,
      email: m.email,
      role: m.role,
      sendEmail: m.status === "pending",
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editingId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                name: form.name.trim(),
                email: form.email.trim(),
                role: form.role,
                status: form.sendEmail ? "pending" : "active",
              }
            : m
        )
      );
    } else {
      setMembers((prev) => [
        {
          id: `m${Date.now()}`,
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          status: form.sendEmail ? "pending" : "active",
          lastActive: "—",
        },
        ...prev,
      ]);
    }
    setOpen(false);
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <h1 className="typo-page-title">Team Members</h1>
            <p className="typo-body text-muted-foreground">
              Manage who can access this school&apos;s card operations.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button onClick={openAdd} className="shadow-sm hover:shadow transition-shadow shrink-0">
                  <Plus className="size-4" />
                  Invite member
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit member" : "Invite a team member"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update this member's role and access."
                    : "They'll get access to the verification workspace."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="name@school.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v as Role }))
                    }
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          <span className="flex items-center gap-2">
                            {ROLE_ICON[r]}
                            {r}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="note">Personal note (optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a short welcome message…"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">
                        Send invite email
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Member starts as pending until they accept.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={form.sendEmail}
                    onCheckedChange={(c) =>
                      setForm((f) => ({ ...f, sendEmail: c }))
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingId ? "Save changes" : "Send invite"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="typo-meta-label">Total members</CardDescription>
              <CardTitle className="text-3xl font-extrabold">{members.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="typo-meta-label">Active</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-primary">
                {activeCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="typo-meta-label">Pending invites</CardDescription>
              <CardTitle className="text-3xl font-extrabold">
                {members.length - activeCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Members table */}
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-4">
            <MembersTable
              members={members}
              onEdit={openEdit}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <MembersTable
              members={members.filter((m) => m.status === "active")}
              onEdit={openEdit}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <MembersTable
              members={members.filter((m) => m.status === "pending")}
              onEdit={openEdit}
              onRemove={handleRemove}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MembersTable({
  members,
  onEdit,
  onRemove,
}: {
  members: Member[];
  onEdit: (m: Member) => void;
  onRemove: (id: string) => void;
}) {
  if (members.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-14 rounded-full bg-muted/50 flex items-center justify-center mb-5">
            <Users className="size-7 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <p className="typo-card-title">No members here yet</p>
          <p className="typo-body text-muted-foreground mt-2">
            Invite a team member to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="typo-meta-label">Member</TableHead>
              <TableHead className="typo-meta-label">Role</TableHead>
              <TableHead className="typo-meta-label">Status</TableHead>
              <TableHead className="typo-meta-label">Last active</TableHead>
              <TableHead className="typo-meta-label w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="text-sm font-semibold">{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold typo-body truncate">{m.name}</p>
                      <p className="typo-caption truncate">
                        {m.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 typo-body-strong">
                    {ROLE_ICON[m.role]}
                    {m.role}
                  </span>
                </TableCell>
                <TableCell>
                  {m.status === "active" ? (
                    <Badge variant="default" className="shadow-sm">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="shadow-sm">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="typo-body text-muted-foreground">
                  {m.lastActive}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(m)}>
                        <Pencil className="size-4" />
                        Edit member
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <KeyRound className="size-4" />
                        Reset password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onRemove(m.id)}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}