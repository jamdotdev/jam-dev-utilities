import { Button } from "./ds/ButtonComponent";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "./ds/CardComponent";

interface HomeCardProps {
  title: string;
  description: string;
}

export default function HomeCard({ title, description }: HomeCardProps) {
  return (
    <Card>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <Button variant="outline">Try it</Button>
      </CardContent>
    </Card>
  );
}
