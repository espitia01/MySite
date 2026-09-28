export const SITE = {
  name: "Giovanny Espitia",
  title: "Giovanny Espitia — Notes",
  description:
    "Notes on textbooks, papers, and lectures by Giovanny Espitia, Ph.D. student in physics at The University of Texas at Austin.",
  affiliation: "Department of Physics, UT Austin",
  email: "gespitia3@utexas.edu",
  links: {
    scholar: "https://scholar.google.com/citations?user=gespitia",
    github: "https://github.com/espitia01",
    linkedin: "https://www.linkedin.com/in/giovanny-espitia/",
    cv: "/aboutMe/EspitiaGiovannyCV.pdf",
  },
};

export function formatDate(value: string, style: "long" | "short" | "monthDay" = "long") {
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : style === "short"
        ? { year: "numeric", month: "short", day: "numeric" }
        : { month: "short", day: "numeric" };
  return new Date(value).toLocaleDateString("en-US", options);
}
