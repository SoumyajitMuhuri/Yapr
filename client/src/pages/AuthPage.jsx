import React from 'react'
import AuthHeader from '../components/auth/AuthHeader'
import { AuthAnimPanel } from '../components/auth/AuthAnimPanel'
import AuthActionPanel from '../components/auth/AuthActionPanel'
import { useWallpaper } from '../context/wallpaper'

function AuthPage() {

  const { frameStyle } = useWallpaper();
  return (
    <div className="box-border flex min-h-dvh flex-col p-3 sm:p-5 md:p-8" style={frameStyle}>

      <div className="mx-auto flex w-full max-w-368 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-background text-foreground">

      <AuthHeader />
      <main className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        <AuthAnimPanel />
        <AuthActionPanel />

      </main>
      </div>

    </div>
  )
}

export default AuthPage