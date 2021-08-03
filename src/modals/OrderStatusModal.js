import React, {useState, useMemo, useEffect} from 'react';
import {useSelector} from 'react-redux';

import Router from 'next/router';

import * as R from 'ramda';

import tw, {styled} from 'twin.macro';
import {motion, AnimatePresence} from 'framer-motion';

import {VBox, HBox, Button, Text} from '@Ui';
import {Spinner, Backdrop} from '@Ui/Feedback';

export default function OrderStatus(props) {
  const isSending = useSelector(state => state.orders.sending);
  const sendingError = useSelector(
    state => state.orders.sending_error,
  );

  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    if (isSending || sendingError) setVisible(true);
  }, [isSending, sendingError]);

  const errorStatus = useMemo(() => {
    const UNKNOWN_STATUS = {
      title: 'Nie udało się wysłać zamówienia',
      message:
        'Serwer lub połączenie może byc aktualnie niedostępne lub wystąpił nieoczekiwany błąd, spróbuj ponownie później',
    };

    try {
      return R.defaultTo(UNKNOWN_STATUS, STATUSES[sendingError.code]);
    } catch {}

    return UNKNOWN_STATUS;
  }, [sendingError]);

  return (
    <StatusBackdrop {...props} visible={isVisible}>
      <Status>
        <AnimatePresence>
          {isSending && <Spinner tw="h-64 w-64" />}
          {!isSending && (
            <VBox tw="mx-8 p-4 bg-white rounded">
              <Text.M tw="border-b text-2xl">
                {sendingError
                  ? errorStatus.title
                  : 'Wysłano zamówienie'}
              </Text.M>
              <Text tw="py-4 max-w-xl text-center">
                {sendingError
                  ? errorStatus.message
                  : 'Zamówienie zostało wysłane pomyślnie. Stan twojego zamówienia możesz sprawdzić w twoich zamówieniach'}
              </Text>
              <HBox items="stretch">
                <Button
                  tw="px-24"
                  onClick={
                    sendingError
                      ? () => setVisible(false)
                      : () => Router.push('/ehurt/orders')
                  }
                >
                  {sendingError ? 'OK' : 'Przejdź do zamówień'}
                </Button>
              </HBox>
              {sendingError && (
                <Text.B>
                  Kod błędu: {sendingError?.code || 'Nieznany'}
                </Text.B>
              )}
            </VBox>
          )}
        </AnimatePresence>
      </Status>
    </StatusBackdrop>
  );
}

const StatusBackdrop = styled(Backdrop)`
  ${tw`h-screen fixed`}

  @media screen and (min-width: 1000px) {
    left: 10rem;
    width: calc(100% - 10rem);
  }
`;

const Status = styled(motion.div)`
  ${tw`flex flex-col`}
  min-width: 300px;
`;

const STATUSES = {
  ORD1: {
    title: 'PUSTE ZAMÓWIENIE',
    message:
      'Twoje zamówienie nie zawiera ani jednego produktu. Dodaj jakiś produkt z katalogu i spróbuj ponownie.',
  },
  ORD3: {
    title: 'NIE ZNALEZIONO PRODUKTÓW',
    message:
      'Twoje zamówienie zawiera produkty które nie istnieją w katalogu. Nie znalezione produkty zostały zaznaczone na czerwono, proszę usunąc je z koszyka przed ponowną próbą wysłania',
  },
  ORD4: {
    title: 'CENY PRODUKTÓW SIĘ NIE ZGADZAJĄ',
    message:
      'Twoje zamówienie zawiera ceny niezgodne z aktualnym katalogiem produktów, nowe ceny zostały podświetlone na zielono, a stare na czerwono',
  },
  ORD8: {
    title: 'NIEAKTYWNY KLIENT',
    message:
      'Twoje konto nie zostało jeszcze aktywowane. Jeżeli jesteś nowym klientem spróbuj ponownie następnego dnia, w innym wypadku spróbuj ponownie później (szacowany czas aktualizacji klientów powinien trwać do godziny od utworzenia konta)',
  },
};
