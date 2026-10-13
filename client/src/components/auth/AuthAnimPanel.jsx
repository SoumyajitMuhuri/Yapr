import AuthAnimBackground from "./AuthAnimBackground";
import { useTheme } from "../../context/theme";


const heroPanelClassName = [
  "relative flex min-h-[min(320px,42vh)] shrink-0 flex-col overflow-hidden",
  "bg-[#E8E8ED] dark:bg-black",
  "md:w-[44%] md:max-w-xl md:border-r md:border-black/10 dark:md:border-white/10",
  "lg:w-[42%] lg:max-w-none",
].join(" ");

const heroImageClassName = [
  "h-auto max-h-[min(44vh,380px)] w-[min(92%,19rem)]",
  "animate-[auth-float-y_4.5s_ease-in-out_infinite]",
  "object-contain object-center select-none motion-reduce:animate-none",
  "sm:w-[min(88%,21rem)] md:max-h-[min(52vh,440px)] md:w-[min(90%,22rem)]",
].join(" ");

export function AuthAnimPanel() {
  const { theme } = useTheme();
  const logo = theme === "dark" ? "/logo-dark.png" : "/logo-light.png"
  const logobg = theme === "dark" ? "black" : "white";

  return (
    <section className={heroPanelClassName}>
      <AuthAnimBackground
        src="https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png"
        rows={15}
        cols={7}
        className="absolute! inset-0! h-full! w-full!"
      />

      <div className="relative z-1 flex flex-1 flex-col px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">

        <div
          className="mx-auto flex w-3/4 justify-center py-6 md:py-4 rounded-3xl"
          style={{ backgroundColor: logobg }}
        >
          <img
            src={logo}
            alt=""
            width={640}
            height={640}
            className={heroImageClassName}
            draggable={false}
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}