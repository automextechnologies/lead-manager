import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeads, createLead, updateLead, deleteLead } from "@/lib/api";
import { Lead, LeadStatus } from "@/lib/types";
import { toast } from "sonner";

export const LEADS_QUERY_KEY = ["leads"];

export function useLeads() {
  return useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: getLeads,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newLead: Partial<Lead>) => createLead(newLead),
    onMutate: async (newLead) => {
      await queryClient.cancelQueries({ queryKey: LEADS_QUERY_KEY });
      const previousLeads = queryClient.getQueryData<Lead[]>(LEADS_QUERY_KEY);

      if (previousLeads && newLead.phone) {
        const optimisticLead: Lead = {
          leadDate: newLead.leadDate || new Date().toISOString().split("T")[0],
          phone: newLead.phone,
          phoneNum: newLead.phone,
          name: newLead.name || "",
          age: newLead.age,
          assigned: newLead.assigned || "abdu",
          status: newLead.status || "new lead",
          nextFollowUp: newLead.nextFollowUp,
          notes: newLead.notes,
        };
        queryClient.setQueryData<Lead[]>(LEADS_QUERY_KEY, [optimisticLead, ...previousLeads]);
      }

      return { previousLeads };
    },
    onError: (err: any, _, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(LEADS_QUERY_KEY, context.previousLeads);
      }
      toast.error(err.message || "Failed to create lead");
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead created successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, updatedFields }: { phone: string; updatedFields: Partial<Lead> }) =>
      updateLead(phone, updatedFields),
    onMutate: async ({ phone, updatedFields }) => {
      await queryClient.cancelQueries({ queryKey: LEADS_QUERY_KEY });
      const previousLeads = queryClient.getQueryData<Lead[]>(LEADS_QUERY_KEY);

      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(
          LEADS_QUERY_KEY,
          previousLeads.map((item) =>
            item.phone.trim() === phone.trim() ? { ...item, ...updatedFields } : item
          )
        );
      }

      return { previousLeads };
    },
    onError: (err: any, _, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(LEADS_QUERY_KEY, context.previousLeads);
      }
      toast.error(err.message || "Failed to update lead");
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead updated!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useQuickUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, newStatus }: { phone: string; newStatus: LeadStatus }) =>
      updateLead(phone, { status: newStatus }),
    onMutate: async ({ phone, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: LEADS_QUERY_KEY });
      const previousLeads = queryClient.getQueryData<Lead[]>(LEADS_QUERY_KEY);

      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(
          LEADS_QUERY_KEY,
          previousLeads.map((item) =>
            item.phone.trim() === phone.trim() ? { ...item, status: newStatus } : item
          )
        );
      }

      return { previousLeads };
    },
    onError: (err: any, _, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(LEADS_QUERY_KEY, context.previousLeads);
      }
      toast.error(err.message || "Status change failed");
    },
    onSuccess: (res) => {
      toast.success(res.message || "Status updated!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phone: string) => deleteLead(phone),
    onMutate: async (phone) => {
      await queryClient.cancelQueries({ queryKey: LEADS_QUERY_KEY });
      const previousLeads = queryClient.getQueryData<Lead[]>(LEADS_QUERY_KEY);

      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(
          LEADS_QUERY_KEY,
          previousLeads.filter((item) => item.phone.trim() !== phone.trim())
        );
      }

      return { previousLeads };
    },
    onError: (err: any, _, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(LEADS_QUERY_KEY, context.previousLeads);
      }
      toast.error(err.message || "Failed to delete lead");
    },
    onSuccess: (res) => {
      toast.success(res.message || "Lead deleted!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    },
  });
}
