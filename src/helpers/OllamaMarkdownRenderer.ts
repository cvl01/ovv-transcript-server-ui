import {  Renderer } from '@ts-stack/markdown'

export class OllamaMarkdownRenderer extends Renderer {
    // Overriding parent method.
    override list(body: string, ordered?: boolean): string {
        const type = ordered ? 'ol' : 'ul'
        const class1 = ordered ? 'list-decimal list-outside' : 'list-disc list-inside'

        return `\n<${type} class="${class1}">\n${body}</${type}>\n`
    }
}


