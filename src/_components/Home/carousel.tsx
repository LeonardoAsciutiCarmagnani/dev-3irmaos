import { Card, CardContent } from "../../components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel";

export function ImageCarousel() {
  return (
    <Carousel className="w-full" plugins={[Autoplay({ delay: 2500 }), Fade()]}>
      <CarouselContent className="rounded-none">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div>
              <Card className="rounded-none h-[7.5rem] flex items-center justify-center object-cover">
                <CardContent className="flex items-center justify-center w-full">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
