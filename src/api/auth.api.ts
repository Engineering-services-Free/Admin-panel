import { apiClient } from "./client";
import type {
  ChangePasswordInput,
  ChangePasswordResponse,
  LoginInput,
  LoginResponse,
} from "../typings/api.typings";

export function login(input: LoginInput): Promise<LoginResponse> {
  return apiClient
    .post<LoginResponse>("/auth/login", input)
    .then((response) => response.data);
}

export function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
  return apiClient
    .post<ChangePasswordResponse>("/auth/change-password", input)
    .then((response) => response.data);
}
