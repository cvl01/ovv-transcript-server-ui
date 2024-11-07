import markdownIt from "markdown-it";

function OllamaMarkdownRenderer(md: markdownIt) {
    // Store the default list renderer for ordered and unordered lists
    // const defaultRender =
    // md.renderer.rules.list_item_open ||
    // function (tokens, idx, options, _env, self) {
    //     return self.renderToken(tokens, idx, options);
    // };

    // Override the list_open renderer
    md.renderer.rules.list_open = function (tokens, idx, options, _env, self) {
        console.log(tokens);

        const token = tokens[idx];
        const ordered = token.tag === "ol";
        const class1 = ordered
            ? "list-decimal list-outside"
            : "list-disc list-inside";

        token.attrPush(["class", class1]); // Add class to the opening list tag
        return self.renderToken(tokens, idx, options);
    };
}

// Usage Example

export const parseIfPresent = (text: string | null | undefined) => {
    const md = markdownIt().use(OllamaMarkdownRenderer);
    // const md = markdownit()
    return text ? md.render(text) : null;
};
