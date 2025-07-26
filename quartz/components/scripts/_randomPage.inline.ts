import { FullSlug, getFullSlug, pathToRoot, simplifySlug } from "../../util/path"

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export async function navigateToRandomPage() {
const fullSlug = getFullSlug(window)
    const currentSlug = simplifySlug(getFullSlug(window))
    const data = await fetchData
    // get all the slugs except anything that has an #*-exclude or password/passphrase
    const allPosts = Object.keys(data)
      .filter((slug) => {
        const fileData = data[slug]
        const hasExcludeTag = fileData.tags?.some((tag: string) => tag.endsWith("exclude") || tag === "slurp")
        const hasPasswordOrPassphrase = fileData.frontmatter?.password || fileData.frontmatter?.passphrase
        return !hasExcludeTag && !hasPasswordOrPassphrase
      })
      .map((slug) => simplifySlug(slug as FullSlug))

    let newSlug = allPosts[getRandomInt(allPosts.length)];

    // Ensure newSlug is not the current page
    while (newSlug === currentSlug) {
        newSlug = allPosts[getRandomInt(allPosts.length)];
    }

    let newPageUrl;
    if (newSlug === '' || newSlug === '/') {
        newPageUrl = pathToRoot(fullSlug);
    } else {
        newPageUrl = `${pathToRoot(fullSlug)}/${newSlug}`;
    }
    window.location.href = newPageUrl;
}

document.addEventListener("nav", async (e: unknown) => {
    const button = document.getElementById("random-page-button")
    button?.removeEventListener("click", navigateToRandomPage)
    button?.addEventListener("click", navigateToRandomPage)
})