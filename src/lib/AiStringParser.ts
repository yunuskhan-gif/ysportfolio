const MARKDOWN_PATTERNS = {
    DIVIDER: /(---|___|--|__)/g,
    HEADING: /^(##|####|###)\s+(.*)$/gm,
    BOLD: /\*\*(.*?)\*\*/g,
    ITALIC: /`(.*?)`/g,
    SEMI_BOLD: /\*(?!\*)(.*?)\*/g,
    LIST_ITEM: /^\*\s{2,}(.*)/,
    LATEX_ARROW: /\$\\(rightarrow|to)\$/g,
} as const

export function AiStringParser(input: string): string {
    if (!input) return ""

    const latexProcessed = input.replace(
        MARKDOWN_PATTERNS.LATEX_ARROW,
        "→"
    )

    const formattedText = latexProcessed
        .replace(MARKDOWN_PATTERNS.DIVIDER, "<hr />")
        .replace(MARKDOWN_PATTERNS.HEADING, "<h1 class='text-md font-bold'>$2</h1>")
        .replace(MARKDOWN_PATTERNS.BOLD, "<strong class='font-bold'>$1</strong>")
        .replace(MARKDOWN_PATTERNS.ITALIC, "<em>$1</em>")
        .replace(MARKDOWN_PATTERNS.SEMI_BOLD, "<span class='font-semibold'>$1</span>")

    const lines = formattedText.split("\n")
    const output: string[] = []
    let inList = false

    for (const line of lines) {
        const isListItem = MARKDOWN_PATTERNS.LIST_ITEM.test(line)

        if (isListItem) {
            if (!inList) {
                output.push("<ul>")
                inList = true
            }
            const content = line.replace(/^\*\s{2,}/, "")
            output.push(`<li>${content}</li>`)
        } else {
            if (inList) {
                output.push("</ul>")
                inList = false
            }
            output.push(line)
        }
    }

    if (inList) output.push("</ul>")

    return output
        .join("\n")
        .replace(/(<\/h1>|<\/h2>|<hr \/>|<ul>|<\/ul>|<\/li>)\n/g, "$1")
        .replace(/\n/g, "<div class='my-2' />")
}