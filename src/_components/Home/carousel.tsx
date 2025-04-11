import { Card, CardContent } from "../../components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel";
import { ImageOffIcon } from "lucide-react";

interface ImageCarouselProps {
  images: {
    imagem: string;
  }[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const validImages = images.filter(
    (img) => img.imagem && img.imagem.trim() !== ""
  );

  return (
    <Carousel
      className="w-full h-full"
      plugins={[Autoplay({ delay: 2500 }), Fade()]}
    >
      <CarouselContent className="rounded-none">
        {validImages.length > 0 ? (
          validImages.map((img, index) => (
            <CarouselItem key={index}>
              <Card className="rounded-none h-[10.5rem] flex items-center justify-center">
                <CardContent className="p-0 m-0 w-full h-full">
                  <img
                    src={img.imagem}
                    alt={`Imagem ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))
        ) : (
          <CarouselItem className="w-full h-full ">
            <Card className="rounded-none h-[10.5rem] bg-gray-200">
              <CardContent className="p-0 m-0 w-full h-full flex items-center justify-center">
                <ImageOffIcon size={40} />
              </CardContent>
            </Card>
          </CarouselItem>
        )}
      </CarouselContent>
    </Carousel>
  );
}
