import { useReducer, useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';
const initalState = {
  isLoading: true,
  error: false,
  user: null
}
function reducer(state, action) {
  switch(action.type) {
    case 'init':
      return { ...state, isLoading: true, error: false }
    case 'success':
      return { ...state, isLoading: false, error: false, user: action.user }
    case 'reset':
      return { ...state, user: null }
    case 'error':
      return { ...state, isLoading: false, error: true }
    default:
      new Error();
  }
}
function useAmplifyAuth() {
  const [state, dispatch] = useReducer(reducer, initalState);
  const [fetchTrigger, setFetchTrigger] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      if (isMounted) {
        dispatch({ type: 'init' });
      }
      try {
        if (isMounted) {
          const authData = await Auth.currentUserInfo();
          if (authData) {
            dispatch({ type: 'success', user: authData });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('[ERROR - useAmplifyAuth]', error);
          dispatch({ type: 'error' });
        }
      }
    };
    const HubListener = () => {
      Hub.listen('auth', data => {
        const { payload } = data;
        onAuthEvent(payload);
      });
    };
    const onAuthEvent = (payload) => {
      switch(payload.event) {
        case 'signIn':
          // on signin, we want to rerun effect, trigger via flag
          if (isMounted) { setFetchTrigger(true); }
          break;
        default:
          // ignore anything else
          return;
      }
    };
    HubListener();
    fetchUser();
    // on tear down...
    return () => {
      Hub.remove('auth');
      isMounted = false;
    }
  }, [fetchTrigger]);
  const onSignOut = async () => {
    try {
      await Auth.signOut();
      setFetchTrigger(false);
      dispatch({ type: 'reset' })
    } catch (error) {
      console.error('[ERROR - useAmplifyAuth]', error);
    }
  };
  return { state, onSignOut };
}
export default useAmplifyAuth;