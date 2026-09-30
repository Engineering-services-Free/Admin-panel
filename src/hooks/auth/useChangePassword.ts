import { useMutation } from "@tanstack/react-query";

import { changePassword } from "@/api/auth.api";
import type {
  ChangePasswordInput,
  ChangePasswordResponse,
} from "@/typings/api.typings";

export function useChangePassword() {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordInput>({
    mutationFn: changePassword,
  });
}
