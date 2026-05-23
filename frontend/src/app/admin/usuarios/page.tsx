"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { RoleGuard } from "@/components/admin/role-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { adminUserSchema, type AdminUserFormValues } from "@/lib/validations";
import { createUser, deleteUser, fetchUsers, updateUser } from "@/services/admin.service";
import { AdminUser } from "@/types/api";

const emptyUserForm: AdminUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "RECEPCION",
  activo: true
};

export default function AdminUsersPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: emptyUserForm
  });

  // Carga el catálogo de usuarios visibles para administración.
  async function loadData() {
    if (!token) return;
    setUsers(await fetchUsers(token));
  }

  useEffect(() => {
    void loadData();
  }, [token]);

  // Rellena el formulario cuando se entra en modo edición.
  useEffect(() => {
    if (!editingUser) {
      form.reset(emptyUserForm);
      return;
    }

    form.reset({
      name: editingUser.name,
      email: editingUser.email,
      password: "",
      role: editingUser.role,
      activo: editingUser.activo
    });
  }, [editingUser, form]);

  // Crea o actualiza usuarios según el modo actual del formulario.
  async function onSubmit(values: AdminUserFormValues) {
    if (!token) return;

    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      activo: values.activo,
      ...(values.password ? { password: values.password } : {})
    };

    if (editingUser) {
      await updateUser(token, editingUser.id, payload);
      setFeedback("Usuario actualizado correctamente.");
    } else {
      await createUser(token, {
        ...payload,
        password: values.password
      });
      setFeedback("Usuario creado correctamente.");
    }

    setEditingUser(null);
    form.reset(emptyUserForm);
    await loadData();
  }

  return (
    <RoleGuard roles={["ADMINISTRADOR"]}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-slate-950">
                {editingUser ? "Editar usuario" : "Nuevo usuario"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Gestiona accesos administrativos, recepción y odontología desde un solo módulo.
              </p>
            </div>
            {editingUser ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingUser(null);
                  form.reset(emptyUserForm);
                }}
              >
                Cancelar edición
              </Button>
            ) : null}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
            <Field error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Nombre completo" />
            </Field>
            <Field error={form.formState.errors.email?.message}>
              <Input {...form.register("email")} placeholder="Correo electrónico" />
            </Field>
            <Field error={form.formState.errors.password?.message}>
              <Input
                {...form.register("password")}
                type="password"
                placeholder={editingUser ? "Nueva contraseña opcional" : "Contraseña inicial"}
              />
            </Field>
            <Field error={form.formState.errors.role?.message}>
              <Select {...form.register("role")}>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="RECEPCION">RECEPCION</option>
                <option value="ODONTOLOGO">ODONTOLOGO</option>
              </Select>
            </Field>
            <div className="md:col-span-2 flex items-center gap-3">
              <input id="activo" type="checkbox" {...form.register("activo")} />
              <label htmlFor="activo" className="text-sm text-slate-700">
                Usuario activo
              </label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {editingUser ? "Actualizar usuario" : "Guardar usuario"}
              </Button>
            </div>
          </form>

          {feedback ? <p className="mt-4 text-sm text-mint-700">{feedback}</p> : null}
        </Card>

        <Card>
          <h2 className="font-heading text-2xl font-bold text-slate-950">Usuarios registrados</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Auditoría</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-4">{item.name}</td>
                    <td className="px-4 py-4">{item.email}</td>
                    <td className="px-4 py-4">{item.role}</td>
                    <td className="px-4 py-4">{item.activo ? "Activo" : "Inactivo"}</td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <p>Creado: {new Date(item.creadoEn).toLocaleString()}</p>
                      <p>Actualizado: {new Date(item.actualizadoEn).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => setEditingUser(item)}>
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={async () => {
                            if (!token) return;
                            if (item.id === user?.id) return;
                            await deleteUser(token, item.id);
                            if (editingUser?.id === item.id) {
                              setEditingUser(null);
                              form.reset(emptyUserForm);
                            }
                            await loadData();
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}

function Field({
  children,
  error
}: {
  children: ReactNode;
  error?: string;
}) {
  return (
    <div>
      {children}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
