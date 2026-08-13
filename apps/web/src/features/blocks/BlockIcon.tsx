import type { ComponentType } from "react";
import type { BlockIconName } from "@cogent/block-registry";
import {
  IconClick,
  IconDatabase,
  IconFileText,
  IconForms,
  IconGitBranch,
  IconRepeat,
  type IconProps,
} from "@tabler/icons-react";

const BLOCK_ICONS: Record<BlockIconName, ComponentType<IconProps>> = {
  button: IconClick,
  input: IconForms,
  text: IconFileText,
  conditional: IconGitBranch,
  loop: IconRepeat,
  state: IconDatabase,
};

type BlockIconProps = {
  name: BlockIconName;
  size?: number;
  className?: string;
  stroke?: number;
};

export function BlockIcon({
  name,
  size = 20,
  className = "text-indigo-400",
  stroke = 1.75,
}: BlockIconProps) {
  const Icon = BLOCK_ICONS[name];
  return <Icon size={size} stroke={stroke} className={className} aria-hidden />;
}
