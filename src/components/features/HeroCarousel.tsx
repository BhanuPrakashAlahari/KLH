import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

interface GalleryHoverCarouselItem {
    id: string;
    title: string;
    summary: string;
    url: string;
    image: string;
}

export function HeroCarousel({
    heading = "Discover Exceptional Stays",
    items = [
        {
            id: "item-1",
            title: "Trending Hotels",
            summary:
                "Explore the most sought-after destinations and top-rated accommodations around the globe.",
            url: "/home",
            image:
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        },
        {
            id: "item-2",
            title: "Exclusive Offers",
            summary:
                "Unlock premium experiences with our carefully curated selection of limited-time hotel packages.",
            url: "/home",
            image:
                "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1528&q=80",
        },
        {
            id: "item-3",
            title: "Unbeatable Discounts",
            summary:
                "Save big on your next getaway with exclusive member-only discounts and seasonal promotions.",
            url: "/home",
            image:
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        },
        {
            id: "item-4",
            title: "Personalized For You",
            summary:
                "Recommendations tailored specifically to your travel preferences and past booking history.",
            url: "/home",
            image:
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1449&q=80",
        },
        {
            id: "item-5",
            title: "Luxury Retreats",
            summary:
                "Indulge in unparalleled comfort and world-class amenities at our premium partnered resorts.",
            url: "/home",
            image:
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        }
    ],
}: {
    heading?: string;
    items?: GalleryHoverCarouselItem[];
}) {
    const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>();
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    useEffect(() => {
        if (!carouselApi) return;
        const update = () => {
            setCanScrollPrev(carouselApi.canScrollPrev());
            setCanScrollNext(carouselApi.canScrollNext());
        };
        update();
        carouselApi.on("select", update);
        return () => {
            carouselApi.off("select", update);
        };
    }, [carouselApi]);

    return (
        <section className="py-6 sm:py-8 w-full bg-transparent">
            <div className="w-full">
                <div className="mb-6 flex flex-col justify-between sm:mb-8 md:flex-row md:items-end w-full">
                    <div className="max-w-xl">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-900 leading-tight">
                            {heading}{" "}
                            <span className="text-slate-500 font-normal text-sm sm:text-base lg:text-lg block mt-2">
                                Find the perfect stay tailored for your next unforgettable journey.
                            </span>
                        </h3>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => carouselApi?.scrollPrev()}
                            disabled={!canScrollPrev}
                            className="h-10 w-10 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => carouselApi?.scrollNext()}
                            disabled={!canScrollNext}
                            className="h-10 w-10 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="w-full">
                    <Carousel
                        setApi={setCarouselApi}
                        opts={{
                            align: "start",
                            loop: true,
                            breakpoints: { "(max-width: 768px)": { dragFree: true } }
                        }}
                        plugins={[
                            Autoplay({
                                delay: 4000,
                                stopOnInteraction: true,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 sm:-ml-6 touch-pan-y">
                            {items.map((item) => (
                                <CarouselItem key={item.id} className="pl-4 sm:pl-6 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%] xl:basis-[28%]">
                                    <Link to={item.url} className="group block relative w-full h-[320px] sm:h-[380px] rounded-[2rem] overflow-hidden drop-shadow-sm transition-all duration-300 hover:drop-shadow-md">
                                        <Card className="overflow-hidden border-0 h-full w-full rounded-[2rem] bg-slate-100">
                                            <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover object-center"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                                            </div>

                                            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end">
                                                <h3 className="text-xl sm:text-2xl font-medium text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-200 text-sm md:text-base line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-75">
                                                    {item.summary}
                                                </p>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border-0 transition-all duration-500 rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 group-hover:-rotate-45"
                                                >
                                                    <ArrowRight className="size-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
