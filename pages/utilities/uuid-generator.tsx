import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import Header from "@/components/Header";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { CMDK } from "@/components/CMDK";
import { Input } from "@/components/ds/InputComponent";
import GitHubContribution from "@/components/GitHubContribution";

export default function UuidGenerator() {
  const { buttonText, handleCopy } = useCopyToClipboard();
  const { buttonText: copyAndNextText, handleCopy: handleCopyAndNext } =
    useCopyToClipboard("Copy and Generate Next");

  const copyAndNext = () => {
    handleCopyAndNext(currentUuid);
    setCurrentUUid(crypto.randomUUID());
  };

  const [currentUuid, setCurrentUUid] = useState(crypto.randomUUID());

  return (
    <main>
      <Meta
        title="UUID Generator | Free, Open Source & Ad-free"
        description="Generate Random UUIDs with Jam's free UUID Generator."
      />
      <Header />
      <CMDK />

      <section className="max-w-2xl mx-auto mb-12">
        <PageHeader
          title="UUID Generator"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="flex justify-center items-center">
            <Input
              value={currentUuid}
              readOnly
              className="w-80 mb-4 justify-center"
            />
          </div>
          <div className="flex justify-center items-center">
            <div className="w-80">
              <Button className="max-w-40" variant="outline" onClick={() => handleCopy(currentUuid)}>
                {buttonText}
              </Button>
              <Button className="w-48 float-right" onClick={() => copyAndNext()}>
                {copyAndNextText}
              </Button>
            </div>
          </div>

        </Card>
      </section>

      <GitHubContribution username="ChrBu92" />
      <CallToActionGrid />
    </main>
  );
}
