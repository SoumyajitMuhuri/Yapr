const WALLPAPER_FILES = [
  "Alpenglow.jpg",
  "Aoraki.jpg",
  "Ashwood.jpg",
  "Dolomite.jpg",
  "Eclipse.jpg",
  "Monolith.jpg",
  "Nebula.jpg",
  "Obsidian.jpg",
  "Onyx.jpg",
  "Prism.jpg",
  "Provence.jpg",
  "Quartz.jpg",
  "Sahara.jpg",
  "Sierra.jpg",
  "Sonoran.jpg",
  "Verde.jpg",
];

export const WALLPAPERS = WALLPAPER_FILES.map((fileName) => {
  const name = fileName.replace(/\.jpg$/i, "");

  return {
    id: name,
    label: name,
    url: `/wallpapers/${fileName}`,
    thumbnailUrl: `/wallpapers/thumbs/${fileName}`,
  };
});

export const DEFAULT_WALLPAPER_ID = WALLPAPERS[0].id;

export function frameStyleFromUrl(url) {
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function getWallpaperById(id) {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPERS[0];
}
