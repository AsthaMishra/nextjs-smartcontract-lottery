import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function Header() {
    const {
        enableWeb3,
        isWeb3Enabled,
        account,
        deactivateWeb3,
        Moralis,
        isWeb3EnableLoading,
    } = useMoralis();

    useEffect(() => {
        if (
            !isWeb3Enabled &&
            typeof window !== "undefined" &&
            window.localStorage.getItem("connected")
        ) {
            enableWeb3();
            // enableWeb3({provider: window.localStorage.getItem("connected")}) // add walletconnect
        }
    }, [isWeb3Enabled]);

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`);
            if (account == null) {
                if (typeof window !== "undefined") {
                    window.localStorage.removeItem("connected");
                    deactivateWeb3();
                }
                console.log("Null Account found");
            }
        });
    }, [deactivateWeb3]);

    return account !== null ? (
        <div>connected !! to {account}</div>
    ) : (
        <button
            onClick={async () => {
                await enableWeb3();
                if (typeof window !== "undefined") {
                    window.localStorage.setItem("connected", "injected");
                }
            }}
            disabled={isWeb3EnableLoading}
        >
            connect
        </button>
    );
}
