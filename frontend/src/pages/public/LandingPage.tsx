import { HistoricalHero } from "@/components/landing/HistoricalHero";
import { EditorialStatement } from "@/components/landing/EditorialStatement";
import { VisualBreak } from "@/components/landing/VisualBreak";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { HorizontalExplorer } from "@/components/landing/HorizontalExplorer";
import { MenuExperience } from "@/components/landing/MenuExperience";
import { EditorialCTA } from "@/components/landing/EditorialCTA";

export function LandingPage() {
  return (
    <>
      <HistoricalHero />
      <EditorialStatement />
      <VisualBreak />
      <ProductShowcase />
      <HorizontalExplorer />
      <MenuExperience />
      <EditorialCTA />
    </>
  );
}
