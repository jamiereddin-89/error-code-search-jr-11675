import { useParams } from "react-router-dom";
import ButtonPage from "@/components/ButtonPage";

export default function ButtonSlug() {
  const { slug } = useParams();
  const title = (slug || "").split("-").map(s => s.replace(/(^|\s)\S/g, l => l.toUpperCase())).join(' ');
  return <ButtonPage title={title} />;
}
