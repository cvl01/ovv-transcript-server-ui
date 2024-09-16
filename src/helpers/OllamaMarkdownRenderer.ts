import {  Renderer } from '@ts-stack/markdown'

export class OllamaMarkdownRenderer extends Renderer {
    // Overriding parent method.
    override list(body: string, ordered?: boolean): string {
        const type = ordered ? 'ol' : 'ul'
        const class1 = ordered ? 'list-decimal' : 'list-disc'

        return `\n<${type} class="${class1} list-inside">\n${body}</${type}>\n`
    }
}


