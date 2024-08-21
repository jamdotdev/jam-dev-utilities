import { useState } from "react";
import CallToActionGrid from "@/components/CallToActionGrid";
import { CMDK } from "@/components/CMDK";
// import { Button } from "@/components/ds/ButtonComponent";
import { Card } from "@/components/ds/CardComponent";
// import { Textarea } from "@/components/ds/TextareaComponent";
import Header from "@/components/Header";
import Meta from "@/components/Meta";
import PageHeader from "@/components/PageHeader";
import { Label } from "@/components/ds/LabelComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Textarea } from "@/components/ds/TextareaComponent";

export default function CSSUnitsConverter() {
  const [toUnits, setUnits] = useState(2);
  console.log(toUnits);

  return (
    <main>
      <Meta
        title="CSS units converter by Jam.dev | Free, Open Source & Ad-free"
        description="Convert your css units values to other options"
      />
      <Header />
      <CMDK />
      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSS Units Converter"
          description="Convert your css units values to other options"
        />
      </section>
      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div>
            <Label>Number</Label>
            <Textarea className="mb-6" rows={3} />
            <div className="mb-6 flex w-full gap-4">
              <div className="flex flex-1 flex-col">
                <Label>From</Label>
                <Combobox
                  data={data}
                  onSelect={(value) => setUnits(parseInt(value))}
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Label>To</Label>
                <Combobox
                  data={data}
                  onSelect={(value) => setUnits(parseInt(value))}
                />
              </div>
            </div>

            <Label>Result</Label>
            <Textarea value={""} rows={3} readOnly className="mb-4" />
          </div>
        </Card>
      </section>

      <CallToActionGrid />
    </main>
  );
}

const data = [
  {
    value: "px",
    label: "Px",
  },
  {
    value: "rem",
    label: "Rem",
  },
  {
    value: "em",
    label: "Em",
  },
  {
    value: "%",
    label: "Percent",
  },
  {
    value: "vw",
    label: "Viewport Width (vw)",
  },
  {
    value: "vh",
    label: "Viewport Height (vh)",
  },
  {
    value: "vmin",
    label: "Viewport Min (vmin)",
  },
  {
    value: "vmax",
    label: "Viewport Max (vmax)",
  }
];