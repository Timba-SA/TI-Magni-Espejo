import { fetchApi } from "@/shared/api/apiClient";
import type { AppUser } from "../types/user.types";

export async function getUsers(): Promise<AppUser[]> {
  return fetchApi<AppUser[]>("/auth/users");
}
