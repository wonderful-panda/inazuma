import React, { useEffect, useMemo } from "react";
import { type Command, useCommandGroupTree } from "@/context/CommandGroupContext";
import { useCommandGroup } from "@/hooks/useCommandGroup";
import { nope } from "@/util";

export const Cmd: React.FC<Command> = () => null;

export const CommandGroup: React.FC<
  React.PropsWithChildren<{
    name: string;
    enabled?: boolean;
  }>
> = ({ name, enabled = true, children }) => {
  const commandGroupTree = useCommandGroupTree();
  const actualEnabled = enabled && commandGroupTree.enabled;
  const groupName = `${commandGroupTree.path}:${name}`;

  const commands = useMemo(() => {
    const ret: Command[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        return;
      }
      const name = typeof child.type === "string" ? child.type : child.type.name;
      if (name !== Cmd.name) {
        console.error(`CommandGroup can contain ${Cmd.name} only`);
      }
      ret.push(child.props as Command);
    });
    return ret;
  }, [children]);
  const commandGroup = useCommandGroup();
  useEffect(() => {
    if (actualEnabled) {
      commandGroup.register({ groupName, commands });
      return () => commandGroup.unregister(groupName);
    }
    return nope;
  }, [commandGroup, groupName, actualEnabled, commands]);

  return null;
};
