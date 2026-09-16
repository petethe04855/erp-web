import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settingsApi";
export function useSettings() {
  const client = useQueryClient();
  return {
    query: useQuery({ queryKey: ["settings"], queryFn: settingsApi.get }),
    mutation: useMutation({
      mutationFn: settingsApi.save,
      onSuccess: () => client.invalidateQueries({ queryKey: ["settings"] }),
    }),
  };
}
