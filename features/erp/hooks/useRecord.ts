import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordApi, type Resource } from "../api/recordApi";
export function useRecord(
  resource: Resource,
  id: string | number,
  open: boolean,
) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["record", resource, id],
    queryFn: () => recordApi.get(resource, id),
    enabled: open,
  });
  const mutation = useMutation({
    mutationFn: async (action: {
      status?: string;
      amount?: number;
      convert?: boolean;
    }) => {
      if (action.convert) return recordApi.convert(id);
      if (action.amount !== undefined) return recordApi.pay(id, action.amount);
      return recordApi.status(resource, id, action.status!);
    },
    onSuccess: () => client.invalidateQueries(),
  });
  return { query, mutation };
}
