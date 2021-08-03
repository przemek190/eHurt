import React from 'react';
import {
  CarouselProvider,
  Slider,
  Slide,
  Image,
} from 'pure-react-carousel';

import usePromos from '@Hooks/usePromos';

import GAZETKA from '../../public/gaz1.png';
import ZLOTY from '../../public/zloty.png';

export default function PromosCarousel({
  width = 700,
  height = 1000,
  sliderHeight,
  interval = 3000,
}) {
  const promos = usePromos();
  return (
    <CarouselProvider
      naturalSlideHeight={height}
      naturalSlideWidth={width}
      totalSlides={promos.length + 2}
      isPlaying={true}
      interval={interval}
      infinite={true}
    >
      <Slider tw="mx-2 mt-8" style={{width: sliderHeight}}>
        {promos.map((promo, index) => (
          <Slide key={promo} index={index + 1}>
            <PromoImage src={promo} />
          </Slide>
        ))}
        <a href="/ehurt/gaz1.pdf" target="_blank">
          <Slide index={promos.length + 1}>
            <PromoImage src={GAZETKA} />
          </Slide>
        </a>
        <a href="/ehurt/zloty.pdf" target="_blank">
          <Slide index={promos.length + 2}>
            <PromoImage src={ZLOTY} />
          </Slide>
        </a>
      </Slider>
    </CarouselProvider>
  );
}

import tw, {styled} from 'twin.macro';

const PromoImage = styled(Image)`
  ${tw`cursor-pointer object-scale-down`}
  max-height: 900px;
`;
