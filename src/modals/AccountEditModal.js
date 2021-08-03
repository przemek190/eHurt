import React, {useState, useRef} from 'react';
import {useSelector} from 'react-redux';
import tw, {styled} from 'twin.macro';

import {VBox, Text, Button} from '@Ui';
import {TextInput} from '@Ui/Inputs';
import {ProgressButton, Backdrop} from '@Ui/Feedback';
import Alert from '@Ui/Alerts';

import api from '@Utils/api';
import AuthErrors from '@Errors/authErrors';

export default function AccountEdit(props) {
  const {account, onSuccess} = props;
  const isVisible = account !== null;

  const [errorCode, setErrorCode] = useState(null);
  const [showError, setShowError] = useState(false);

  const passwordInputRef = useRef();
  const errorAlert = useRef();

  const token = useSelector(state => state.auth.token);

  const [isChanging, setIsChanging] = useState(false);
  async function changePassword() {
    setIsChanging(true);
    const [success, error] = await api.patch(`/auth`, token, {
      id: account,
      password: passwordInputRef.current.value,
    });
    setIsChanging(false);

    if (error) {
      setShowError(true);
      if (error.code) {
        errorAlert.current.toggleAlert();
        setErrorCode(error.code);
      }
      return false;
    }

    passwordInputRef.current.text = '';

    return true;
  }

  return (
    <>
      <AccountEditBackdrop {...props} visible={isVisible}>
        <VBox
          tw="py-12 px-8 bg-white shadow-md space-y-2"
          items="stretch"
          onClick={e => e.stopPropagation()}
        >
          <Text tw="text-xl">Wpisz nowe hasło</Text>
          <TextInput
            ref={passwordInputRef}
            tw="px-2 py-4 shadow-md"
            password={true}
          />
          <ProgressButton
            progress={isChanging}
            text="Ok"
            onClick={async () => {
              if ((await changePassword()) && onSuccess) onSuccess();
            }}
          />
        </VBox>
      </AccountEditBackdrop>

      <Alert
        tw="ml-20"
        ref={errorAlert}
        level="ERROR"
        text={AuthErrors[errorCode] || 'Nie udało się zmienić hasła'}
      />
    </>
  );
}

const AccountEditBackdrop = styled(Backdrop)`
  ${tw`h-screen fixed`}

  @media screen and (min-width: 1000px) {
    left: 10rem;
    width: calc(100% - 10rem);
  }
`;
