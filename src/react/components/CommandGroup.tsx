import React, { useEffect, useMemo } from "react";
import { Command } from "@/context/CommandGroupContext";
import { useCommandGroup } from "@/hooks/useCommandGroup";

export const Cmd: React.VFC<Command> = () => <></>;

export const CommandGroup: React.FC<{
  name: string;
  enabled?: boolean;
}> = ({ name, enabled = true, children }) => {
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
      ret.push(child.props);
    });
    return ret;
  }, [children]);
  const commandGroup = useCommandGroup();
  useEffect(() => {
    if (enabled) {
      commandGroup.register({ groupName: name, commands });
      return () => commandGroup.unregister(name);
    }
  }, [commandGroup, name, enabled, commands]);

  return <></>;
};
