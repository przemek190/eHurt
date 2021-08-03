import React, {useState, useEffect, useMemo, useRef} from 'react';

import Router from 'next/router';

import * as R from 'ramda';

import {VBox, HBox, Button, Card, Text} from '@Ui';
import Table, {
  Column as TableColumn,
  Cell as TableCell,
} from '@Ui/Table';
import {ProgressButton} from '@Ui/Feedback';
import Alert from '@Ui/Alerts';

import usePayments from '@Hooks/usePayments';
import usePayment from '@Hooks/usePayment';

import {PaymentsEvents} from '@Events';

import {getMemoizedColor} from '@Utils/colors';

function Finance() {
  const {
    payments,
    overduePayments,
    deposits,

    paymentsUnpaidTotal,
    paymentsOverdueUnpaidTotal,

    updatePayments,
    isUpdating: isUpdatingPayments,
  } = usePayments();

  const [orderBy, setOrder] = useState(null);
  const visiblePayments = useMemo(
    () =>
      R.pipe(
        R.filter(payment => payment.type !== 'Deposit'),
        R.sortBy(R.prop(orderBy ? orderBy : 'issue_date')),
      )(payments),
    [orderBy, payments],
  );

  const successAlert = useRef();
  useEffect(() => {
    const toggleAlert = () => successAlert.current.toggleAlert();
    PaymentsEvents.on('UPDATE', toggleAlert);
    return () => PaymentsEvents.removeListener('UPDATE', toggleAlert);
  }, []);

  return (
    <>
      <VBox tw="h-full p-4 lg:p-12" items="stretch">
        <Button
          tw="lg:hidden"
          onClick={() => Router.push('/ehurt/home')}
        >
          Wróć do ekranu głównego
        </Button>

        <Card tw="relative px-4 pt-8 pb-4 mt-12 lg:mt-0 bg-white shadow-md">
          <SectionHeading tw="transform -translate-x-2 -translate-y-8 font-medium">
            Twoje Dokumenty
          </SectionHeading>

          <VBox tw="lg:flex-row space-y-4" items="stretch">
            <ProgressButton
              tw="h-full"
              text="Odśwież"
              progress={isUpdatingPayments}
              onClick={updatePayments}
            />
            <div tw="flex-1" />
            <VBox tw="space-y-1" items="stretch">
              <HBox>
                <Text tw="flex-1 px-4">Zaległe faktury</Text>
                <Text>{payments.length}</Text>
              </HBox>
              <HBox>
                <Text tw="flex-1 px-4">Po terminie</Text>
                <Text>{overduePayments.length}</Text>
              </HBox>
            </VBox>
            <VBox tw="space-y-1 lg:mt-0" items="stretch">
              <HBox>
                <Text tw="flex-1 px-4 text-left">Do spłaty</Text>
                <Text>{paymentsUnpaidTotal}zł</Text>
              </HBox>
              <HBox>
                <Text tw="flex-1 px-4 text-left">Po terminie</Text>
                <Text>{paymentsOverdueUnpaidTotal}zł</Text>
              </HBox>
            </VBox>
          </VBox>
        </Card>
        <div tw="relative p-4 shadow-inner bg-gray-100">
          <Table
            tw="bg-white shadow-md"
            onOrderChange={order => setOrder(order)}
          >
            <Column field="type">
              TYP
              <br /> DOKUMENTU
            </Column>
            <Column field="id">IDENTYFIKATOR</Column>
            <Column field="target">
              SKLEP
              <br /> DOCELOWY
            </Column>
            <Column field="issue_date">DATA WYSTAWIENIA</Column>
            <Column field="payment_term">TERMIN</Column>
            <Column field="value">
              WARTOŚĆ
              <br /> FAKTURY
            </Column>
            <Column field="paid_value">WPŁATA</Column>
            <Column field="estimated_value">POZOSTAŁO</Column>

            {visiblePayments.map(item => (
              <Payment key={item.id} id={item.id} />
            ))}

            {deposits.length > 0 && (
              <Text tw="mt-4 py-4 col-span-8 text-center">
                DEPOZYTY
              </Text>
            )}

            {deposits.map(item => (
              <Payment key={item.id} id={item.id} />
            ))}
          </Table>
        </div>
      </VBox>

      <Alert
        ref={successAlert}
        level="SUCCESS"
        text="Zaktualizowano faktury"
      />
    </>
  );
}

function Payment({id}) {
  const item = usePayment(id);
  const {
    type,
    issueDate,
    paymentTerm,
    isOverdue,
    receiverId,
    paidValue,
    estimatedValueToPay,
    value,
  } = item;

  return (
    <>
      <Cell>{type}</Cell>
      <Cell>{id}</Cell>
      <Cell
        tw="px-4 py-2 leading-10"
        style={{backgroundColor: getMemoizedColor(receiverId)}}
      >
        {receiverId}
      </Cell>
      <Cell>{issueDate}</Cell>
      <Cell css={[isOverdue && tw`text-red-600`]}>{paymentTerm}</Cell>
      <Cell>
        {value} {item.currency}
      </Cell>
      <Cell>
        {paidValue} {item.currency}
      </Cell>
      <Cell>
        {estimatedValueToPay} {item.currency}
      </Cell>
    </>
  );
}

import tw, {styled} from 'twin.macro';

const SectionHeading = tw.h5`inline-block absolute top-0 left-0 p-4 text-center bg-white shadow-md`;

const Column = styled(TableColumn)`
  ${tw`py-4 px-1 text-xs xl:text-base text-center border-b border-r cursor-pointer`}
`;
const Cell = styled(TableCell)`
  ${tw`py-4 px-1 text-xs lg:text-base text-center border-b border-r`}
`;

export default Finance;
