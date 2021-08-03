import React, {useEffect, useState, useRef} from 'react';
import Link from 'next/link';

import useAccount from '@Hooks/useAccount';
import {useCatalogFilter} from '@Hooks/useFilter';
import useFavorites from '@Hooks/useFavorites';
import useCatalog from '@Hooks/useCatalog';

import useMedia from '#Hooks/useMedia';

import {CatalogEvents} from '@Events';

import {
  DetailsContext,
  QuickEditContext,
} from '@Components/CatalogItem';

import QuickEditModal from '@Modals/QuickEditModal';
import DetailsModal from '@Modals/DetailsModal';

import {Text, Card, VBox, HBox, Button, ScrollView} from '@Ui';
import Alert from '@Ui/Alerts';
import {ProgressButton} from '@Ui/Feedback';

import {ClientOnly, OwnerOnly} from '@Components/Roles';
import CatalogItem from '@Components/CatalogItem';

function Catalog() {
  const itemInputRef = useRef();

  const {
    catalogItems,
    categories,
    isUpdating,
    updateCatalog,
  } = useCatalog();

  const {
    filteredItems,
    filterByName,
    filterByCategory,
    resetFilteredItems,
  } = useCatalogFilter(catalogItems);

  const successAlert = useRef();
  useEffect(() => {
    const toggleAlert = () => successAlert.current.toggleAlert();

    CatalogEvents.on('UPDATE', toggleAlert);
    return () => CatalogEvents.removeListener('UPDATE', toggleAlert);
  }, []);

  return (
    <>
      <HBox tw="lg:hidden p-4 space-x-4">
        <Link href="/ehurt/home">
          <Button tw="flex-1">Wróć</Button>
        </Link>
        <Link href="/ehurt/cart">
          <Button tw="flex-1">Koszyk</Button>
        </Link>
      </HBox>
      <CatalogControls tw="py-4 px-12">
        <NameInput
          ref={itemInputRef}
          type="text"
          className="name-input"
          tw="order-3 lg:order-1"
          placeholder="Szukaj po nazwie"
          onChange={event => filterByName(event.target.value)}
        />
        <ClientOnly>
          <ProgressButton
            containerClass={tw`order-1 lg:order-2`}
            progress={isUpdating}
            onClick={updateCatalog}
            text="Odśwież"
          />
        </ClientOnly>
        <CategorySelect
          className="category-select"
          tw="order-2 lg:order-3"
          onChange={event => {
            itemInputRef.current.value = null;
            if (
              event.target.value &&
              event.target.value !== 'WSZYSTKO'
            )
              filterByCategory(event.target.value);
            else resetFilteredItems();
          }}
        >
          <option>WSZYSTKO</option>
          {categories.map(category => (
            <option key={category}>{category}</option>
          ))}
        </CategorySelect>
      </CatalogControls>

      <CatalogItems
        items={filteredItems}
        groupItems={filteredItems.length !== catalogItems.length}
      />

      <OwnerOnly>
        <HBox tw="py-1 px-4" justify="flex-end">
          <Link href="/ehurt/cart">
            <Button tw="px-24">Przejdź do koszyka</Button>
          </Link>
        </HBox>
      </OwnerOnly>

      <Alert
        tw="ml-20"
        level="SUCCESS"
        ref={successAlert}
        text="Zaktualizowano katalog"
      />
    </>
  );
}

const CatalogItems = React.memo(
  ({items}) => {
    const {role} = useAccount();
    const {
      catalogItems,
      itemsByCategory,
      promotionItems,
    } = useCatalog();

    const {favoriteItems} = useFavorites(15);

    const [detailedItem, setDetailedItem] = useState(null);
    const showItemDetails = item => setDetailedItem(item);

    const [editedItem, setEditedItem] = useState(null);
    const editItem = item => setEditedItem(item);

    const maxHeight = useMedia(
      ['(min-width: 1024px)', '(min-width: 400px)'],
      [role === 'Owner' ? '10rem' : '6rem', '17rem'],
      '6rem',
    );

    const isFilterEnabled = catalogItems.length !== items.length;
    const hasFavoriteItems = favoriteItems.length > 0;
    const hasPromotionItems = promotionItems.length > 0;

    return (
      <>
        <DetailsModal
          item={detailedItem}
          onClick={() => setDetailedItem(null)}
        />
        <div id="main-container" tw="relative max-h-full">
          <ScrollView
            tw="flex-1"
            offset={maxHeight}
            onClick={() => {
              setEditedItem(null);
            }}
          >
            <DetailsContext.Provider value={{showItemDetails}}>
              <QuickEditContext.Provider value={{editItem}}>
                {isFilterEnabled ? (
                  <HBox tw="pt-6 px-1 flex-wrap" justify="center">
                    {items.map(item => (
                      <CatalogItem key={item.id} id={item.id} />
                    ))}
                  </HBox>
                ) : (
                  <>
                    {hasPromotionItems && (
                      <>
                        <CategoryCard>BONUS TYGODNIOWY</CategoryCard>
                        <HBox
                          tw="mx-4 pt-8 flex-wrap"
                          justify="center"
                        >
                          {promotionItems.map(item => (
                            <CatalogItem
                              key={'P' + item.id}
                              id={item.id}
                            />
                          ))}
                        </HBox>
                      </>
                    )}

                    {hasFavoriteItems && (
                      <>
                        <CategoryCard>
                          NAJCZĘŚCIEJ ZAMAWIANE
                        </CategoryCard>
                        <HBox
                          tw="mx-4 pt-8 flex-wrap"
                          justify="center"
                        >
                          {favoriteItems.map(item => (
                            <CatalogItem key={'F' + item} id={item} />
                          ))}
                        </HBox>
                      </>
                    )}

                    {Object.entries(itemsByCategory).map(
                      ([category, categoryItems]) => (
                        <React.Fragment key={category}>
                          <CategoryCard>{category}</CategoryCard>
                          <HBox
                            tw="mx-4 pt-8 flex-wrap"
                            justify="center"
                          >
                            {categoryItems.map(item => (
                              <CatalogItem
                                key={item.id}
                                id={item.id}
                              />
                            ))}
                          </HBox>
                        </React.Fragment>
                      ),
                    )}
                  </>
                )}
              </QuickEditContext.Provider>
            </DetailsContext.Provider>
          </ScrollView>
        </div>
        <QuickEditModal item={editedItem} />
      </>
    );
  },
  (prev, next) => prev.items === next.items,
);

import tw, {styled} from 'twin.macro';

const CatalogControls = tw.div`flex flex-col lg:flex-row items-stretch lg:items-center justify-between`;
const NameInput = tw.input`mt-4 lg:mt-0 px-6 py-4 min-w-0 border border-gray-300 font-medium shadow-md focus:shadow-outline`;
const CategorySelect = styled.select`
  ${tw`mt-4 lg:mt-0 px-12 py-4 text-center bg-white shadow-md font-medium`}

  &:after {
    content: '▼';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    font-size: 60%;
    line-height: 30px;
    padding: 0 7px;
    background: #000;
    color: white;
    pointer-events: none;
  }
`;

const CategoryCard = tw.h5`mx-4 inline-block px-12 py-4 lg:py-6 shadow-xl md:text-xl text-black bg-white border transform translate-x-8 translate-y-6 z-10`;

export default Catalog;
