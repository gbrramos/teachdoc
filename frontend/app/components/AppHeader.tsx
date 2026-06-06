import Button from "~/components/Button";
import UserProfileIcon from "~/components/UserProfileIcon";

type AppHeaderProps = {
  title?: string;
  userName?: string | null;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: "primary" | "secondary" | "ghost";
};

export default function AppHeader({
  title = "TeachDoc",
  userName,
  actionLabel,
  onAction,
  actionVariant = "ghost",
}: AppHeaderProps) {
  return (
    <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        {userName ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserProfileIcon />
            <span>{userName}</span>
          </div>
        ) : null}
        <Button type="button" variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </header>
  );
}

