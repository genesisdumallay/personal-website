const getAboutMe = async () => {
  try {
    const res = await fetch("/api/aboutMe");
    if (!res.ok) {
      console.error(
        "[getAboutMe] Failed to fetch about me data:",
        res.statusText
      );
      return "";
    }
    const data = await res.json();
    return data.aboutMe || "";
  } catch (err) {
    console.error("[getAboutMe] Error fetching about me data:", err);
    return "";
  }
};

export default getAboutMe;
