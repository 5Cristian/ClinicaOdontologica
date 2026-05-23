import { Request, Response } from "express";
import { RolNombre } from "@prisma/client";

import * as userService from "../services/user.service";
import { successResponse } from "../utils/api-response";

export async function getUsers(_req: Request, res: Response) {
  const data = await userService.listUsers();
  return res.json(successResponse("Usuarios obtenidos correctamente.", data));
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = await userService.getUserById(id);
  return res.json(successResponse("Usuario obtenido correctamente.", data));
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password, role, activo } = req.body;
  const data = await userService.createUser({
    name,
    email,
    password,
    role: role as RolNombre,
    activo
  }, req.user?.id);

  return res.status(201).json(successResponse("Usuario creado correctamente.", data));
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { name, email, role, activo, password } = req.body;
  const data = await userService.updateUser(
    id,
    {
      name,
      email,
      role: role as RolNombre,
      activo,
      password
    },
    req.user!.id
  );

  return res.json(successResponse("Usuario actualizado correctamente.", data));
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await userService.deleteUser(id, req.user!.id);
  return res.json(successResponse("Usuario eliminado correctamente."));
}
