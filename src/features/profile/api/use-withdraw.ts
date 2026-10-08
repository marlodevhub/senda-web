import { useMutation } from "@tanstack/react-query";
import { withdraw } from "@/features/profile/api/withdraw";

export function useWithdraw() {
  return useMutation({ mutationFn: withdraw });
}
