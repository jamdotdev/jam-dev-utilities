import Meta from "@/components/Meta";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Combobox } from "@/components/ds/ComboboxComponent";
import { Label } from "@/components/ds/LabelComponent";
import { useState } from "react";
import {
  KeywordCase,
  IndentStyle,
  formatDialect,
  sqlite,
  bigquery,
  db2,
  db2i,
  hive,
  mariadb,
  mysql,
  tidb,
  n1ql,
  plsql,
  postgresql,
  redshift,
  spark,
  sql,
  trino,
  transactsql,
  singlestoredb,
  snowflake,
  DialectOptions,
} from "sql-formatter";
import { Button } from "@/components/ds/ButtonComponent";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";

const defaultDialect = postgresql;
const dialectOptionsMap = {
  sqlite: sqlite,
  bigquery: bigquery,
  db2: db2,
  db2i: db2i,
  hive: hive,
  mariadb: mariadb,
  mysql: mysql,
  tidb: tidb,
  n1ql: n1ql,
  plsql: plsql,
  postgresql: postgresql,
  redshift: redshift,
  spark: spark,
  sql: sql,
  trino: trino,
  transactsql: transactsql,
  singlestoredb: singlestoredb,
  snowflake: snowflake,
};
const formatSQL = (
  query: string,
  options?: {
    dialect?: DialectOptions;
    tabWidth?: number;
    indentStyle?: IndentStyle;
    case?: KeywordCase;
  }
) => {
  try {
    return formatDialect(query, {
      dialect: options?.dialect ?? defaultDialect,
      tabWidth: options?.tabWidth,
      indentStyle: options?.indentStyle,
      dataTypeCase: options?.case,
      functionCase: options?.case,
      keywordCase: options?.case,
    });
  } catch (err) {
    return err.message;
  }
};
export default function SQLFormatter() {
  const [tabs, setTabs] = useState<number>(2);
  const [indentStyle, setIndentStyle] = useState<IndentStyle>("standard");
  const [queryCase, setQueryCase] = useState<KeywordCase>("preserve");
  const [query, setQuery] = useState<string>("");
  const [formattedQuery, setFormattedQuery] = useState<string>("");
  const [dialect, setDialect] = useState<DialectOptions>(defaultDialect);
  const { buttonText, handleCopy } = useCopyToClipboard();

  return (
    <main>
      <Meta
        title="SQL formatter | Free, Open Source & Ad-free"
        description="Easily format and beautify SQL queries with Jam's free online SQL formatter. Just paste your query and get formatted output."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="SQL formatter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-6xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col">
                <Label>Tabs</Label>
                <Combobox
                  data={tabWidthData}
                  onSelect={(value) => setTabs(parseInt(value))}
                  searchItemPlaceholder="Search number of tabs."
                  searchItemNotFoundMessage="Please select 2, 4, 6 or 8 tabs."
                  selectedItemFallbackLabel="Tabs..."
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Label>Indent Style</Label>
                <Combobox
                  data={indentStyleData}
                  onSelect={(value) => setIndentStyle(value as IndentStyle)}
                  selectedItemFallbackLabel="Indent style..."
                  searchItemPlaceholder="Search indent style."
                  searchItemNotFoundMessage="Please select standard, left or right."
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Label>Case</Label>
                <Combobox
                  data={queryCaseData}
                  searchItemPlaceholder="Select case..."
                  searchItemNotFoundMessage="Please select upper, lower or preserve"
                  selectedItemFallbackLabel="Case..."
                  onSelect={(value) => setQueryCase(value as KeywordCase)}
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Label>Dialect</Label>
                <Combobox
                  data={dialectData}
                  searchItemPlaceholder="Select dialect..."
                  searchItemNotFoundMessage="Please select from available dialect."
                  selectedItemFallbackLabel="Dialect..."
                  onSelect={(value) => setDialect(dialectOptionsMap[value])}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <Textarea
                  rows={16}
                  cols={64}
                  placeholder="Paste query here."
                  onChange={(e) => setQuery(e.target.value)}
                  value={query}
                  spellCheck={false}
                  className="font-mono mb-4"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFormattedQuery(
                        formatSQL(query, {
                          tabWidth: tabs,
                          indentStyle: indentStyle,
                          case: queryCase,
                          dialect,
                        })
                      )
                    }
                  >
                    Format
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormattedQuery("");
                      setQuery("");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div>
                <Textarea
                  rows={16}
                  cols={64}
                  placeholder="Your formatted query would be generated here."
                  value={formattedQuery}
                  spellCheck={false}
                  className="font-mono mb-4"
                />

                <Button variant="outline" onClick={() => handleCopy(query)}>
                  {buttonText}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
      <CallToActionGrid />
    </main>
  );
}

const tabWidthData = [
  {
    value: "2",
    label: "2",
  },
  {
    value: "4",
    label: "4",
  },
  {
    value: "6",
    label: "6",
  },
  {
    value: "8",
    label: "8",
  },
];
const indentStyleData: { value: IndentStyle; label: string }[] = [
  { value: "standard", label: "standard" },
  { value: "tabularLeft", label: "left" },
  { value: "tabularRight", label: "right" },
];
const queryCaseData: { value: KeywordCase; label: string }[] = [
  { value: "lower", label: "lower" },
  { value: "upper", label: "upper" },
];
const dialectData: { value: string; label: string }[] = Object.keys(
  dialectOptionsMap
).map((item) => {
  return {
    value: item,
    label: item,
  };
});
