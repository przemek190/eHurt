import React, {useCallback, useMemo, useContext} from 'react';

import * as R from 'ramda';
import {PLN} from '@Utils';

import useCart, {useInCart} from '@Hooks/useCart';
import useAccount from '@Hooks/useAccount';
import useCatalogItem from '@Hooks/useCatalogItem';

import {VBox, HBox, Text} from '@Ui';

import {IoIosCart, IoIosFlash} from 'react-icons/io';

export const QuickEditContext = React.createContext({});
export const DetailsContext = React.createContext({});

function CatalogItem(props) {
  const {id, readOnly = false} = props;
  const item = useCatalogItem(id);
  const {
    name,
    price,
    unit,
    description,
    warehouseStatus,
    warehouseStatusColor,
    warehouseStatusText,
    imageUri,
    points,

    hasWarehouseStatus,
    hasPoints,
    hasBonus,
  } = item;

  const {addOrRemoveItem} = useCart();
  const inCart = useInCart(id);

  const addOrRemove = e => {
    addOrRemoveItem(item);
    e.stopPropagation();
  };

  const {showItemDetails} = useContext(DetailsContext);
  const showDetails = e => {
    if (!R.isEmpty(description) && showItemDetails)
      showItemDetails(id, e);
  };

  const {editItem} = useContext(QuickEditContext);
  const editCartItem = e => {
    if (editItem) {
      editItem(id, e);
      e.stopPropagation();
    }
  };

  const isBuyable = !readOnly && price !== '0.00';
  const isEditable = inCart && editItem;

  return (
    <Container
      {...props}
      className="catalog-item"
      onClick={showDetails}
    >
      <ItemImage image={imageUri}>
        {isBuyable && (
          <>
            <Price>
              {PLN(price)}zł/{unit}
            </Price>

            <HBox tw="absolute bottom-0 left-0 p-1">
              <CartFlair
                inCart={inCart}
                className="cart-flair"
                onClick={addOrRemove}
              />
              {isEditable && (
                <EditFlair
                  className="cart-flair"
                  onClick={editCartItem}
                />
              )}
            </HBox>
          </>
        )}
        <Points visible={hasPoints}>
          {points}
          <Text tw="text-xs">pkt</Text>
        </Points>
      </ItemImage>
      <VBox tw="py-2 px-4 w-32 lg:w-40 h-16" justify="center">
        <Text tw="text-xs lg:text-sm text-black text-center">
          {name}
        </Text>
      </VBox>

      {hasWarehouseStatus && warehouseStatus !== 'LOW' && (
        <WarehouseFlair
          className="warehouse-flair"
          color={warehouseStatusColor}
        >
          <Text tw="px-1 text-center transform -translate-y-8 xl:-translate-y-4">
            {warehouseStatusText}
          </Text>
        </WarehouseFlair>
      )}
    </Container>
  );
}

import tw, {styled} from 'twin.macro';

const Container = styled.div`
  ${tw`relative pb-8 xl:pb-3 mx-2 my-2 max-w-xs bg-white shadow-md cursor-pointer`}
  transition: transform 0.3s;

  @media (min-width: 1024px) {
    &:hover {
      transform: scale(1.048);
    }
  }
`;

const ItemImage = styled.div`
  ${tw`relative w-32 h-32 lg:w-40 lg:h-40 bg-cover border-b border-orange`}
  background-image: url(${props => props.image});
`;

const Price = tw.div`absolute top-0 right-0 p-2 font-light text-xs lg:text-base bg-white border-b-4 border-orange shadow-md transform translate-x-2 -translate-y-2`;
const Points = styled.div`
  ${tw`absolute top-0 left-0 text-center text-orange text-sm font-bold px-2 pb-1`}
  ${({visible}) => !visible && tw`hidden`}
  background-color: #201B1F;
`;

///////// Flairs
const WarehouseFlair = styled.div`
  ${tw`absolute bottom-0 right-0 w-full`}
  height: 0.33rem;
  font-size: 0.63rem;

  background-color: ${props => props.color};
`;

const CartFlair = styled(IoIosCart)`
  ${tw`text-white text-center text-4xl lg:text-5xl p-2 rounded-full lg:hidden`}
  ${props =>
    props.inCart ? tw`block! bg-red-500 text-black` : tw`bg-black`}
`;

const EditFlair = styled(IoIosFlash)`
  ${tw`hidden text-black bg-yellow-400 text-center text-4xl lg:text-5xl p-2 rounded-full`}
`;

export default React.memo(CatalogItem);
