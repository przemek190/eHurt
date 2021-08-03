import React, {useRef} from 'react';

import * as R from 'ramda';

import useOrder from '@Hooks/useOrder';
import useAccount from '@Hooks/useAccount';

import {PLN} from '@Utils';
import {OwnerOnly} from './Roles';

import {Card, VBox, HBox, Button, ScrollView, Text} from '@Ui';
import Alert from '@Ui/Alerts';
import {ClientOnly} from '@Components/Roles';
import OrderedItem from '@Components/OrderedItem';

function Order(props) {
  const {order} = props;
  const {
    id,
    status,
    issueDate,
    deliveryDate,
    statusMessage,
    orderedItems = [],

    total,

    clone,
  } = useOrder(order);

  const successAlert = useRef();
  const cloneOrder = () => {
    clone();
    successAlert.current.toggleAlert();
  };

  return (
    <>
      <VBox {...props} items="stretch">
        <OrderStatus tw="mb-2 text-center" status={status}>
          {getStatus(status || '').text}
        </OrderStatus>
        <HBox items="center">
          <Text tw="flex-1">Złożenie zamówienia</Text>
          <Text.SB tw="px-2 whitespace-no-wrap">{issueDate}</Text.SB>
        </HBox>
        <HBox items="center">
          <Text tw="flex-1">Dostawa</Text>
          <Text.SB tw="px-2 whitespace-no-wrap">
            {deliveryDate}
          </Text.SB>
        </HBox>
        {statusMessage && (
          <>
            <div tw="my-2 h-2 w-2/3 bg-brown" />
            <Text.SB tw="px-2 text-center">{statusMessage}</Text.SB>
          </>
        )}
        <div tw="my-2 h-2 w-2/3 bg-brown" />
        <ScrollView
          tw="flex-1 px-1 overflow-auto min-h-0"
          offset="6rem"
        >
          <VBox items="stretch">
            {orderedItems.map(item => (
              <OrderedItem key={item.id} item={item} />
            ))}
          </VBox>
        </ScrollView>
        <div tw="relative">
          <Text tw="absolute bottom-0 left-0 py-1">
            Prognozowana suma netto:{' '}
          </Text>
          <Text.SB tw="px-2 text-right">{PLN(total)}zł</Text.SB>
        </div>
        <ClientOnly>
          <Button tw="hidden lg:block border" onClick={cloneOrder}>
            Skopiuj do koszyka
          </Button>
        </ClientOnly>
      </VBox>

      <Alert
        level="SUCCESS"
        ref={successAlert}
        text="Dodano produkty do koszyka"
      />
    </>
  );
}

export const OrderHeader = React.memo(props => {
  const {order} = props;
  const {id, user_id, status} = order;

  return (
    <HBox tw="py-6 px-4 bg-white shadow-md" {...props}>
      <Text.SB tw="flex-1">#{id || ''}</Text.SB>
      <OwnerOnly>
        <UserStatus tw="mr-4" user={user_id}>
          {user_id || ''}
        </UserStatus>
      </OwnerOnly>
      <OrderStatus status={status}>
        {getStatus(status || '').text}
      </OrderStatus>
    </HBox>
  );
});

const UNKNOWN_STATUS = {text: 'Nieznany', color: 'gray'};

const ORDER_STATUS = {
  WAITING: {text: 'Czeka na wysłanie', color: '#41A4AF'},
  SENDING: {text: 'Wysyłanie', color: 'lightblue'},
  FAILED: {text: 'Odrzucono', color: 'red'},
  PROCESSING: {text: 'Przetwarzanie', color: 'orange'},
  COMPLETING: {text: 'W realizacji', color: '#FDCA01'},
  COMPLETED: {text: 'Zrealizowano', color: 'lightgreen'},
  DELIVERING: {text: 'Dostarczanie', color: '#D1A97F'},
  DELIVERED: {text: 'Dostarczono', color: 'green'},
};

const getStatus = status =>
  R.propOr(UNKNOWN_STATUS, status, ORDER_STATUS);

import {getMemoizedColor} from '@Utils/colors';

import tw, {styled} from 'twin.macro';

const UserStatus = styled.div`
  ${tw`font-bold px-4 py-2 text-sm`}
  ${({user}) => `background-color: ${getMemoizedColor(user)};`}
`;

const OrderStatus = styled.div`
  ${tw`px-4 py-2 text-sm font-bold`}
  ${({status}) => `background-color: ${getStatus(status).color};`}
`;

export default Order;
