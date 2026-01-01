import { useCallback, useState } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import MarkdownToHtmlSEO from "@/components/seo/MarkdownToHtmlSEO";
import { markdownToHtml } from "@/lib/markdownToHtml";

export default function MarkdownToHTML() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const { buttonText, handleCopy } = useCopyToClipboard();

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            const { value } = event.currentTarget;
            setInput(value);

            try {
                const htmlOutput = markdownToHtml(value);
                setOutput(htmlOutput);
            } catch {
                setOutput("Invalid Markdown");
            }
        },
        []
    );

    return (
        <main>
            <Meta
                title="Markdown to HTML by Jam.dev | Free, Open Source & Ad-free"
                description="Convert Markdown to HTML format quickly and easily with Jam's free online Markdown to HTML converter. Just paste your Markdown and get clean HTML. That's it."
            />
            <Header />
            <CMDK />

            <section className="container max-w-2xl mb-12">
                <PageHeader
                    title="Markdown to HTML"
                    description="Free, Open Source & Ad-free"
                />
            </section>

            <section className="container max-w-2xl mb-6">
                <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
                    <div>
                        <Label>Markdown</Label>
                        <Textarea
                            rows={6}
                            placeholder="Paste Markdown here"
                            onChange={handleChange}
                            className="mb-6"
                            value={input}
                        />
                        <Label>HTML</Label>
                        <Textarea value={output} rows={6} readOnly className="mb-4" />
                        <Button variant="outline" onClick={() => handleCopy(output)}>
                            {buttonText}
                        </Button>
                    </div>
                </Card>
            </section>

            <CallToActionGrid />

            <section className="container max-w-2xl">
                <MarkdownToHtmlSEO />
            </section>
        </main>
    );
}
