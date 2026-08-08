export type LogoGraphicsVideo = {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

const BASE =
  "https://d3uo687t366hok.cloudfront.net/videos/logo%20%26%20graphics";

export const logoGraphicsVideos: LogoGraphicsVideo[] = Array.from(
  { length: 12 },
  (_, index) => {
    const id = index + 1;

    return {
      id,
      title: `Graphic ${id}`,
      thumbnail: `${BASE}/${id}.jpg`,
      description: "Creative graphic design project.",
      duration: "",
      category: "Graphics",
      client: "Brands",
      services: ["Graphic Design"],
    };
  }
);