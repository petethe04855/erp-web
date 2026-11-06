import { read, writeRecord, deleteRecord } from "@/lib/api";
import type { AppUser, CreateUserDTO, UpdateUserDTO } from "../types/user";

export const userApi = {
  getUsers: () => read<AppUser[]>("/users"),
  getUserById: (id: string | number) => read<AppUser>(`/users/${id}`),
  createUser: (dto: CreateUserDTO) =>
    writeRecord<AppUser>("/users", dto, "post"),
  updateUser: (id: string | number, dto: UpdateUserDTO) =>
    writeRecord<AppUser>(`/users/${id}`, dto, "put"),
  updateUserStatus: (id: string | number, isActive: boolean) =>
    writeRecord<{ id: number; isActive: boolean }>(
      `/users/${id}/status`,
      { isActive },
      "put",
    ),
  deleteUser: (id: string | number) => deleteRecord(`/users/${id}`),
};
