import { useTranslation } from "react-i18next";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Shared, localized error state with an optional retry action.
 * Replaces blank screens / raw developer-facing error strings.
 */
export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 h-full text-center">
      <p className="text-[15px] font-sfpro text-customBlackLight">
        {message ?? t("error_generic")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-customBlue text-white text-[14px] font-sfpro font-medium"
        >
          {t("error_retry")}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
