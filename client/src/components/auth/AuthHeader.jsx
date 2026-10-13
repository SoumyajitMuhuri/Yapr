import React from 'react'
import { AppLogo } from '../assets/AppLogo'
import { WallpaperPicker } from '../WallpaperPicker'
import { ThemePresetPicker } from '../ThemePresetPicker'
import { ThemeToggle } from '../ThemeToggle'

function AuthHeader() {
  return (
    <header className="sticky top-0 z-10 flex flex-col items-center gap-2 border-b border-black/10 bg-[#F6F6F6]/95 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#1C1C1E]/95 md:relative md:flex-row md:justify-center">
      <AppLogo size={100} className="rounded-[7px]" alt="" />

      <div className="flex w-full shrink-0 items-center justify-end gap-2 md:absolute md:right-3 md:w-auto">
        <WallpaperPicker />
        <ThemePresetPicker />
        <ThemeToggle />
      </div>
    </header>
  );
}
export default AuthHeader