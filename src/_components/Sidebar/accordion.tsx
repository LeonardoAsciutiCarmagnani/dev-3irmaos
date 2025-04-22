import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-gray-50">
      <Accordion type="single" collapsible>
        <AccordionItem value="produtos">
          <AccordionTrigger>Produtos</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              <li>Camisetas</li>
              <li>Calçados</li>
              <li>Acessórios</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        {/* Outros tópicos */}
      </Accordion>
    </aside>
  );
}
