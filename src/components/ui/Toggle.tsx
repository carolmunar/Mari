interface ToggleProps {
  enabled: boolean;
  onClick: () => void;
}

export function Toggle({ enabled, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
      aria-pressed={enabled}
    >
      <div
        className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${
          enabled ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  );
}
