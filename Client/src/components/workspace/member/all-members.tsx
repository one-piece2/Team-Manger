import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type{ RoleType,MemberType } from "@/types/api.type";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { changeWorkspaceMemberRoleMutationFn } from "@/lib/api";
import { toast } from "sonner";

const AllMembers = () => {
  const { hasPermission, user } = useAuthContext();
  //判断权限
  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);

  const queryClient = useQueryClient();

  const workspaceId = useWorkspaceId();
  const { data, isPending } = useGetWorkspaceMembers(workspaceId);

  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast.success("Member's role changed successfully")
       
      },
      onError: (error) => {
        toast.error(error.message)
      },
    });
  };

  return (
    <div className="grid gap-6 pt-2">
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}
      {members?.map((member: MemberType) => {
        const name = member.user?.name;
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);

        return (
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.user?.profilePicture || ""}
                  alt="Image"
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      isLoading ||
                      !canChangeMemberRole ||
                      member.user.id === user?.id
                    }
                    className="ml-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                  >
                    {member.role.name?.toLowerCase()}{" "}
                    {canChangeMemberRole && member.user.id !== user?.id && (
                      <ChevronDown className="text-muted-foreground" />
                    )}
                  </Button>
                </PopoverTrigger>
                {canChangeMemberRole && (
                  <PopoverContent className="p-0" align="end">
                    <Command>
                      <CommandInput
                        disabled={isLoading}
                        className="disabled:pointer-events-none"
                        placeholder="Select new role..."
                      />
                      <CommandList>
                        {isLoading ? (
                          <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                        ) : (
                          <>
                            <CommandEmpty>No roles found.</CommandEmpty>
                            <CommandGroup>
                              {roles?.map(
                                (role: RoleType) =>
                                  role.name !== "OWNER" &&
                                  role.name !== "GUEST" && (
                                    <CommandItem
                                      disabled={isLoading}
                                      key={role.id}
                                      onSelect={() => {
                                        handleSelect(
                                          role.id,
                                          member.user.id
                                        );
                                      }}
                                      className="disabled:pointer-events-none gap-1 mb-1 flex flex-col items-start px-4 py-1 cursor-pointer"
                                    >
                                      <p className="capitalize">
                                        {role.name?.toLowerCase()}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {role.name === "ADMIN" &&
                                          `Can view, create, edit tasks, project and manage settings .`}

                                        {role.name === "MEMBER" &&
                                          `Can view,edit only task created by.`}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMembers;