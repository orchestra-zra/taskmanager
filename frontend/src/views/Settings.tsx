import ArrowRight from "../assets/icons/ArrowRight";
import { Link } from "react-router-dom";
import { t } from "i18next";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { useTheme, ThemeMode } from "../context/ThemeContext";
import haptic from "../common/haptic";

const Settings = () => {
  const { theme, setTheme, setAppHeaderColor } = useTheme();

  useEffect(() => {
    const BackButton = WebApp.BackButton;
    BackButton.show();
    setAppHeaderColor("card");
  }, [setAppHeaderColor]);

  const handleSelectTheme = (mode: ThemeMode) => {
    haptic.selection();
    setTheme(mode);
  };

  const themeOptions: { mode: ThemeMode; labelKey: string }[] = [
    { mode: "system", labelKey: "theme_system" },
    { mode: "light", labelKey: "theme_light" },
    { mode: "dark", labelKey: "theme_dark" },
  ];

  return (
    <div className='px-3 mt-2'>
      <div className='h-[40px] w-full px-4 py-[11px]'>
        <p className='text-[13px] text-customGrayDark font-sfpro uppercase tracking-wider'>
          {t("app_settings")}
        </p>
      </div>
      <div className='bg-white rounded-[12px] overflow-hidden'>
        <Link
          to={"/language"}
          className='w-full h-[48px] flex items-center justify-between px-4 bg-white'
        >
          <p className='text-[17px] font-normal text-black font-sfpro'>
            {t("app_language")}
          </p>
          <ArrowRight />
        </Link>
      </div>

      <div className='h-[40px] w-full px-4 py-[11px] mt-4'>
        <p className='text-[13px] text-customGrayDark font-sfpro uppercase tracking-wider'>
          {t("theme")}
        </p>
      </div>
      <div className='bg-white rounded-[12px] p-1.5 flex gap-1 shadow-custom'>
        {themeOptions.map((opt) => {
          const isActive = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type='button'
              onClick={() => handleSelectTheme(opt.mode)}
              className={`flex-1 py-2 rounded-[8px] text-[14px] font-sfpro font-medium transition-all ${
                isActive
                  ? "bg-custom-gradient-blue text-white shadow-sm"
                  : "text-customBlack hover:opacity-80"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
